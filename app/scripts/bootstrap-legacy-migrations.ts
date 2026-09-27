import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { Client } from "pg";

import {
  resolveDatabaseSslConfig,
} from "../src/lib/db/create-prisma-client";

const legacyMigrations = [
  "20260923_initial_domain",
  "20260923_harden_persistence",
  "20260923_refine_crm_domain",
  "20260923_support_unregistered_customer_orders",
  "20260923_enforce_registered_customer_identity",
  "20260924_authentication_foundation",
] as const;


function requireExplicitBootstrap(): string {
  if (
    process.env
      .CARTEVY_ALLOW_LEGACY_MIGRATION_BOOTSTRAP !==
    "1"
  ) {
    throw new Error(
      "Bootstrap legado bloqueado: defina CARTEVY_ALLOW_LEGACY_MIGRATION_BOOTSTRAP=1 explicitamente.",
    );
  }

  if (process.argv.length !== 2) {
    throw new Error(
      "Não passe argumentos ao bootstrap legado.",
    );
  }

  const connectionString = process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error(
      "DIRECT_URL não está configurada.",
    );
  }

  return connectionString;
}

function markMigrationApplied(
  migrationName: string,
): void {
  const command =
    process.platform === "win32"
      ? "npx.cmd"
      : "npx";

  const result = spawnSync(
    command,
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

async function assertPublicSchemaIsEmpty(
  client: Client,
): Promise<void> {
  const state = await client.query<{
    relationCount: number;
    enumCount: number;
  }>(
    `
      SELECT
        (
          SELECT count(*)::int
          FROM pg_class AS c
          INNER JOIN pg_namespace AS n
            ON n.oid = c.relnamespace
          WHERE
            n.nspname = 'public'
            AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')
        ) AS "relationCount",
        (
          SELECT count(*)::int
          FROM pg_type AS t
          INNER JOIN pg_namespace AS n
            ON n.oid = t.typnamespace
          WHERE
            n.nspname = 'public'
            AND t.typtype = 'e'
        ) AS "enumCount"
    `,
  );

  const row = state.rows[0];

  if (
    !row ||
    row.relationCount > 0 ||
    row.enumCount > 0
  ) {
    throw new Error(
      "O bootstrap legado exige o schema public vazio.",
    );
  }
}

async function main(): Promise<void> {
  const connectionString =
    requireExplicitBootstrap();

  const client = new Client({
    connectionString,
    ssl: resolveDatabaseSslConfig(
      connectionString,
    ),
  });

  await client.connect();

  try {
    await assertPublicSchemaIsEmpty(client);

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
