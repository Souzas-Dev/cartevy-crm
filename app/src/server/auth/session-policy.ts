import {
  SESSION_ABSOLUTE_HOURS, SESSION_IDLE_MINUTES, SESSION_TOUCH_INTERVAL_MINUTES,
} from "./constants";
import type { Session, AuthContext } from "./types";

export function sessionDates(now: Date) {
  return {
    createdAt: now,
    lastSeenAt: now,
    idleExpiresAt: new Date(now.getTime() + SESSION_IDLE_MINUTES * 60_000),
    absoluteExpiresAt: new Date(now.getTime() + SESSION_ABSOLUTE_HOURS * 3_600_000),
  };
}

export function isSessionValid(session: Session, now: Date): boolean {
  return session.revokedAt === null && session.appUser.status === "ACTIVE" &&
    now < session.idleExpiresAt && now < session.absoluteExpiresAt;
}

export function needsSessionTouch(session: Session, now: Date): boolean {
  return isSessionValid(session, now) &&
    now.getTime() - session.lastSeenAt.getTime() >= SESSION_TOUCH_INTERVAL_MINUTES * 60_000;
}

export function touchedIdleExpiry(now: Date, absoluteExpiresAt: Date): Date {
  return new Date(Math.min(now.getTime() + SESSION_IDLE_MINUTES * 60_000, absoluteExpiresAt.getTime()));
}

export function toAuthContext(session: Session): AuthContext {
  return {
    sessionId: session.id,
    appUserId: session.appUser.id,
    organizationId: session.appUser.organizationId,
    name: session.appUser.name,
  };
}

export function isSessionToken(token: unknown): token is string {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token) && token.length === 43;
}
