"use server";

import { redirect } from "next/navigation";
import { readSessionCookie, deleteSessionCookie } from "@/server/auth/cookies";
import { isSessionToken } from "@/server/auth/session-policy";
import { logoutSession } from "@/server/auth/logout-service";
import { getAuthDb } from "@/server/auth/runtime";
import { reportAuthFailure } from "@/server/auth/logging";

export async function logoutAction(): Promise<void> {
  const token = await readSessionCookie();
  try {
    // Ownership is revalidated from the server cookie, not a client-supplied ID.
    if (isSessionToken(token)) await logoutSession(await getAuthDb(), token);
  } catch {
    reportAuthFailure("logout_failed");
    // Delete the browser credential even during an outage. Server expiry remains enforced.
  } finally {
    await deleteSessionCookie();
  }
  redirect("/login");
}
