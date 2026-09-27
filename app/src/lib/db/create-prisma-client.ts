import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

type DatabaseSslConfig =
  | false
  | {
      ca: string;
      rejectUnauthorized: true;
    };

const localDatabaseHosts = new Set([
  "127.0.0.1",
  "localhost",
]);

export function resolveDatabaseSslConfig(
  connectionString: string,
  mode = process.env.DATABASE_SSL_MODE ?? "verify-full",
): DatabaseSslConfig {
  if (mode === "disable") {
    const host = new URL(connectionString).hostname;

    if (!localDatabaseHosts.has(host)) {
      throw new Error(
        "DATABASE_SSL_MODE=disable só é permitido para banco local.",
      );
    }

    return false;
  }

  if (mode !== "verify-full") {
    throw new Error(
      "DATABASE_SSL_MODE deve ser verify-full ou disable.",
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

  return {
    ca,
    rejectUnauthorized: true,
  };
}

export function createPrismaClient(
  connectionString = process.env.DATABASE_URL,
): PrismaClient {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não está configurada para o Cartevy CRM.",
    );
  }

  const adapter = new PrismaPg({
    connectionString,
    max: 1,
    ssl: resolveDatabaseSslConfig(
      connectionString,
    ),
  });

  return new PrismaClient({
    adapter,
  });
}
