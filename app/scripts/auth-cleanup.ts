import dotenv from "dotenv";
import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import { cleanupAuthSessions } from "../src/server/auth/cleanup-service";

dotenv.config({ path: ".env.local", quiet: true });

async function main() {
  if (process.env.CARTEVY_ALLOW_AUTH_CLEANUP !== "1") throw new Error("Cleanup não autorizado.");
  const db = createPrismaClient();
  try {
    const result = await cleanupAuthSessions(db);
    console.info(`Sessões removidas: ${result.sessionsRemoved}`);
    console.info(`Buckets de rate limit removidos: ${result.rateLimitBucketsRemoved}`);
  } finally { await db.$disconnect(); }
}

main().catch(() => {
  console.error("Cleanup não concluído. Confira CARTEVY_ALLOW_AUTH_CLEANUP=1 e a configuração.");
  process.exitCode = 1;
});
