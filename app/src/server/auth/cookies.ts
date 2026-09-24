import "server-only";
import { cookies } from "next/headers";
import { getSessionCookieName, sessionCookieOptions } from "./cookie-policy";
export { getSessionCookieName } from "./cookie-policy";

export async function readSessionCookie(): Promise<string | undefined> {
  return (await cookies()).get(getSessionCookieName())?.value;
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(getSessionCookieName(), token, sessionCookieOptions());
}

export async function deleteSessionCookie(): Promise<void> {
  (await cookies()).set(getSessionCookieName(), "", { ...sessionCookieOptions(), maxAge: 0 });
}
