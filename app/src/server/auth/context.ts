import "server-only";
import { cache } from "react";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { readSessionCookie } from "./cookies";
import { getAuthDb } from "./runtime";
import { findSessionByTokenHash, touchSession } from "./repositories/session-repository";
import { resolveAuthContext } from "./context-service";
import { reportAuthFailure } from "./logging";

export const getAuthContext = cache(async () => {
  const token = await readSessionCookie();
  try {
    return await resolveAuthContext(token,
      async (hash) => findSessionByTokenHash(await getAuthDb(), hash),
      new Date(),
      (session) => after(async () => {
        try {
          await touchSession(await getAuthDb(), session.id, session.absoluteExpiresAt, new Date());
        } catch { reportAuthFailure("session_touch_failed"); }
      }),
    );
  } catch {
    reportAuthFailure("session_lookup_failed");
    return null; // Fail closed; no authenticated page on a database error.
  }
});

export async function requireAuthContext() {
  const context = await getAuthContext();
  if (!context) redirect("/login");
  return context;
}
