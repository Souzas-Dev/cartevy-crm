import dotenv from "dotenv";
import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import { assertBootstrapAllowed, bootstrapAuthUser } from "../src/server/auth/bootstrap-service";
import { getPasswordPepper } from "../src/server/auth/config";
import { prompt } from "./auth-prompt";

dotenv.config({ path: ".env.local", quiet: true });

async function main() {
  assertBootstrapAllowed(process.env.CARTEVY_ALLOW_AUTH_BOOTSTRAP);
  if (process.argv.length !== 2) throw new Error("Não passe argumentos ao bootstrap.");
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("Terminal interativo obrigatório.");
  const pepper = getPasswordPepper();
  const db = createPrismaClient();
  try {
    if (await db.authCredential.count()) throw new Error("Já existe credencial. Bootstrap inicial abortado.");
    const organizationName = await prompt("Nome da organização: ");
    const organizationSlug = await prompt("Slug da organização: ");
    const name = await prompt("Nome do usuário: ");
    const email = (await prompt("Email cadastral (opcional): ")).trim() || undefined;
    const username = await prompt("Username: ");
    const password = await prompt("Senha (não será exibida): ", true);
    const confirmation = await prompt("Confirme a senha: ", true);
    const result = await bootstrapAuthUser(db, {
      organizationName, organizationSlug, name, email, username, password, confirmation,
    }, pepper, process.env.CARTEVY_ALLOW_AUTH_BOOTSTRAP);
    console.info("Bootstrap concluído.", result);
  } finally { await db.$disconnect(); }
}

main().catch(() => {
  console.error("Bootstrap não concluído. Confira a flag, o terminal, os dados, a configuração e a existência de credenciais.");
  process.exitCode = 1;
});
