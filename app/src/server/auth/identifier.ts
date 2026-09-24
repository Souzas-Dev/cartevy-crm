import "server-only";
import { createHmac } from "node:crypto";

export function hashIdentifier(identifier: string, secret: string): string {
  if (!secret.trim()) throw new Error("Missing identifier hashing secret.");
  return createHmac("sha256", secret).update(identifier, "utf8").digest("hex");
}
