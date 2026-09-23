import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

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

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
