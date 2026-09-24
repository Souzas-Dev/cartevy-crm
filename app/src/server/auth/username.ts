import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from "./constants";

// Normalize first, then validate the resulting canonical username.
export function normalizeUsername(username: string): string {
  if (typeof username !== "string") {
    throw new TypeError("Username must be a string.");
  }
  return username.normalize("NFKC").trim().toLowerCase();
}

// Validation never transforms the input.
export function validateUsername(username: unknown): username is string {
  return (
    typeof username === "string" &&
    username.length >= USERNAME_MIN_LENGTH &&
    username.length <= USERNAME_MAX_LENGTH &&
    !/[^a-z0-9._-]/.test(username)
  );
}
