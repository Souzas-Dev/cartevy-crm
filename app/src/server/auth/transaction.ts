import "server-only";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";

export async function serializable<T>(db: PrismaClient, operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await db.$transaction(operation, { isolationLevel: "Serializable" });
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
      // P2002 covers concurrent first insertion of a unique rate-limit bucket.
      if (attempt >= 4 || (code !== "P2034" && code !== "P2002")) throw error;
    }
  }
}
