import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { Client } from "pg";

const legacyMigrations = [
  "20260923_initial_domain",
  "20260923_harden_persistence",
  "20260923_refine_crm_domain",
  "20260923_support_unregistered_customer_orders",
  "20260923_enforce_registered_customer_identity",
  "20260924_authentication_foundation",
] as const;

function requireDisposableCiDatabase(): string {
  if (process.env.CI !== "true") {
    throw new Error(
      "O bootstrap legado só pode executar no CI.",
    );
  }

  const connectionString = process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error(
      "DIRECT_URL não está configurada.",
    );
  }

  const host = new URL(connectionString).hostname;

  if (
    host !== "127.0.0.1" &&
    host !== "localhost"
  ) {
    throw new Error(
      "O bootstrap legado exige PostgreSQL local descartável.",
    );
  }

  return connectionString;
}

function markMigrationApplied(
  migrationName: string,
): void {
  const result = spawnSync(
    "npx",
    [
      "prisma",
      "migrate",
      "resolve",
      "--applied",
      migrationName,
    ],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `Falha ao registrar migration ${migrationName} como aplicada.`,
    );
  }
}

async function main(): Promise<void> {
  const connectionString =
    requireDisposableCiDatabase();

  const client = new Client({
    connectionString,
    ssl: false,
  });

  await client.connect();

  try {
    const existing = await client.query<{
      organizations: string | null;
      migrationHistory: string | null;
    }>(
      `
        SELECT
          to_regclass('public.organizations')::text AS "organizations",
          to_regclass('public._prisma_migrations')::text AS "migrationHistory"
      `,
    );

    const state = existing.rows[0];

    if (
      state?.organizations ||
      state?.migrationHistory
    ) {
      throw new Error(
        "O bootstrap legado exige um banco vazio.",
      );
    }

    for (const migrationName of legacyMigrations) {
      const migrationPath = join(
        process.cwd(),
        "prisma",
        "migrations",
        migrationName,
        "migration.sql",
      );

      const sql = await readFile(
        migrationPath,
        "utf8",
      );

      console.info(
        `Aplicando migration histórica: ${migrationName}`,
      );

      await client.query("BEGIN");

      try {
        await client.query(sql);
        await client.query("COMMIT");
      }
      catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }

      markMigrationApplied(
        migrationName,
      );
    }
  }
  finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(
    "Falha ao reconstruir o histórico legado de migrations.",
  );

  if (error instanceof Error) {
    console.error(error.message);
  }

  process.exitCode = 1;
});
