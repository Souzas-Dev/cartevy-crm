import dotenv from "dotenv";

import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import {
  assertBootstrapAllowed,
  bootstrapAuthUser,
} from "../src/server/auth/bootstrap-service";
import {
  getPasswordPepper,
} from "../src/server/auth/config";
import {
  createAuthPromptSession,
} from "./auth-prompt";

dotenv.config({
  path: ".env.local",
  quiet: true,
});

async function main() {
  assertBootstrapAllowed(
    process.env.CARTEVY_ALLOW_AUTH_BOOTSTRAP,
  );

  if (process.argv.length !== 2) {
    throw new Error(
      "Não passe argumentos ao bootstrap.",
    );
  }

  const pepper = getPasswordPepper();
  const db = createPrismaClient();
  const prompts = createAuthPromptSession();

  try {
    if (await db.authCredential.count()) {
      throw new Error(
        "Já existe credencial. Bootstrap inicial abortado.",
      );
    }

    const organizationName =
      await prompts.prompt(
        "Nome da organização: ",
      );

    const organizationSlug =
      await prompts.prompt(
        "Slug da organização: ",
      );

    const name = await prompts.prompt(
      "Nome do usuário: ",
    );

    const email = (
      await prompts.prompt(
        "Email cadastral (opcional): ",
      )
    ).trim() || undefined;

    const username = await prompts.prompt(
      "Username: ",
    );

    const password = await prompts.prompt(
      "Senha (não será exibida): ",
      true,
    );

    const confirmation =
      await prompts.prompt(
        "Confirme a senha: ",
        true,
      );

    const result = await bootstrapAuthUser(
      db,
      {
        organizationName,
        organizationSlug,
        name,
        email,
        username,
        password,
        confirmation,
      },
      pepper,
      process.env.CARTEVY_ALLOW_AUTH_BOOTSTRAP,
    );

    console.info(
      "Bootstrap concluído.",
      result,
    );
  }
  finally {
    prompts.close();
    await db.$disconnect();
  }
}

main().catch(() => {
  console.error(
    "Bootstrap não concluído. Confira a flag, o terminal, os dados, a configuração e a existência de credenciais.",
  );

  process.exitCode = 1;
});
