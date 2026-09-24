"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClientIp } from "@/server/auth/client-ip";
import { setSessionCookie, deleteSessionCookie } from "@/server/auth/cookies";
import { issueSessionCookie } from "@/server/auth/cookie-issuance";
import { compensateSessionIssuance } from "@/server/auth/session-compensation";
import { getAuthDb, authenticationService } from "@/server/auth/runtime";
import { LOGIN_ERROR } from "@/server/auth/constants";
import { reportAuthFailure } from "@/server/auth/logging";

export async function loginAction(_previous: { message: string }, formData: FormData): Promise<{ message: string }> {
  // Duplicate fields and File entries are not valid credentials.
  if (formData.getAll("username").length !== 1 || formData.getAll("password").length !== 1) return { message: LOGIN_ERROR };
  const username = formData.get("username");
  const password = formData.get("password");
  if (typeof username !== "string" || username.length > 256 || typeof password !== "string" || password.length > 256) {
    return { message: LOGIN_ERROR };
  }
  try {
    const clientIp = getClientIp(await headers());
    const db = await getAuthDb();
    const result = await authenticationService(db)({ username, password, clientIp });
    if (!result.ok) return { message: result.message };
    const issued = await issueSessionCookie(result.token, {
      set: setSessionCookie, clear: deleteSessionCookie,
      compensate: (token) => compensateSessionIssuance(db, token), report: reportAuthFailure,
    });
    if (!issued.ok) return { message: issued.message };
  } catch {
    reportAuthFailure("login_failed_internal");
    return { message: LOGIN_ERROR };
  }
  redirect("/"); // Outside catch: Next redirects are control-flow exceptions.
}
