import { afterEach, describe, expect, it, vi } from "vitest";
import { getPasswordPepper, getRateLimitSecret, getAuthRuntimeSecrets } from "../config";

afterEach(() => vi.unstubAllEnvs());

describe("runtime secret validation", () => {
  it.each([undefined, "", " ".repeat(40), "a".repeat(31)])("rejects missing, blank or short secrets (%j)", (value) => {
    vi.stubEnv("AUTH_PASSWORD_PEPPER", value);
    vi.stubEnv("AUTH_RATE_LIMIT_SECRET", value);
    expect(getPasswordPepper).toThrow();
    expect(getRateLimitSecret).toThrow();
  });
  it("accepts 32 bytes and preserves all bytes without trimming", () => {
    const pepper = " " + "a".repeat(30) + " ";
    const rateLimitSecret = "b".repeat(32);
    vi.stubEnv("AUTH_PASSWORD_PEPPER", pepper);
    vi.stubEnv("AUTH_RATE_LIMIT_SECRET", rateLimitSecret);
    expect(getAuthRuntimeSecrets()).toEqual({ pepper, rateLimitSecret });
  });
  it("counts Unicode UTF-8 bytes, without normalization or truncation", () => {
    vi.stubEnv("AUTH_PASSWORD_PEPPER", "é".repeat(16));
    expect(getPasswordPepper()).toBe("é".repeat(16));
    vi.stubEnv("AUTH_PASSWORD_PEPPER", "é".repeat(15) + "a");
    expect(getPasswordPepper).toThrow();
    vi.stubEnv("AUTH_PASSWORD_PEPPER", "😀".repeat(20));
    expect(getPasswordPepper()).toBe("😀".repeat(20));
  });
  it("rejects equal runtime secrets without exposing them", () => {
    const secret = "s".repeat(32);
    vi.stubEnv("AUTH_PASSWORD_PEPPER", secret);
    vi.stubEnv("AUTH_RATE_LIMIT_SECRET", secret);
    expect(getAuthRuntimeSecrets).toThrow("must be distinct");
    try { getAuthRuntimeSecrets(); } catch (error) { expect(String(error)).not.toContain(secret); }
  });
  it("bootstrap pepper validation does not require rate-limit configuration", () => {
    vi.stubEnv("AUTH_PASSWORD_PEPPER", "p".repeat(32));
    vi.stubEnv("AUTH_RATE_LIMIT_SECRET", undefined);
    expect(getPasswordPepper()).toBe("p".repeat(32));
  });
  it("imports with missing secrets and reads fresh values only at runtime", async () => {
    vi.stubEnv("AUTH_PASSWORD_PEPPER", undefined);
    vi.stubEnv("AUTH_RATE_LIMIT_SECRET", undefined);
    vi.resetModules();
    const config = await import("../config");
    vi.stubEnv("AUTH_PASSWORD_PEPPER", "p".repeat(32));
    vi.stubEnv("AUTH_RATE_LIMIT_SECRET", "r".repeat(32));
    expect(config.getAuthRuntimeSecrets()).toEqual({ pepper: "p".repeat(32), rateLimitSecret: "r".repeat(32) });
  });
});
