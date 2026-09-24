import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { authUserSelect } from "./credential-repository";
import { sessionDates, touchedIdleExpiry } from "../session-policy";
import { REVOKED_SESSION_RETENTION_DAYS, SESSION_TOUCH_INTERVAL_MINUTES } from "../constants";

const sessionSelect = {
  id: true, appUserId: true, createdAt: true, lastSeenAt: true,
  idleExpiresAt: true, absoluteExpiresAt: true, revokedAt: true,
  appUser: { select: authUserSelect },
} as const;

export function createSession(db: Prisma.TransactionClient, appUserId: string, tokenHash: string, now: Date) {
  return db.authSession.create({
    data: { appUserId, tokenHash, ...sessionDates(now) }, select: sessionSelect,
  });
}

export function findSessionByTokenHash(db: Prisma.TransactionClient, tokenHash: string) {
  return db.authSession.findUnique({ where: { tokenHash }, select: sessionSelect });
}

export function touchSession(db: Prisma.TransactionClient, id: string, absoluteExpiresAt: Date, now: Date) {
  // Conditional UPDATE prevents stale after() callbacks from reviving/receding sessions.
  return db.authSession.updateMany({
    where: {
      id, revokedAt: null, idleExpiresAt: { gt: now },
      absoluteExpiresAt: { equals: absoluteExpiresAt, gt: now },
      lastSeenAt: { lte: new Date(now.getTime() - SESSION_TOUCH_INTERVAL_MINUTES * 60_000) },
      createdAt: { lte: now }, appUser: { status: "ACTIVE" },
    },
    data: { lastSeenAt: now, idleExpiresAt: touchedIdleExpiry(now, absoluteExpiresAt) },
  });
}

export function revokeSession(db: Prisma.TransactionClient, id: string, now: Date) {
  return db.authSession.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: now } });
}

export function revokeAllUserSessions(db: Prisma.TransactionClient, appUserId: string, now: Date) {
  return db.authSession.updateMany({ where: { appUserId, revokedAt: null }, data: { revokedAt: now } });
}

export function deleteExpiredSessions(db: Prisma.TransactionClient, now: Date) {
  return db.authSession.deleteMany({
    where: { OR: [
      { absoluteExpiresAt: { lte: now } },
      { idleExpiresAt: { lte: now } },
      { revokedAt: { lte: new Date(now.getTime() - REVOKED_SESSION_RETENTION_DAYS * 86_400_000) } },
    ] },
  });
}
