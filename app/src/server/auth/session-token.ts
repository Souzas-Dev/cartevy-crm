import { createHash, randomBytes } from "node:crypto";

import { SESSION_TOKEN_BYTES } from "./constants";

// The raw bearer token must remain secret. Only its hash is for future storage.
export function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_BYTES).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
