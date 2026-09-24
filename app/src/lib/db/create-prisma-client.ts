import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

export function createPrismaClient(
  connectionString = process.env.DATABASE_URL,
): PrismaClient {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não está configurada para o Cartevy CRM.",
    );
  }

  const ca = readFileSync(
    join(
      process.cwd(),
      "certs",
      "supabase-prod-ca-2021.crt",
    ),
    "utf8",
  );

  const adapter = new PrismaPg({
    connectionString,
    max: 1,
    ssl: {
      ca,
      rejectUnauthorized: true,
    },
  });

  return new PrismaClient({
    adapter,
  });
}
