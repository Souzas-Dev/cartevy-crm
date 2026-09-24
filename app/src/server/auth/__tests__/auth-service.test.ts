import { describe, expect, it, vi } from "vitest";
import { createAuthenticationService, type AuthenticationDependencies } from "../authentication-service";
import { resolveAuthContext } from "../context-service";
import { hashSessionToken, generateSessionToken } from "../session-token";
import { sessionDates } from "../session-policy";
import { LOGIN_ERROR } from "../constants";
import type { Credential, Session } from "../types";
import { serializable } from "../transaction";
import type { PrismaClient } from "@/generated/prisma/client";

const now = new Date("2026-09-24T12:00:00Z");
const credential: Credential = {
  id: "credential", appUserId: "user", username: "test.user", passwordHash: "test-hash", passwordChangedAt: now,
  appUser: { id: "user", name: "Test", organizationId: "server-org", status: "ACTIVE" },
};

function dependencies() {
  return {
    secrets: () => ({ pepper: "test-only-pepper", rateLimitSecret: "test-only-rate-secret" }), now: () => now,
    admit: vi.fn().mockResolvedValue({ admitted: true, failureCount: 1, newlyBlocked: false }), findCredential: vi.fn().mockResolvedValue(credential),
    verify: vi.fn().mockResolvedValue(true), dummy: vi.fn().mockResolvedValue(undefined),
    failure: vi.fn().mockResolvedValue(undefined),
    complete: vi.fn().mockResolvedValue(true),
  } satisfies AuthenticationDependencies;
}
const input = { username: " TEST.USER ", password: "test-password-long", clientIp: "192.0.2.1" };

describe("authentication service", () => {
  it("normalizes username, creates a session and returns only raw cookie token", async () => {
    const deps = dependencies();
    const result = await createAuthenticationService(deps)(input);
    expect(deps.findCredential).toHaveBeenCalledWith("test.user");
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected login success");
    expect(Object.keys(result).sort()).toEqual(["ok", "token"]);
    expect(deps.complete.mock.calls[0][1]).toBe(hashSessionToken(result.token));
    expect(deps.complete.mock.calls[0][1]).not.toBe(result.token);
    expect(deps.complete.mock.calls[0][2]).toEqual({ identifierHash: expect.stringMatching(/^[0-9a-f]{64}$/), ipHash: expect.stringMatching(/^[0-9a-f]{64}$/) });
  });
  it("rejects wrong password with a generic error and records failure", async () => {
    const deps = dependencies(); deps.verify.mockResolvedValue(false);
    expect(await createAuthenticationService(deps)(input)).toEqual({ ok: false, message: LOGIN_ERROR });
    expect(deps.failure).toHaveBeenCalledOnce(); expect(deps.complete).not.toHaveBeenCalled();
  });
  it("verifies dummy for missing user", async () => {
    const deps = dependencies(); deps.findCredential.mockResolvedValue(null);
    expect(await createAuthenticationService(deps)(input)).toEqual({ ok: false, message: LOGIN_ERROR });
    expect(deps.dummy).toHaveBeenCalledWith(input.password, "test-only-pepper");
    expect(deps.failure).toHaveBeenCalledOnce();
  });
  it("verifies the real password before rejecting INACTIVE", async () => {
    const deps = dependencies(); deps.findCredential.mockResolvedValue({ ...credential, appUser: { ...credential.appUser, status: "INACTIVE" } });
    expect(await createAuthenticationService(deps)(input)).toEqual({ ok: false, message: LOGIN_ERROR });
    expect(deps.verify).toHaveBeenCalledOnce(); expect(deps.complete).not.toHaveBeenCalled();
  });
  it("blocked requests skip Argon2 and produce no failure event", async () => {
    const deps = dependencies(); deps.admit.mockResolvedValue({ admitted: false, failureCount: 5, newlyBlocked: false });
    expect(await createAuthenticationService(deps)(input)).toEqual({ ok: false, message: LOGIN_ERROR });
    expect(deps.failure).not.toHaveBeenCalled(); expect(deps.verify).not.toHaveBeenCalled();
    expect(deps.findCredential).not.toHaveBeenCalled();
  });
  it("bounds input before secrets, database or crypto", async () => {
    const deps = dependencies();
    for (const invalid of [{ username: "x".repeat(257) }, { password: "x".repeat(257) }, { password: null }, { username: {} }]) {
      expect(await createAuthenticationService(deps)({ ...input, ...invalid })).toEqual({ ok: false, message: LOGIN_ERROR });
    }
    expect(deps.admit).not.toHaveBeenCalled();
  });
  it("performs dummy work for invalid canonical usernames and short passwords", async () => {
    const deps = dependencies();
    await createAuthenticationService(deps)({ ...input, username: "bad user", password: "short" });
    expect(deps.findCredential).not.toHaveBeenCalled(); expect(deps.dummy).toHaveBeenCalledOnce();
  });
  it("uses username protection when no trusted IP exists", async () => {
    const deps = dependencies(); await createAuthenticationService(deps)({ ...input, clientIp: null });
    expect(deps.admit.mock.calls[0][0].ipHash).toBeNull();
  });
  it("does not return token on failed final transactional recheck", async () => {
    const deps = dependencies(); deps.complete.mockResolvedValue(false);
    expect(await createAuthenticationService(deps)(input)).toEqual({ ok: false, message: LOGIN_ERROR });
  });
  it("does not downgrade an internal crypto failure to a wrong password", async () => {
    const deps = dependencies(); deps.verify.mockRejectedValue(new Error("internal"));
    await expect(createAuthenticationService(deps)(input)).rejects.toThrow("internal");
    expect(deps.failure).not.toHaveBeenCalled();
  });
});

describe("AuthContext resolver", () => {
  const session: Session = { id: "session", appUserId: "user", ...sessionDates(now), revokedAt: null, appUser: credential.appUser };
  it.each([undefined, "bad", "x".repeat(44), "x".repeat(43) + "\n"])("invalid token is unauthenticated without database access", async (token) => {
    const find = vi.fn(); expect(await resolveAuthContext(token, find, now, vi.fn())).toBeNull(); expect(find).not.toHaveBeenCalled();
  });
  it("derives a minimal context exclusively from the persisted AppUser", async () => {
    const token = generateSessionToken(); const find = vi.fn().mockResolvedValue(session); const schedule = vi.fn();
    expect(await resolveAuthContext(token, find, now, schedule)).toEqual({ sessionId: "session", appUserId: "user", organizationId: "server-org", name: "Test" });
    expect(find).toHaveBeenCalledWith(hashSessionToken(token)); expect(schedule).not.toHaveBeenCalled();
  });
  it("schedules touch without doing an UPDATE in the render resolver", async () => {
    const schedule = vi.fn();
    await resolveAuthContext(generateSessionToken(), async () => session, new Date(now.getTime() + 5 * 60_000), schedule);
    expect(schedule).toHaveBeenCalledWith(session);
  });
  it.each([null, { ...session, revokedAt: now }, { ...session, idleExpiresAt: now }, { ...session, appUser: { ...session.appUser, status: "INACTIVE" as const } }])("invalid stored session does not schedule touch", async (value) => {
    const schedule = vi.fn();
    expect(await resolveAuthContext(generateSessionToken(), async () => value, now, schedule)).toBeNull();
    expect(schedule).not.toHaveBeenCalled();
  });
});

describe("serializable retries", () => {
  it.each(["P2034", "P2002"])("retries concurrent conflict %s", async (code) => {
    const transaction = vi.fn().mockRejectedValueOnce({ code }).mockResolvedValue("ok");
    expect(await serializable({ $transaction: transaction } as unknown as PrismaClient, async () => "ok")).toBe("ok");
    expect(transaction).toHaveBeenCalledTimes(2);
    expect(transaction.mock.calls[0][1]).toEqual({ isolationLevel: "Serializable" });
  });
  it("does not hide other errors or retry indefinitely", async () => {
    const operation = async () => "ok";
    const permanent = vi.fn().mockRejectedValue({ code: "P2034" });
    await expect(serializable({ $transaction: permanent } as unknown as PrismaClient, operation)).rejects.toEqual({ code: "P2034" });
    expect(permanent).toHaveBeenCalledTimes(5);
    const other = vi.fn().mockRejectedValue(new Error("unavailable"));
    await expect(serializable({ $transaction: other } as unknown as PrismaClient, operation)).rejects.toThrow("unavailable");
    expect(other).toHaveBeenCalledOnce();
  });
});
