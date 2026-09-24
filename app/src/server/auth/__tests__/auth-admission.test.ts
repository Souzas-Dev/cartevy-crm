import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import { authenticationService } from "../runtime";
import { nextUsernameAttempt, nextIpFailure, type Bucket } from "../rate-limit-policy";
import { verifyPassword } from "../password";
import { verifyDummy } from "../dummy";
import { LOGIN_ERROR } from "../constants";

vi.mock("../config", () => ({ getAuthRuntimeSecrets: () => ({ pepper: "test-pepper", rateLimitSecret: "test-rate" }) }));
vi.mock("../password", async (original) => ({ ...(await original<typeof import("../password")>()), verifyPassword: vi.fn() }));
vi.mock("../dummy", () => ({ verifyDummy: vi.fn(async () => undefined) }));

const t0 = new Date("2026-09-24T12:00:00Z");
const at = (minutes: number) => new Date(t0.getTime() + minutes * 60_000);
const input = { username: "test", password: "test-password-long" };
const rejected = { ok: false, message: LOGIN_ERROR };

function fixture() {
  const buckets = new Map<string, Bucket>();
  const credential = { id: "credential", appUserId: "user", username: "test", passwordHash: "test-hash", passwordChangedAt: t0,
    appUser: { id: "user", organizationId: "org", name: "Test", status: "ACTIVE" } };
  const mock = {
    authCredential: { findUnique: vi.fn(async () => structuredClone(credential) as typeof credential | null) },
    authRateLimitBucket: {
      findUnique: vi.fn(async ({ where }: { where: { scope_keyHash: { scope: string } } }) => structuredClone(buckets.get(where.scope_keyHash.scope) ?? null)),
      upsert: vi.fn(async ({ create, update }: { create: Bucket & { scope: string }; update: Bucket }) => {
        buckets.set(create.scope, structuredClone(update)); return update;
      }),
      deleteMany: vi.fn(async ({ where }: { where: { scope: string } }) => ({ count: Number(buckets.delete(where.scope)) })),
    },
    authSession: { create: vi.fn(async () => ({ id: "session" })) },
    authSecurityEvent: { create: vi.fn(async () => ({ id: "event" })) },
    $transaction: vi.fn(),
  };
  // Deterministic database simulation: transactions see the previously committed
  // state. Crypto is deliberately kept pending in the concurrency test below.
  let queue: Promise<unknown> = Promise.resolve();
  mock.$transaction.mockImplementation((operation: (tx: unknown) => Promise<unknown>) => {
    const result = queue.then(() => operation(mock));
    queue = result.catch(() => undefined);
    return result;
  });
  return {
    mock, buckets, credential, login: authenticationService(mock as unknown as PrismaClient),
    events: () => mock.authSecurityEvent.create.mock.calls.map((args) => (args as unknown as [{ data: { type: string } }])[0].data.type),
  };
}

beforeEach(() => { vi.clearAllMocks(); vi.useFakeTimers(); vi.setSystemTime(t0); vi.mocked(verifyPassword).mockResolvedValue(false); });
afterEach(() => vi.useRealTimers());

describe("USERNAME admission state machine", () => {
  it("traverses 1–5, denies, 6, denies, 7, denies, then a new cycle", async () => {
    const f = fixture();
    for (let count = 1; count <= 5; count++) {
      expect(await f.login(input)).toEqual(rejected);
      expect(f.buckets.get("USERNAME")?.failureCount).toBe(count);
    }
    expect(f.buckets.get("USERNAME")?.blockedUntil).toEqual(at(5));
    for (const [minutes, count, nextBlock] of [[1, 5, 5], [5, 6, 20], [10, 6, 20], [20, 7, 80], [40, 7, 80], [80, 1, 0]]) {
      vi.setSystemTime(at(minutes));
      expect(await f.login(input)).toEqual(rejected);
      expect(f.buckets.get("USERNAME")?.failureCount).toBe(count);
      expect(f.buckets.get("USERNAME")?.blockedUntil).toEqual(nextBlock ? at(nextBlock) : null);
    }
    expect(verifyPassword).toHaveBeenCalledTimes(8);
    expect(f.events().filter((event) => event === "LOGIN_FAILURE")).toHaveLength(8);
    expect(f.events().filter((event) => event === "LOGIN_RATE_LIMITED")).toHaveLength(3);
    expect(f.mock.authRateLimitBucket.upsert).toHaveBeenCalledTimes(8);
  });
  it("resets the normal window before the first block, including its boundary", () => {
    let bucket: Bucket | null = null;
    for (let i = 0; i < 4; i++) bucket = nextUsernameAttempt(bucket, t0).state;
    expect(nextUsernameAttempt(bucket, at(15))).toMatchObject({ admitted: true, failureCount: 1, newlyBlocked: false, state: { windowStartedAt: at(15), blockedUntil: null } });
  });
  it.each([5, 6, 7])("allows successful attempt %i despite its own block and resets only USERNAME", async (target) => {
    const f = fixture();
    for (let count = 1; count < target; count++) {
      if (count === 6) vi.setSystemTime(at(5));
      await f.login(input);
    }
    if (target === 6) vi.setSystemTime(at(5));
    if (target === 7) vi.setSystemTime(at(20));
    const ip = nextIpFailure(null, new Date()).state;
    f.buckets.set("IP", ip);
    vi.mocked(verifyPassword).mockResolvedValue(true);
    const beforeLimited = f.events().filter((event) => event === "LOGIN_RATE_LIMITED").length;
    expect((await f.login({ ...input, clientIp: "192.0.2.1" })).ok).toBe(true);
    expect(f.buckets.has("USERNAME")).toBe(false);
    expect(f.buckets.get("IP")).toEqual(ip);
    expect(f.events().slice(-2)).toEqual(["LOGIN_SUCCESS", "SESSION_CREATED"]);
    expect(f.events().filter((event) => event === "LOGIN_RATE_LIMITED")).toHaveLength(beforeLimited);
  });
  it("admits at most five simultaneous targeted attempts before Argon2 completes", async () => {
    const f = fixture();
    let release!: () => void, fiveEntered!: () => void;
    const cryptoGate = new Promise<void>((resolve) => { release = resolve; });
    const entered = new Promise<void>((resolve) => { fiveEntered = resolve; });
    let cryptos = 0;
    vi.mocked(verifyPassword).mockImplementation(async () => {
      if (++cryptos === 5) fiveEntered();
      await cryptoGate;
      return false;
    });
    const calls = Array.from({ length: 15 }, () => f.login(input));
    await entered;
    // All five Argon2 calls are still pending, yet admission transactions finished.
    const blocked = await Promise.all(calls.slice(5));
    expect(blocked).toEqual(Array(10).fill(rejected));
    expect(verifyPassword).toHaveBeenCalledTimes(5);
    expect(f.buckets.get("USERNAME")?.failureCount).toBe(5);
    expect(f.events()).toEqual([]);
    release(); await Promise.all(calls);
    expect(f.mock.authRateLimitBucket.upsert).toHaveBeenCalledTimes(5);
    expect(f.events().filter((event) => event === "LOGIN_RATE_LIMITED")).toHaveLength(1);
  });
});

describe("failure accounting and final recheck", () => {
  it.each(["wrong-password", "unknown", "invalid-username", "invalid-password", "inactive"])("%s reserves USERNAME only once and increments IP after failure", async (mode) => {
    const f = fixture();
    if (mode === "unknown") f.mock.authCredential.findUnique.mockResolvedValue(null);
    if (mode === "inactive") {
      f.credential.appUser.status = "INACTIVE";
      vi.mocked(verifyPassword).mockResolvedValue(true);
    }
    expect(await f.login({ ...input, clientIp: "192.0.2.1", ...(mode === "invalid-username" ? { username: "bad user" } : {}), ...(mode === "invalid-password" ? { password: "x" } : {}) })).toEqual(rejected);
    expect(f.buckets.get("USERNAME")?.failureCount).toBe(1);
    expect(f.buckets.get("IP")?.failureCount).toBe(1);
    expect(f.mock.authRateLimitBucket.upsert).toHaveBeenCalledTimes(2);
    expect(f.events()).toEqual(["LOGIN_FAILURE"]);
    if (["unknown", "invalid-username", "invalid-password"].includes(mode)) expect(verifyDummy).toHaveBeenCalledOnce();
  });
  it.each(["missing", "id", "hash", "inactive"])("rejects credential %s change during Argon2 without double increment", async (mode) => {
    const f = fixture();
    vi.mocked(verifyPassword).mockImplementation(async () => {
      if (mode === "missing") f.mock.authCredential.findUnique.mockResolvedValue(null);
      if (mode === "id") f.credential.id = "replacement";
      if (mode === "hash") f.credential.passwordHash = "changed";
      if (mode === "inactive") f.credential.appUser.status = "INACTIVE";
      return true;
    });
    expect(await f.login({ ...input, clientIp: "192.0.2.1" })).toEqual(rejected);
    expect(f.mock.authSession.create).not.toHaveBeenCalled();
    expect(f.buckets.get("USERNAME")?.failureCount).toBe(1);
    expect(f.buckets.get("IP")?.failureCount).toBe(1);
    expect(f.events()).toEqual(["LOGIN_FAILURE"]);
  });
  it("IP failure 20 blocks for 15 minutes and an active block does not extend", () => {
    let bucket: Bucket | null = null;
    for (let count = 1; count <= 20; count++) {
      const result = nextIpFailure(bucket, t0); bucket = result.state;
      expect(result.newlyBlocked).toBe(count === 20);
    }
    expect(bucket?.blockedUntil).toEqual(at(15));
    expect(nextIpFailure(bucket, at(1))).toEqual({ state: bucket, newlyBlocked: false });
    expect(nextIpFailure(bucket, at(15)).state.failureCount).toBe(1);
  });
  it("records just one limited event when both scopes activate together", async () => {
    const f = fixture();
    for (let i = 0; i < 4; i++) await f.login(input);
    let ip: Bucket | null = null;
    for (let i = 0; i < 19; i++) ip = nextIpFailure(ip, t0).state;
    f.buckets.set("IP", ip!);
    await f.login({ ...input, clientIp: "192.0.2.1" });
    expect(f.events().slice(-2)).toEqual(["LOGIN_FAILURE", "LOGIN_RATE_LIMITED"]);
    expect(f.events().filter((event) => event === "LOGIN_RATE_LIMITED")).toHaveLength(1);
    const calls = f.mock.authRateLimitBucket.upsert.mock.calls.length;
    const eventCount = f.events().length;
    await f.login({ ...input, clientIp: "192.0.2.1" });
    expect(f.mock.authRateLimitBucket.upsert).toHaveBeenCalledTimes(calls);
    expect(f.events()).toHaveLength(eventCount);
    expect(verifyPassword).toHaveBeenCalledTimes(5);
  });
  it("an IP-only transition emits one limited event", async () => {
    const f = fixture();
    let ip: Bucket | null = null;
    for (let i = 0; i < 19; i++) ip = nextIpFailure(ip, t0).state;
    f.buckets.set("IP", ip!);
    await f.login({ ...input, clientIp: "192.0.2.1" });
    expect(f.events()).toEqual(["LOGIN_FAILURE", "LOGIN_RATE_LIMITED"]);
    expect(f.buckets.get("USERNAME")?.failureCount).toBe(1);
  });
  it("rechecks IP after Argon2 and creates no session if it became blocked", async () => {
    const f = fixture();
    vi.mocked(verifyPassword).mockImplementation(async () => {
      let ip: Bucket | null = null;
      for (let i = 0; i < 20; i++) ip = nextIpFailure(ip, t0).state;
      f.buckets.set("IP", ip!);
      return true;
    });
    expect(await f.login({ ...input, clientIp: "192.0.2.1" })).toEqual(rejected);
    expect(f.mock.authSession.create).not.toHaveBeenCalled();
    expect(f.events()).toEqual([]);
    expect(f.buckets.get("USERNAME")?.failureCount).toBe(1);
  });
});
