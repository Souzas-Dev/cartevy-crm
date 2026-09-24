import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as argon2 from "argon2";
import { verifyDummy, DUMMY_ARGON2_HASH } from "../dummy";
import { verifyPassword } from "../password";
import { ARGON2_HASH_LENGTH, ARGON2_MEMORY_COST, ARGON2_TIME_COST, ARGON2_PARALLELISM } from "../constants";

vi.mock("argon2", () => ({ argon2id: 2, hash: vi.fn(), verify: vi.fn().mockResolvedValue(false) }));
beforeEach(() => vi.clearAllMocks());

describe("fixed dummy verification", () => {
  it("first and successive calls each verify once, never generate a hash", async () => {
    vi.resetModules();
    const dummy = await import("../dummy");
    expect(argon2.hash).not.toHaveBeenCalled();
    for (const password of ["", "short", "test-password-long"]) {
      const before = vi.mocked(argon2.verify).mock.calls.length;
      expect(await dummy.verifyDummy(password, "test-pepper")).toBeUndefined();
      expect(argon2.verify).toHaveBeenCalledTimes(before + 1);
      expect(argon2.hash).not.toHaveBeenCalled();
    }
  });
  it("uses the same HMAC preparation as real verify, even for short input", async () => {
    const password = "test-password-long", pepper = "test-pepper";
    await verifyPassword(password, DUMMY_ARGON2_HASH, pepper);
    const prepared = vi.mocked(argon2.verify).mock.calls[0][1];
    await verifyDummy(password, pepper);
    expect(vi.mocked(argon2.verify).mock.calls[1][1]).toEqual(prepared);
    await verifyDummy("x", pepper);
    expect(argon2.verify).toHaveBeenLastCalledWith(DUMMY_ARGON2_HASH, createHmac("sha256", pepper).update("x").digest());
  });
  it("does not cache pepper and discards even a true verify result", async () => {
    vi.mocked(argon2.verify).mockResolvedValue(true);
    for (const pepper of ["first-pepper", "second-pepper"]) {
      expect(await verifyDummy("test-password-long", pepper)).toBeUndefined();
      expect(argon2.verify).toHaveBeenLastCalledWith(DUMMY_ARGON2_HASH, createHmac("sha256", pepper).update("test-password-long").digest());
    }
  });
  it("has the exact current Argon2id parameters and a 32-byte digest", () => {
    const [, kind, version, parameters, salt, digest] = DUMMY_ARGON2_HASH.split("$");
    expect(kind).toBe("argon2id"); expect(version).toBe("v=19");
    const entries = Object.fromEntries(parameters.split(",").map((entry) => entry.split("=")));
    expect(entries).toEqual({ m: String(ARGON2_MEMORY_COST), t: String(ARGON2_TIME_COST), p: String(ARGON2_PARALLELISM) });
    expect(Buffer.from(salt, "base64").length).toBe(16);
    expect(Buffer.from(digest, "base64").length).toBe(ARGON2_HASH_LENGTH);
  });
  it("the fixed hash is accepted by the actual Argon2 verifier", async () => {
    const actual = await vi.importActual<typeof import("argon2")>("argon2");
    expect(await actual.verify(DUMMY_ARGON2_HASH, Buffer.from("Cartevy public dummy material - not a credential"))).toBe(true);
  });
});
