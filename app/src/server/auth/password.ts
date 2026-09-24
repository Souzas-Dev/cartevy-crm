import { createHmac, randomBytes } from "node:crypto";
import * as argon2 from "argon2";

import {
  ARGON2_HASH_LENGTH,
  ARGON2_MEMORY_COST,
  ARGON2_PARALLELISM,
  ARGON2_TIME_COST,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./constants";
import { AuthCryptoError, InvalidPasswordError } from "./errors";

// Node/server only. The caller supplies the secret; no environment loading here.
// A breached-password blocklist is a future layer, outside this primitive.
export function validatePassword(password: unknown): password is string {
  if (typeof password !== "string") return false;

  // Each code point occupies at most two UTF-16 code units.
  if (password.length > PASSWORD_MAX_LENGTH * 2) return false;
  const length = Array.from(password).length;
  return length >= PASSWORD_MIN_LENGTH && length <= PASSWORD_MAX_LENGTH;
}

function assertPepper(pepper: string): void {
  if (typeof pepper !== "string" || pepper.length === 0) {
    throw new AuthCryptoError("A non-empty server-side pepper is required.");
  }
}

function prehash(password: string, pepper: string): Buffer {
  return createHmac("sha256", pepper).update(password, "utf8").digest();
}

export async function hashPassword(
  password: string,
  pepper: string,
): Promise<string> {
  assertPepper(pepper);
  if (!validatePassword(password)) throw new InvalidPasswordError();

  try {
    return await argon2.hash(prehash(password, pepper), {
      type: argon2.argon2id,
      memoryCost: ARGON2_MEMORY_COST,
      timeCost: ARGON2_TIME_COST,
      parallelism: ARGON2_PARALLELISM,
      hashLength: ARGON2_HASH_LENGTH,
      version: 0x13,
      salt: randomBytes(16),
      raw: false,
    });
  } catch {
    // Keep library error details (which may contain inputs) out of public errors.
    throw new AuthCryptoError("Password hashing failed.");
  }
}

export async function verifyPassword(
  password: string,
  encodedHash: string,
  pepper: string,
): Promise<boolean> {
  assertPepper(pepper);
  // Only pass a trusted, server-stored hash here, never a client-supplied hash.
  if (typeof encodedHash !== "string" || !encodedHash.startsWith("$argon2id$")) {
    throw new AuthCryptoError("Stored password hash is not Argon2id.");
  }
  if (!validatePassword(password)) return false;

  return verifyPasswordWork(password, encodedHash, pepper);
}

// Bounded crypto work without password-policy short-circuiting, also used by dummy
// verification. This is not an authentication decision; callers enforce policy.
export async function verifyPasswordWork(password: string, encodedHash: string, pepper: string): Promise<boolean> {
  assertPepper(pepper);
  if (password.length > PASSWORD_MAX_LENGTH * 2) throw new InvalidPasswordError();
  if (!encodedHash.startsWith("$argon2id$")) throw new AuthCryptoError("Stored password hash is not Argon2id.");

  try {
    return await argon2.verify(encodedHash, prehash(password, pepper));
  } catch {
    throw new AuthCryptoError("Password verification failed.");
  }
}
