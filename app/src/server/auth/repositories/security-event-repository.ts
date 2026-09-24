import "server-only";
import type { Prisma, AuthSecurityEventType } from "@/generated/prisma/client";

export type SecurityEventInput = {
  type: AuthSecurityEventType;
  appUserId?: string | null;
  identifierHash?: string | null;
  ipHash?: string | null;
};

export function recordSecurityEvent(db: Prisma.TransactionClient, input: SecurityEventInput) {
  // Explicit allowlist: do not spread caller input or accept generic metadata.
  return db.authSecurityEvent.create({
    data: {
      type: input.type, appUserId: input.appUserId,
      identifierHash: input.identifierHash, ipHash: input.ipHash,
    },
    select: { id: true },
  });
}
