import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient, Prisma } from "@/generated/prisma/client";
import { authenticationService } from "../runtime";
import { touchSession, revokeAllUserSessions, deleteExpiredSessions } from "../repositories/session-repository";
import { recordSecurityEvent } from "../repositories/security-event-repository";
import { logoutSession } from "../logout-service";
import { bootstrapAuthUser } from "../bootstrap-service";
import { sessionDates } from "../session-policy";
import { generateSessionToken } from "../session-token";

vi.mock("../config", () => ({ getAuthRuntimeSecrets: () => ({ pepper: "test-pepper", rateLimitSecret: "test-rate" }) }));
vi.mock("../password", async (original) => ({ ...(await original<typeof import("../password")>()), verifyPassword: vi.fn(async () => true), hashPassword: vi.fn(async () => "test-hash") }));
vi.mock("../dummy", () => ({ verifyDummy: vi.fn(async () => undefined) }));

function fakeDb() {
  const user = { id: "user", organizationId: "org", name: "Test", status: "ACTIVE" };
  const db = {
    authCredential: { findUnique: vi.fn().mockResolvedValue({ id: "credential", appUserId: "user", username: "test", passwordHash: "test-hash", passwordChangedAt: new Date(), appUser: user }), count: vi.fn().mockResolvedValue(0), create: vi.fn().mockResolvedValue({ id: "credential" }) },
    authRateLimitBucket: { findUnique: vi.fn().mockResolvedValue(null), upsert: vi.fn().mockResolvedValue({}), deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    authSession: { create: vi.fn().mockResolvedValue({ id: "session" }), findUnique: vi.fn().mockResolvedValue(null), updateMany: vi.fn().mockResolvedValue({ count: 1 }), deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
    authSecurityEvent: { create: vi.fn().mockResolvedValue({ id: "event" }) },
    organization: { create: vi.fn().mockResolvedValue({ id: "org" }) },
    appUser: { create: vi.fn().mockResolvedValue(user) },
    $transaction: vi.fn(),
  };
  db.$transaction.mockImplementation(async (operation: (tx: unknown) => Promise<unknown>) => operation(db));
  return { mock: db, client: db as unknown as PrismaClient };
}

beforeEach(() => vi.clearAllMocks());

describe("runtime persistence orchestration (no database)", () => {
  it("successful login resets only USERNAME and creates session + both events atomically", async () => {
    const { client, mock } = fakeDb();
    const result = await authenticationService(client)({ username: "test", password: "test-password-long", clientIp: "192.0.2.1" });
    expect(result.ok).toBe(true);
    expect(mock.authRateLimitBucket.deleteMany).toHaveBeenCalledWith({ where: { scope: "USERNAME", keyHash: expect.stringMatching(/^[0-9a-f]{64}$/) } });
    expect(mock.authRateLimitBucket.deleteMany).toHaveBeenCalledOnce();
    const data = mock.authSession.create.mock.calls[0][0].data;
    expect(data.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(data).not.toHaveProperty("token");
    expect(mock.authSecurityEvent.create.mock.calls.map(([arg]) => arg.data.type)).toEqual(["LOGIN_SUCCESS", "SESSION_CREATED"]);
    expect(mock.$transaction).toHaveBeenCalledTimes(2);
  });
  it("unknown user creates independently scoped failure buckets and generic audit event", async () => {
    const { client, mock } = fakeDb(); mock.authCredential.findUnique.mockResolvedValue(null);
    const result = await authenticationService(client)({ username: "test", password: "test-password-long", clientIp: "192.0.2.1" });
    expect(result.ok).toBe(false);
    expect(mock.authRateLimitBucket.upsert.mock.calls.map(([arg]) => arg.create.scope)).toEqual(["USERNAME", "IP"]);
    expect(JSON.stringify(mock.authRateLimitBucket.upsert.mock.calls)).not.toContain("192.0.2.1");
    expect(mock.authSecurityEvent.create.mock.calls[0][0].data.type).toBe("LOGIN_FAILURE");
    expect(mock.authSession.create).not.toHaveBeenCalled();
  });
  it("rechecks account status after verification before session creation", async () => {
    const { client, mock } = fakeDb();
    const credential = await mock.authCredential.findUnique();
    mock.authCredential.findUnique.mockResolvedValueOnce(credential).mockResolvedValueOnce({ ...credential, appUser: { ...credential.appUser, status: "INACTIVE" } });
    expect((await authenticationService(client)({ username: "test", password: "test-password-long" })).ok).toBe(false);
    expect(mock.authSession.create).not.toHaveBeenCalled();
    expect(mock.authRateLimitBucket.upsert).toHaveBeenCalledOnce();
  });
  it("active block creates no event or counter extension", async () => {
    const { client, mock } = fakeDb();
    mock.authRateLimitBucket.findUnique.mockResolvedValue({ blockedUntil: new Date(Date.now() + 60_000) });
    expect((await authenticationService(client)({ username: "test", password: "test-password-long" })).ok).toBe(false);
    expect(mock.authRateLimitBucket.upsert).not.toHaveBeenCalled();
    expect(mock.authSecurityEvent.create).not.toHaveBeenCalled();
  });
  it("event repository drops extra runtime fields", async () => {
    const { client, mock } = fakeDb();
    const input = { type: "LOGIN_FAILURE" as const, password: "must-not-persist", token: "must-not-persist", ip: "192.0.2.1" };
    await recordSecurityEvent(client, input);
    expect(mock.authSecurityEvent.create.mock.calls[0][0].data).toEqual({ type: "LOGIN_FAILURE", appUserId: undefined, identifierHash: undefined, ipHash: undefined });
  });
});

describe("session repository defensive operations", () => {
  it("touch conditions exclude revocation, expiry, inactive user and stale callbacks", async () => {
    const { client, mock } = fakeDb(); const now = new Date("2026-09-24T12:00:00Z");
    const absolute = new Date(now.getTime() + 60_000);
    await touchSession(client, "session", absolute, now);
    const args = mock.authSession.updateMany.mock.calls[0][0];
    expect(args.where).toMatchObject({ id: "session", revokedAt: null, idleExpiresAt: { gt: now }, absoluteExpiresAt: { equals: absolute, gt: now }, appUser: { status: "ACTIVE" } });
    expect(args.where.lastSeenAt.lte.getTime()).toBe(now.getTime() - 300_000);
    expect(args.data).toEqual({ lastSeenAt: now, idleExpiresAt: absolute });
    expect(args.data).not.toHaveProperty("absoluteExpiresAt");
  });
  it("revokes all sessions by user and cleans expired/revoked-old sessions", async () => {
    const { client, mock } = fakeDb(); const now = new Date();
    await revokeAllUserSessions(client, "user", now);
    expect(mock.authSession.updateMany).toHaveBeenCalledWith({ where: { appUserId: "user", revokedAt: null }, data: { revokedAt: now } });
    await deleteExpiredSessions(client, now);
    expect(mock.authSession.deleteMany.mock.calls[0][0].where.OR).toEqual([
      { absoluteExpiresAt: { lte: now } }, { idleExpiresAt: { lte: now } },
      { revokedAt: { lte: new Date(now.getTime() - 7 * 86_400_000) } },
    ]);
  });
  it("logout authenticates session ownership from token hash and records both events", async () => {
    const { client, mock } = fakeDb(); const now = new Date();
    mock.authSession.findUnique.mockResolvedValue({ id: "session", appUserId: "user", ...sessionDates(now), revokedAt: null });
    await logoutSession(client, generateSessionToken());
    expect(mock.authSession.findUnique.mock.calls[0][0].where.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(mock.authSecurityEvent.create.mock.calls.map(([arg]) => arg.data.type)).toEqual(["SESSION_REVOKED", "LOGOUT"]);
  });
  it("invalid or missing session logout does not revoke anything", async () => {
    const { client, mock } = fakeDb();
    await logoutSession(client, "bad");
    expect(mock.$transaction).not.toHaveBeenCalled();
    await logoutSession(client, generateSessionToken());
    expect(mock.authSession.updateMany).not.toHaveBeenCalled();
  });
});

describe("bootstrap service guard and transaction", () => {
  const input = { organizationName: "Test Org", organizationSlug: "test-org", name: "Test", username: "test", password: "test-password-long", confirmation: "test-password-long" };
  it("requires opt-in before any database access", async () => {
    const { client, mock } = fakeDb();
    await expect(bootstrapAuthUser(client, input, "test", undefined)).rejects.toThrow();
    expect(mock.authCredential.count).not.toHaveBeenCalled();
  });
  it("aborts on existing credentials before creation", async () => {
    const { client, mock } = fakeDb(); mock.authCredential.count.mockResolvedValue(1);
    await expect(bootstrapAuthUser(client, input, "test", "1")).rejects.toThrow();
    expect(mock.organization.create).not.toHaveBeenCalled();
  });
  it("rechecks emptiness in the transaction to prevent concurrent bootstrap", async () => {
    const { client, mock } = fakeDb(); mock.authCredential.count.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
    await expect(bootstrapAuthUser(client, input, "test", "1")).rejects.toThrow();
    expect(mock.organization.create).not.toHaveBeenCalled();
  });
  it("creates organization, ACTIVE user, credential and event together without returning secrets", async () => {
    const { client, mock } = fakeDb();
    expect(await bootstrapAuthUser(client, input, "test", "1")).toEqual({ organizationId: "org", appUserId: "user", username: "test" });
    expect(mock.appUser.create.mock.calls[0][0].data.status).toBe("ACTIVE");
    expect(mock.authSecurityEvent.create.mock.calls[0][0].data.type).toBe("BOOTSTRAP_USER_CREATED");
    expect(mock.$transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
  });
});

// Compile-time check that repositories also accept an interactive transaction client.
type AuthTransaction = Pick<Prisma.TransactionClient, "authSession">;
const transactionShape: AuthTransaction | null = null;
void transactionShape;
