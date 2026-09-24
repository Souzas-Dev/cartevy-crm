import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { validateUsername } from "../username";

export const authUserSelect = { id: true, organizationId: true, name: true, status: true } as const;

export function findCredentialByUsername(db: Prisma.TransactionClient, username: string) {
  if (!validateUsername(username)) throw new Error("Expected canonical username.");
  return db.authCredential.findUnique({
    where: { username },
    select: {
      id: true, appUserId: true, username: true, passwordHash: true, passwordChangedAt: true,
      appUser: { select: authUserSelect },
    },
  });
}
