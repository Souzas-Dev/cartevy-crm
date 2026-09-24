import { createHmac, randomBytes } from "node:crypto";
import * as argon2 from "argon2";
import { beforeAll, describe, expect, it } from "vitest";

import { AuthCryptoError, InvalidPasswordError } from "../errors";
import { hashPassword, validatePassword, verifyPassword } from "../password";
import { generateSessionToken, hashSessionToken } from "../session-token";
import { normalizeUsername, validateUsername } from "../username";

describe("username", () => {
  it("normalizes NFKC, surrounding whitespace and case", () => {
    expect(normalizeUsername(" Eduardo ")).toBe("eduardo");
    expect(normalizeUsername("EDUARDO.SOUZA")).toBe("eduardo.souza");
    expect(normalizeUsername(" ＥＤＵＡＲＤＯ．ＳＯＵＺＡ ")).toBe("eduardo.souza");
  });

  it.each(["abc", "eduardo.souza", "user_01-test", "a".repeat(40)])(
    "accepts canonical username %s", (username) => {
      expect(validateUsername(username)).toBe(true);
    },
  );

  it.each(["", "ab", "a".repeat(41), "a b", "abc\n", "ação", "a@b", "a/b", "ABC", 123, null])(
    "rejects invalid username %s", (username) => {
      expect(validateUsername(username)).toBe(false);
    },
  );
});

describe("password policy", () => {
  it("accepts both inclusive length boundaries", () => {
    expect(validatePassword("a".repeat(15))).toBe(true);
    expect(validatePassword("a".repeat(128))).toBe(true);
  });

  it("rejects below and above the boundaries without truncation", () => {
    expect(validatePassword("a".repeat(14))).toBe(false);
    expect(validatePassword("a".repeat(129))).toBe(false);
  });

  it("allows spaces without trimming or composition requirements", () => {
    expect(validatePassword(" ".repeat(15))).toBe(true);
    expect(validatePassword(" " + "a".repeat(14))).toBe(true);
  });

  it("counts Unicode code points rather than UTF-16 code units", () => {
    expect(validatePassword("😀".repeat(14))).toBe(false);
    expect(validatePassword("😀".repeat(15))).toBe(true);
    expect(validatePassword("😀".repeat(128))).toBe(true);
    expect(validatePassword("😀".repeat(129))).toBe(false);
    expect(validatePassword("e\u0301".repeat(7) + "a")).toBe(true);
  });

  it("rejects non-string inputs", () => {
    expect(validatePassword(null)).toBe(false);
    expect(validatePassword(123)).toBe(false);
  });
});

describe("password cryptography", () => {
  const password = " uma senha Unicode 🔐 ";
  // Ephemeral test-only material, unrelated to any deployment secret.
  const pepper = randomBytes(32).toString("hex");
  let encodedHash: string;

  beforeAll(async () => {
    encodedHash = await hashPassword(password, pepper);
  });

  it("encodes Argon2id with the required parameters and 32-byte output", () => {
    const [, algorithm, version, parameters] = encodedHash.split("$");
    expect(algorithm).toBe("argon2id");
    expect(version).toBe("v=19");
    expect(parameters.split(",").sort()).toEqual(["m=19456", "p=1", "t=2"]);
    expect(Buffer.from(encodedHash.split("$")[5], "base64")).toHaveLength(32);
    expect(encodedHash).not.toContain(password);
    expect(encodedHash).not.toContain(pepper);
  });

  it("uses fresh salts for the same password", async () => {
    const second = await hashPassword(password, pepper);
    expect(second).not.toBe(encodedHash);
    expect(second.split("$")[4]).not.toBe(encodedHash.split("$")[4]);
    expect(await verifyPassword(password, second, pepper)).toBe(true);
  });

  it("verifies the correct password", async () => {
    expect(await verifyPassword(password, encodedHash, pepper)).toBe(true);
  });

  it("returns false for an incorrect password", async () => {
    expect(await verifyPassword("outra senha incorreta", encodedHash, pepper)).toBe(false);
  });

  it("returns false for a different pepper", async () => {
    expect(await verifyPassword(password, encodedHash, randomBytes(32).toString("hex"))).toBe(false);
  });

  it("feeds the binary HMAC-SHA256 into Argon2", async () => {
    const hmac = createHmac("sha256", pepper).update(password, "utf8").digest();
    expect(await argon2.verify(encodedHash, hmac)).toBe(true);
  });

  it("does not trim the password before hashing or verification", async () => {
    expect(await verifyPassword(password.trim(), encodedHash, pepper)).toBe(false);
  });

  it("does not normalize Unicode", async () => {
    const composed = "é".repeat(15);
    const hash = await hashPassword(composed, pepper);
    expect(await verifyPassword(composed, hash, pepper)).toBe(true);
    expect(await verifyPassword(composed.normalize("NFD"), hash, pepper)).toBe(false);
  });

  it("rejects invalid passwords at creation and returns false at verification", async () => {
    await expect(hashPassword("short", pepper)).rejects.toBeInstanceOf(InvalidPasswordError);
    await expect(hashPassword("a".repeat(129), pepper)).rejects.toBeInstanceOf(InvalidPasswordError);
    expect(await verifyPassword("short", encodedHash, pepper)).toBe(false);
    expect(await verifyPassword("a".repeat(129), encodedHash, pepper)).toBe(false);
  });

  it("treats missing pepper as a configuration error", async () => {
    await expect(hashPassword(password, "")).rejects.toBeInstanceOf(AuthCryptoError);
    await expect(verifyPassword(password, encodedHash, "")).rejects.toBeInstanceOf(AuthCryptoError);
  });

  it("raises an internal error for corrupt or unsupported stored hashes", async () => {
    for (const hash of ["not-a-hash", "$argon2id$broken", encodedHash.replace("argon2id", "argon2i")]) {
      await expect(verifyPassword(password, hash, pepper)).rejects.toBeInstanceOf(AuthCryptoError);
    }
  });
});

describe("opaque session tokens", () => {
  it("generates distinct tokens containing 32 random bytes in base64url", () => {
    const first = generateSessionToken();
    const second = generateSessionToken();
    expect(first).not.toBe(second);
    for (const token of [first, second]) {
      expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(Buffer.from(token, "base64url")).toHaveLength(32);
      expect(Buffer.from(token, "base64url").toString("base64url")).toBe(token);
    }
  });

  it("hashes deterministically to lowercase SHA-256 hex", () => {
    expect(hashSessionToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    const token = generateSessionToken();
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    expect(hashSessionToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashSessionToken(token)).not.toBe(token);
    expect(hashSessionToken(token + "x")).not.toBe(hashSessionToken(token));
  });
});
