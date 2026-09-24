import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { hashSessionToken } from "./session-token";
import { isSessionToken } from "./session-policy";
import { findSessionByTokenHash, revokeSession } from "./repositories/session-repository";
import { recordSecurityEvent } from "./repositories/security-event-repository";
import { serializable } from "./transaction";

export async function logoutSession(db: PrismaClient, token: unknown): Promise<void> {
  if (!isSessionToken(token)) return;
  const tokenHash = hashSessionToken(token);
  await serializable(db, async (tx) => {
    // The server cookie itself authenticates ownership of the session to revoke.
    const session = await findSessionByTokenHash(tx, tokenHash);
    if (!session) return;
    const now = new Date(Math.max(Date.now(), session.createdAt.getTime()));
    const result = await revokeSession(tx, session.id, now);
    if (result.count) {
      await recordSecurityEvent(tx, { type: "SESSION_REVOKED", appUserId: session.appUserId });
      await recordSecurityEvent(tx, { type: "LOGOUT", appUserId: session.appUserId });
    }
  });
}
