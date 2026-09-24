import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { hashSessionToken } from "./session-token";
import { findSessionByTokenHash, revokeSession } from "./repositories/session-repository";
import { recordSecurityEvent } from "./repositories/security-event-repository";
import { serializable } from "./transaction";

// Called only for a newly issued server token whose cookie could not be written.
// A failed issuance is not a user logout.
export async function compensateSessionIssuance(db: PrismaClient, token: string): Promise<void> {
  const tokenHash = hashSessionToken(token);
  await serializable(db, async (tx) => {
    const session = await findSessionByTokenHash(tx, tokenHash);
    if (!session) return;
    const now = new Date(Math.max(Date.now(), session.createdAt.getTime()));
    const result = await revokeSession(tx, session.id, now);
    if (result.count) {
      await recordSecurityEvent(tx, { type: "SESSION_REVOKED", appUserId: session.appUserId });
    }
  });
}
