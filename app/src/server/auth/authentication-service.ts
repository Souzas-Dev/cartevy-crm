import "server-only";
import { isIP } from "node:net";
import { hashIdentifier } from "./identifier";
import { normalizeUsername, validateUsername } from "./username";
import { validatePassword } from "./password";
import { generateSessionToken, hashSessionToken } from "./session-token";
import { LOGIN_ERROR, PASSWORD_MAX_LENGTH } from "./constants";
import type { Credential, IdentifierHashes } from "./types";
import type { UsernameAdmission } from "./rate-limit-policy";

export interface AuthenticationDependencies {
  secrets(): { pepper: string; rateLimitSecret: string };
  admit(hashes: IdentifierHashes, now: Date): Promise<UsernameAdmission>;
  findCredential(username: string): Promise<Credential | null>;
  verify(password: string, hash: string, pepper: string): Promise<boolean>;
  dummy(password: string, pepper: string): Promise<void>;
  failure(hashes: IdentifierHashes, admission: UsernameAdmission, now: Date): Promise<void>;
  complete(credential: Credential, tokenHash: string, hashes: IdentifierHashes, admission: UsernameAdmission, now: Date): Promise<boolean>;
  now(): Date;
}

export type LoginResult = { ok: false; message: string } | { ok: true; token: string };

export function createAuthenticationService(deps: AuthenticationDependencies) {
  return async (input: { username: unknown; password: unknown; clientIp?: string | null }): Promise<LoginResult> => {
    const rejected = { ok: false, message: LOGIN_ERROR } as const;
    // Bound hostile input before normalization, hashing, or database access.
    if (typeof input.username !== "string" || input.username.length > 256 ||
        typeof input.password !== "string" || input.password.length > PASSWORD_MAX_LENGTH * 2) return rejected;
    const username = normalizeUsername(input.username);
    const { pepper, rateLimitSecret } = deps.secrets();
    const hashes = {
      identifierHash: hashIdentifier(username, rateLimitSecret),
      ipHash: input.clientIp && isIP(input.clientIp) ? hashIdentifier(input.clientIp, rateLimitSecret) : null,
    };
    const admission = await deps.admit(hashes, deps.now());
    if (!admission.admitted) return rejected;
    const credential = validateUsername(username) ? await deps.findCredential(username) : null;
    let correct = false;
    if (credential && validatePassword(input.password)) {
      correct = await deps.verify(input.password, credential.passwordHash, pepper);
    } else {
      await deps.dummy(input.password, pepper);
    }
    if (!correct || !credential || credential.appUser.status !== "ACTIVE") {
      await deps.failure(hashes, admission, deps.now());
      return rejected;
    }
    const token = generateSessionToken();
    // Only the cookie layer receives this raw token, never a Client Component.
    const completed = await deps.complete(credential, hashSessionToken(token), hashes, admission, deps.now());
    return completed ? { ok: true, token } : rejected;
  };
}
