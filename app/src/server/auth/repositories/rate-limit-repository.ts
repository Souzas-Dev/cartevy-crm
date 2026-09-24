import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { RATE_LIMIT_BUCKET_RETENTION_HOURS } from "../constants";
import { isBucketBlocked, nextUsernameAttempt, nextIpFailure, type RateLimitScope, type UsernameAdmission } from "../rate-limit-policy";

export function findBucket(db: Prisma.TransactionClient, scope: RateLimitScope, keyHash: string) {
  return db.authRateLimitBucket.findUnique({ where: { scope_keyHash: { scope, keyHash } } });
}

// Read/write operations MUST run inside serializable() with bounded retry.
// Admission must commit BEFORE credential lookup or Argon2.
export async function reserveUsernameAttempt(db: Prisma.TransactionClient, keyHash: string, now: Date): Promise<UsernameAdmission> {
  const result = nextUsernameAttempt(await findBucket(db, "USERNAME", keyHash), now);
  if (result.admitted && result.state) {
    await db.authRateLimitBucket.upsert({
      where: { scope_keyHash: { scope: "USERNAME", keyHash } },
      create: { scope: "USERNAME", keyHash, ...result.state }, update: result.state,
    });
  }
  return { admitted: result.admitted, failureCount: result.failureCount, newlyBlocked: result.newlyBlocked };
}

export async function recordIpFailure(db: Prisma.TransactionClient, keyHash: string, now: Date) {
  const bucket = await findBucket(db, "IP", keyHash);
  if (isBucketBlocked(bucket, now)) return { newlyBlocked: false };
  const result = nextIpFailure(bucket, now);
  await db.authRateLimitBucket.upsert({
    where: { scope_keyHash: { scope: "IP", keyHash } },
    create: { scope: "IP", keyHash, ...result.state }, update: result.state,
  });
  return { newlyBlocked: result.newlyBlocked };
}

export function resetUsernameBucket(db: Prisma.TransactionClient, identifierHash: string) {
  return db.authRateLimitBucket.deleteMany({ where: { scope: "USERNAME", keyHash: identifierHash } });
}

export function deleteStaleRateLimitBuckets(db: Prisma.TransactionClient, now: Date) {
  return db.authRateLimitBucket.deleteMany({ where: {
    updatedAt: { lt: new Date(now.getTime() - RATE_LIMIT_BUCKET_RETENTION_HOURS * 3_600_000) },
    OR: [{ blockedUntil: null }, { blockedUntil: { lte: now } }],
  } });
}
