import "server-only";

export type AuthFailureCode = "login_failed_internal" | "session_lookup_failed" | "session_touch_failed" | "logout_failed"
  | "session_cookie_write_failed" | "session_cookie_compensation_failed" | "session_cookie_delete_failed";

// Deliberately excludes the caught error, request, identifiers and credentials.
// Production log monitoring should alert on these stable operational codes.
export function reportAuthFailure(code: AuthFailureCode): void {
  console.error(`[cartevy.auth] ${code}`);
}
