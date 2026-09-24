import "server-only";
import type { AuthFailureCode } from "./logging";
import { LOGIN_ERROR } from "./constants";

type CookieIssuanceDependencies = {
  set(token: string): Promise<void>;
  compensate(token: string): Promise<void>;
  clear(): Promise<void>;
  report(code: AuthFailureCode): void;
};

// The token stays inside the server/cookie boundary, including error handling.
export async function issueSessionCookie(token: string, deps: CookieIssuanceDependencies) {
  try {
    await deps.set(token);
    return { ok: true } as const;
  } catch {
    deps.report("session_cookie_write_failed");
    try { await deps.compensate(token); }
    catch { deps.report("session_cookie_compensation_failed"); }
    try { await deps.clear(); }
    catch { deps.report("session_cookie_delete_failed"); }
    return { ok: false, message: LOGIN_ERROR } as const;
  }
}
