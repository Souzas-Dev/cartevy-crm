import { RATE_LIMIT_WINDOW_MINUTES } from "./constants";

export type RateLimitScope = "USERNAME" | "IP";
export type Bucket = {
  failureCount: number;
  windowStartedAt: Date;
  lastFailureAt: Date | null;
  blockedUntil: Date | null;
};
export type UsernameAdmission = { admitted: boolean; failureCount: number; newlyBlocked: boolean };

export function isBucketBlocked(bucket: Bucket | null, now: Date): boolean {
  return !!bucket?.blockedUntil && now < bucket.blockedUntil;
}

export function nextUsernameAttempt(bucket: Bucket | null, now: Date): UsernameAdmission & { state: Bucket | null } {
  if (isBucketBlocked(bucket, now)) {
    return { admitted: false, failureCount: bucket!.failureCount, newlyBlocked: false, state: bucket };
  }
  // Preserve escalation across the original window. After the 60-minute block,
  // start a new cycle. Before 5, use the normal 15-minute counting window.
  const reset = !bucket || bucket.failureCount >= 7 ||
    (bucket.failureCount < 5 && now.getTime() - bucket.windowStartedAt.getTime() >= RATE_LIMIT_WINDOW_MINUTES * 60_000);
  const failureCount = reset ? 1 : bucket.failureCount + 1;
  const minutes = failureCount === 5 ? 5 : failureCount === 6 ? 15 : failureCount === 7 ? 60 : 0;
  return {
    admitted: true, failureCount, newlyBlocked: minutes > 0,
    state: {
      failureCount, windowStartedAt: reset ? now : bucket!.windowStartedAt,
      // A reserved attempt counts conservatively if the process dies.
      lastFailureAt: now, blockedUntil: minutes ? new Date(now.getTime() + minutes * 60_000) : null,
    },
  };
}

export function nextIpFailure(bucket: Bucket | null, now: Date): { state: Bucket; newlyBlocked: boolean } {
  if (isBucketBlocked(bucket, now)) return { state: bucket!, newlyBlocked: false };
  const reset = !bucket || now.getTime() - bucket.windowStartedAt.getTime() >= RATE_LIMIT_WINDOW_MINUTES * 60_000;
  const failureCount = reset ? 1 : bucket.failureCount + 1;
  const newlyBlocked = failureCount >= 20;
  return {
    newlyBlocked,
    state: {
      failureCount, windowStartedAt: reset ? now : bucket!.windowStartedAt, lastFailureAt: now,
      blockedUntil: newlyBlocked ? new Date(now.getTime() + 15 * 60_000) : null,
    },
  };
}
