import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { deleteExpiredSessions } from "./repositories/session-repository";
import { deleteStaleRateLimitBuckets } from "./repositories/rate-limit-repository";

export async function cleanupAuthSessions(db: PrismaClient, now = new Date()) {
  const sessions = await deleteExpiredSessions(db, now);
  const buckets = await deleteStaleRateLimitBuckets(db, now);
  return { sessionsRemoved: sessions.count, rateLimitBucketsRemoved: buckets.count };
}
