import "server-only";
import { z } from "zod";
import type { PrismaClient } from "@/generated/prisma/client";
import { organizationInputSchema, appUserInputSchema } from "@/domain/schemas";
import { normalizeUsername, validateUsername } from "./username";
import { hashPassword, validatePassword } from "./password";
import { serializable } from "./transaction";
import { recordSecurityEvent } from "./repositories/security-event-repository";

export function assertBootstrapAllowed(flag: string | undefined) {
  if (flag !== "1") throw new Error("Bootstrap bloqueado: CARTEVY_ALLOW_AUTH_BOOTSTRAP=1 é obrigatório.");
}

export function parseBootstrapInput(input: unknown) {
  const schema = z.object({
    organizationName: organizationInputSchema.shape.name,
    organizationSlug: organizationInputSchema.shape.slug,
    name: appUserInputSchema.shape.name,
    email: appUserInputSchema.shape.email,
    username: z.string().max(256).transform(normalizeUsername).refine(validateUsername),
    password: z.string().refine(validatePassword),
    confirmation: z.string(),
  }).strict().refine((value) => value.password === value.confirmation);
  const result = schema.safeParse(input);
  if (!result.success) throw new Error("Dados de bootstrap inválidos. Confira os campos e a confirmação de senha.");
  return result.data;
}

export async function bootstrapAuthUser(db: PrismaClient, input: unknown, pepper: string, allow: string | undefined) {
  assertBootstrapAllowed(allow);
  const data = parseBootstrapInput(input);
  if (await db.authCredential.count()) throw new Error("Bootstrap inicial indisponível: já existe credencial.");
  const passwordHash = await hashPassword(data.password, pepper);
  return serializable(db, async (tx) => {
    // Serializable predicate read prevents two concurrent initial bootstraps.
    if (await tx.authCredential.count()) throw new Error("Bootstrap inicial indisponível: já existe credencial.");
    const organization = await tx.organization.create({ data: { name: data.organizationName, slug: data.organizationSlug } });
    const user = await tx.appUser.create({ data: { organizationId: organization.id, name: data.name, email: data.email, status: "ACTIVE" } });
    await tx.authCredential.create({ data: { appUserId: user.id, username: data.username, passwordHash } });
    await recordSecurityEvent(tx, { type: "BOOTSTRAP_USER_CREATED", appUserId: user.id });
    return { organizationId: organization.id, appUserId: user.id, username: data.username };
  });
}
