import "server-only";
import { AUTH_SECRET_MIN_BYTES } from "./constants";

function requiredSecret(name: "AUTH_PASSWORD_PEPPER" | "AUTH_RATE_LIMIT_SECRET"): string {
  const value = process.env[name];
  if (!value?.trim() || Buffer.byteLength(value, "utf8") < AUTH_SECRET_MIN_BYTES) {
    throw new Error(`Invalid server configuration: ${name}`);
  }
  return value;
}

export function getPasswordPepper(): string {
  return requiredSecret("AUTH_PASSWORD_PEPPER");
}

export function getRateLimitSecret(): string {
  return requiredSecret("AUTH_RATE_LIMIT_SECRET");
}

export function getAuthRuntimeSecrets() {
  const pepper = getPasswordPepper();
  const rateLimitSecret = getRateLimitSecret();
  if (pepper === rateLimitSecret) throw new Error("Authentication secrets must be distinct.");
  return { pepper, rateLimitSecret };
}
