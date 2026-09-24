import { afterEach, describe, expect, it, vi } from "vitest";
import { hashIdentifier } from "../identifier";
import { getClientIp } from "../client-ip";

import { getSessionCookieName, sessionCookieOptions } from "../cookie-policy";

import { sessionDates, isSessionValid, needsSessionTouch, touchedIdleExpiry, toAuthContext } from "../session-policy";
import { assertBootstrapAllowed, parseBootstrapInput } from "../bootstrap-service";
import { contentSecurityPolicy, securityHeaders } from "../../../lib/security-headers";
import type { Session } from "../types";

const now = new Date("2026-09-24T12:00:00Z");
const minute = 60_000;
const session: Session = {
  id: "session", appUserId: "user", ...sessionDates(now), revokedAt: null,
  appUser: { id: "user", organizationId: "server-org", name: "Test", status: "ACTIVE" },
};

afterEach(() => vi.unstubAllEnvs());

describe("identifier privacy", () => {
  it("is deterministic with 64 lowercase hex and no raw identifier", () => {
    const hash = hashIdentifier("test-user", "test-only-secret");
    expect(hash).toBe(hashIdentifier("test-user", "test-only-secret"));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain("test-user");
  });
  it("changes with secret and identifier", () => {
    expect(hashIdentifier("test", "one")).not.toBe(hashIdentifier("test", "two"));
    expect(hashIdentifier("test", "one")).not.toBe(hashIdentifier("other", "one"));
  });
  it("rejects missing/blank secret", () => expect(() => hashIdentifier("test", " ")).toThrow());
});

describe("trusted client IP", () => {
  const vercel = { vercel: "1", nodeEnv: "production" } as const;
  it("accepts a valid Vercel platform IP", () => {
    expect(getClientIp(new Headers({ "x-vercel-forwarded-for": "192.0.2.1" }), vercel)).toBe("192.0.2.1");
  });
  it("selects the first valid IP in a list", () => {
    expect(getClientIp(new Headers({ "x-vercel-forwarded-for": "invalid, 192.0.2.2, 192.0.2.3" }), vercel)).toBe("192.0.2.2");
  });
  it("canonicalizes IPv6", () => {
    expect(getClientIp(new Headers({ "x-vercel-forwarded-for": "2001:0db8:0:0:0:0:0:1" }), vercel)).toBe("2001:db8::1");
  });
  it.each(["invalid", "192.0.2.1:443", "999.2.3.4", ""])("rejects invalid platform IP %j", (value) => {
    expect(getClientIp(new Headers({ "x-vercel-forwarded-for": value }), vercel)).toBeNull();
  });
  it("never falls back to arbitrary forwarded headers", () => {
    expect(getClientIp(new Headers({ "x-forwarded-for": "192.0.2.1" }), vercel)).toBeNull();
  });
  it("rejects spoofing on other production environments", () => {
    expect(getClientIp(new Headers({ "x-vercel-forwarded-for": "192.0.2.1", "x-forwarded-for": "192.0.2.2" }), { vercel: undefined, nodeEnv: "production" })).toBeNull();
  });
  it.each(["development", "test"] as const)("uses local loopback for %s", (nodeEnv) => {
    expect(getClientIp(new Headers(), { vercel: undefined, nodeEnv })).toBe("127.0.0.1");
  });
});

describe("session validity and lifetime", () => {
  it("creates a 30-minute idle and 8-hour absolute lifetime", () => {
    expect(session.idleExpiresAt.getTime() - now.getTime()).toBe(30 * minute);
    expect(session.absoluteExpiresAt.getTime() - now.getTime()).toBe(8 * 60 * minute);
    expect(isSessionValid(session, now)).toBe(true);
  });
  it.each([
    { revokedAt: now }, { idleExpiresAt: now }, { absoluteExpiresAt: now },
    { appUser: { ...session.appUser, status: "INACTIVE" as const } },
  ])("rejects invalid session %j", (change) => {
    expect(isSessionValid({ ...session, ...change }, now)).toBe(false);
  });
  it("touches only after 5 minutes and only while valid", () => {
    expect(needsSessionTouch(session, new Date(now.getTime() + 4 * minute))).toBe(false);
    expect(needsSessionTouch(session, new Date(now.getTime() + 5 * minute))).toBe(true);
    expect(needsSessionTouch(session, session.idleExpiresAt)).toBe(false);
  });
  it("caps touched idle expiry at the original absolute expiry", () => {
    const almostExpired = new Date(session.absoluteExpiresAt.getTime() - minute);
    expect(touchedIdleExpiry(almostExpired, session.absoluteExpiresAt)).toEqual(session.absoluteExpiresAt);
  });
  it("context contains only server-derived identity", () => {
    expect(toAuthContext(session)).toEqual({ sessionId: "session", appUserId: "user", organizationId: "server-org", name: "Test" });
  });
});

describe("cookie attributes", () => {
  it("uses a secure host-only session cookie in production", () => {
    expect(getSessionCookieName("production")).toBe("__Host-cartevy_session");
    expect(sessionCookieOptions("production")).toEqual({ httpOnly: true, secure: true, sameSite: "strict", path: "/" });
    expect(sessionCookieOptions("production")).not.toHaveProperty("domain");
    expect(sessionCookieOptions("production")).not.toHaveProperty("maxAge");
  });
  it("uses the unprefixed cookie only in local development", () => {
    expect(getSessionCookieName("development")).toBe("cartevy_session");
    expect(sessionCookieOptions("development").secure).toBe(false);
    expect(sessionCookieOptions("test").secure).toBe(true);
  });
});

describe("CSP and security headers", () => {
  it("production uses nonce and excludes unsafe script/style allowances", () => {
    const csp = contentSecurityPolicy("test-nonce", true);
    expect(csp).toContain("'nonce-test-nonce' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).not.toContain("*");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'self'");
  });
  it("allows only development exceptions and enables HSTS only in prod", () => {
    expect(contentSecurityPolicy("test", false)).toContain("'unsafe-eval'");
    expect(securityHeaders(false).some((h) => h.key === "Strict-Transport-Security")).toBe(false);
    expect(securityHeaders(true)).toContainEqual({ key: "Strict-Transport-Security", value: "max-age=31536000" });
    expect(securityHeaders(true)).toContainEqual({ key: "X-Content-Type-Options", value: "nosniff" });
  });
});

describe("bootstrap validation without executing CLI", () => {
  const input = { organizationName: "Test Org", organizationSlug: "test-org", name: "Test User", username: " TEST.USER ", password: "test-password-long", confirmation: "test-password-long" };
  it("requires exact opt-in", () => {
    expect(() => assertBootstrapAllowed(undefined)).toThrow();
    expect(() => assertBootstrapAllowed("true")).toThrow();
    expect(() => assertBootstrapAllowed("1")).not.toThrow();
  });
  it("normalizes username and allows omitted email", () => {
    expect(parseBootstrapInput(input).username).toBe("test.user");
    expect(parseBootstrapInput(input).email).toBeUndefined();
  });
  it.each([{ confirmation: "different" }, { password: "short" }, { username: "bad name" }, { email: "invalid" }, { organizationSlug: "BAD SPACE" }])("rejects invalid bootstrap input %j", (change) => {
    expect(() => parseBootstrapInput({ ...input, ...change })).toThrow();
  });
});
