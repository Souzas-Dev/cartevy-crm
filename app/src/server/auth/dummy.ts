import "server-only";
import { verifyPasswordWork } from "./password";

// Public, non-credential encoded hash. Generated once from public dummy material.
// Keep its parameters aligned with the real Argon2id password policy.
export const DUMMY_ARGON2_HASH = "$argon2id$v=19$m=19456,p=1,t=2$Y2FydGV2eS1kdW1teS12MQ$YWR2bdPvU1zV59cqqllscAK0YOkoKH7KpYOl++xHyKo";

export async function verifyDummy(password: string, pepper: string): Promise<void> {
  // Same HMAC preparation, exactly one verify, including invalid/short passwords.
  // No runtime hash generation, memoization or cached pepper. Ignore the result.
  await verifyPasswordWork(password, DUMMY_ARGON2_HASH, pepper);
}
