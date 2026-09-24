import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import { issueSessionCookie } from "../cookie-issuance";
import { compensateSessionIssuance } from "../session-compensation";
import { generateSessionToken, hashSessionToken } from "../session-token";
import { reportAuthFailure } from "../logging";
import { LOGIN_ERROR } from "../constants";
import { cleanupAuthSessions } from "../cleanup-service";

afterEach(() => vi.restoreAllMocks());

describe("cookie issuance compensation", () => {
  function issuedSession() {
    const token = generateSessionToken();
    const session = { id: "session", appUserId: "user", createdAt: new Date(), revokedAt: null };
    const db = {
      authSession: { findUnique: vi.fn().mockResolvedValue(session), updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      authSecurityEvent: { create: vi.fn().mockResolvedValue({ id: "event" }) },
      $transaction: vi.fn(),
    };
    db.$transaction.mockImplementation(async (operation: (tx: unknown) => Promise<unknown>) => operation(db));
    return { token, db, client: db as unknown as PrismaClient };
  }
  it("revokes an issued session, records only SESSION_REVOKED, clears cookie and returns generic error", async () => {
    const { token, db, client } = issuedSession();
    const output = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const clear = vi.fn(async () => undefined);
    const result = await issueSessionCookie(token, {
      set: async () => { throw new Error(`sensitive internal error ${token}`); },
      compensate: (value) => compensateSessionIssuance(client, value), clear, report: reportAuthFailure,
    });
    expect(result).toEqual({ ok: false, message: LOGIN_ERROR });
    expect(db.authSession.findUnique.mock.calls[0][0].where).toEqual({ tokenHash: hashSessionToken(token) });
    expect(db.authSession.updateMany).toHaveBeenCalledWith({ where: { id: "session", revokedAt: null }, data: { revokedAt: expect.any(Date) } });
    expect(db.authSecurityEvent.create.mock.calls.map(([args]) => args.data.type)).toEqual(["SESSION_REVOKED"]);
    expect(clear).toHaveBeenCalledOnce();
    expect(output.mock.calls).toEqual([["[cartevy.auth] session_cookie_write_failed"]]);
    expect(JSON.stringify([result, output.mock.calls, db.authSecurityEvent.create.mock.calls])).not.toContain(token);
  });
  it("does not compensate or clear on success, and returns no token", async () => {
    const deps = { set: vi.fn(async () => undefined), compensate: vi.fn(async () => undefined), clear: vi.fn(async () => undefined), report: vi.fn() };
    expect(await issueSessionCookie(generateSessionToken(), deps)).toEqual({ ok: true });
    expect(deps.compensate).not.toHaveBeenCalled(); expect(deps.clear).not.toHaveBeenCalled(); expect(deps.report).not.toHaveBeenCalled();
  });
  it("compensation and deletion failures expose only stable codes and still return LOGIN_ERROR", async () => {
    const token = generateSessionToken();
    const output = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fail = async () => { throw new Error(token); };
    expect(await issueSessionCookie(token, { set: fail, compensate: fail, clear: fail, report: reportAuthFailure })).toEqual({ ok: false, message: LOGIN_ERROR });
    expect(output.mock.calls).toEqual([
      ["[cartevy.auth] session_cookie_write_failed"],
      ["[cartevy.auth] session_cookie_compensation_failed"],
      ["[cartevy.auth] session_cookie_delete_failed"],
    ]);
    expect(JSON.stringify(output.mock.calls)).not.toContain(token);
  });
  it.each(["missing", "already-revoked"])("compensation of %s session produces no duplicate event", async (state) => {
    const { token, db, client } = issuedSession();
    if (state === "missing") db.authSession.findUnique.mockResolvedValue(null);
    else db.authSession.updateMany.mockResolvedValue({ count: 0 });
    await compensateSessionIssuance(client, token);
    expect(db.authSecurityEvent.create).not.toHaveBeenCalled();
  });
});

describe("auth cleanup without a database", () => {
  it("requires buckets older than 24h AND no active block; preserves security events", async () => {
    const now = new Date("2026-09-24T12:00:00Z");
    const db = {
      authSession: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
      authRateLimitBucket: { deleteMany: vi.fn().mockResolvedValue({ count: 3 }) },
      authSecurityEvent: { deleteMany: vi.fn() },
    };
    expect(await cleanupAuthSessions(db as unknown as PrismaClient, now)).toEqual({ sessionsRemoved: 2, rateLimitBucketsRemoved: 3 });
    expect(db.authRateLimitBucket.deleteMany).toHaveBeenCalledWith({ where: {
      updatedAt: { lt: new Date("2026-09-23T12:00:00Z") },
      OR: [{ blockedUntil: null }, { blockedUntil: { lte: now } }],
    } });
    expect(db.authSecurityEvent.deleteMany).not.toHaveBeenCalled();
  });
});
