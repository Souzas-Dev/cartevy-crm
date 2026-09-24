import dotenv from "dotenv";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import { hashPassword } from "../src/server/auth/password";
import { hashIdentifier } from "../src/server/auth/identifier";
import { generateSessionToken, hashSessionToken } from "../src/server/auth/session-token";
import { findCredentialByUsername } from "../src/server/auth/repositories/credential-repository";
import { createSession, findSessionByTokenHash, revokeSession } from "../src/server/auth/repositories/session-repository";
import { reserveUsernameAttempt, recordIpFailure, findBucket, resetUsernameBucket } from "../src/server/auth/repositories/rate-limit-repository";
import { recordSecurityEvent } from "../src/server/auth/repositories/security-event-repository";
import { serializable } from "../src/server/auth/transaction";
import { isSessionValid } from "../src/server/auth/session-policy";

dotenv.config({ path: ".env.local", quiet: true });

async function main() {
  if (process.env.CARTEVY_ALLOW_AUTH_INTEGRATION !== "1") throw new Error("Teste remoto não autorizado.");
  const db = createPrismaClient();
  const id = randomUUID();
  const userId = randomUUID();
  const username = `test_${id.replaceAll("-", "")}`;
  const secret = randomBytes(32).toString("hex");
  const keyHash = hashIdentifier(username, secret);
  try {
    const passwordHash = await hashPassword(randomBytes(32).toString("hex"), secret);
    await db.organization.create({ data: { id, name: "AUTH INTEGRATION SYNTHETIC", slug: `auth-test-${id}` } });
    await db.appUser.create({ data: { id: userId, organizationId: id, name: "Synthetic Auth Test" } });
    await db.authCredential.create({ data: { appUserId: userId, username, passwordHash } });
    assert.equal((await findCredentialByUsername(db, username))?.appUserId, userId);
    const tokenHash = hashSessionToken(generateSessionToken());
    const now = new Date();
    const session = await createSession(db, userId, tokenHash, now);
    assert.equal((await findSessionByTokenHash(db, tokenHash))?.id, session.id);
    assert.ok(isSessionValid(session, now));
    await revokeSession(db, session.id, now);
    assert.ok((await findSessionByTokenHash(db, tokenHash))?.revokedAt);
    await Promise.all(Array.from({ length: 4 }, () => serializable(db, (tx) => reserveUsernameAttempt(tx, keyHash, now))));
    assert.equal((await findBucket(db, "USERNAME", keyHash))?.failureCount, 4);
    await serializable(db, async (tx) => {
      await recordIpFailure(tx, keyHash, now);
      await resetUsernameBucket(tx, keyHash);
      await recordSecurityEvent(tx, { type: "SESSION_REVOKED", appUserId: userId, identifierHash: keyHash });
    });
    assert.equal(await findBucket(db, "USERNAME", keyHash), null);
    assert.equal((await findBucket(db, "IP", keyHash))?.failureCount, 1);
    assert.equal(await db.authSecurityEvent.count({ where: { appUserId: userId } }), 1);
    console.info("Teste de persistência auth concluído com dados sintéticos.");
  } finally {
    try {
      await db.$transaction(async (tx) => {
        await tx.authSecurityEvent.deleteMany({ where: { appUserId: userId } });
        await tx.authRateLimitBucket.deleteMany({ where: { keyHash } });
        await tx.appUser.deleteMany({ where: { id: userId, organizationId: id } });
        await tx.organization.deleteMany({ where: { id } });
      });
    } finally { await db.$disconnect(); }
  }
}

main().catch(() => {
  console.error("Teste de persistência auth falhou. Verifique também a limpeza dos dados sintéticos.");
  process.exitCode = 1;
});
