import "server-only";
import type { PrismaClient, Prisma } from "@/generated/prisma/client";
import { getAuthRuntimeSecrets } from "./config";
import { createAuthenticationService } from "./authentication-service";
import { findCredentialByUsername } from "./repositories/credential-repository";
import { findBucket, reserveUsernameAttempt, recordIpFailure, resetUsernameBucket } from "./repositories/rate-limit-repository";
import { recordSecurityEvent } from "./repositories/security-event-repository";
import { createSession } from "./repositories/session-repository";
import { serializable } from "./transaction";
import { isBucketBlocked, type UsernameAdmission } from "./rate-limit-policy";
import { verifyPassword } from "./password";
import { verifyDummy } from "./dummy";
import type { IdentifierHashes } from "./types";

export async function getAuthDb(): Promise<PrismaClient> {
  return (await import("@/lib/db/prisma")).prisma;
}

async function ipBlocked(db: Prisma.TransactionClient, hashes: IdentifierHashes, now: Date) {
  return hashes.ipHash ? isBucketBlocked(await findBucket(db, "IP", hashes.ipHash), now) : false;
}

async function recordFailure(tx: Prisma.TransactionClient, hashes: IdentifierHashes, admission: UsernameAdmission, now: Date) {
  // USERNAME was already reserved exactly once, even if identity/status changed.
  const ip = hashes.ipHash ? await recordIpFailure(tx, hashes.ipHash, now) : null;
  await recordSecurityEvent(tx, { type: "LOGIN_FAILURE", ...hashes });
  if (admission.newlyBlocked || ip?.newlyBlocked) {
    await recordSecurityEvent(tx, { type: "LOGIN_RATE_LIMITED", ...hashes });
  }
}

export function authenticationService(db: PrismaClient) {
  return createAuthenticationService({
    secrets: getAuthRuntimeSecrets,
    now: () => new Date(), verify: verifyPassword, dummy: verifyDummy,
    findCredential: (username) => findCredentialByUsername(db, username),
    admit: (hashes, now) => serializable(db, async (tx) => {
      if (await ipBlocked(tx, hashes, now)) return { admitted: false, failureCount: 0, newlyBlocked: false };
      return reserveUsernameAttempt(tx, hashes.identifierHash, now);
    }),
    failure: (hashes, admission, now) => serializable(db, (tx) => recordFailure(tx, hashes, admission, now)),
    complete: (credential, tokenHash, hashes, admission, now) => serializable(db, async (tx) => {
      // Argon2 ran outside all transactions. Revalidate before creating a session.
      const current = await findCredentialByUsername(tx, credential.username);
      if (!current || current.id !== credential.id || current.passwordHash !== credential.passwordHash ||
          current.appUser.status !== "ACTIVE") {
        await recordFailure(tx, hashes, admission, now);
        return false;
      }
      // An admitted attempt owns its permission despite its own USERNAME block.
      // IP protection remains independent; an existing block creates no new event.
      if (await ipBlocked(tx, hashes, now)) return false;
      await resetUsernameBucket(tx, hashes.identifierHash);
      await createSession(tx, current.appUserId, tokenHash, now);
      await recordSecurityEvent(tx, { type: "LOGIN_SUCCESS", appUserId: current.appUserId, ...hashes });
      await recordSecurityEvent(tx, { type: "SESSION_CREATED", appUserId: current.appUserId, ...hashes });
      return true;
    }),
  });
}
