import "server-only";
import { hashSessionToken } from "./session-token";
import { isSessionToken, isSessionValid, needsSessionTouch, toAuthContext } from "./session-policy";
import type { AuthContext, Session } from "./types";

export async function resolveAuthContext(
  token: unknown,
  find: (hash: string) => Promise<Session | null>,
  now: Date,
  scheduleTouch: (session: Session) => void,
): Promise<AuthContext | null> {
  if (!isSessionToken(token)) return null;
  const session = await find(hashSessionToken(token));
  if (!session || !isSessionValid(session, now)) return null;
  if (needsSessionTouch(session, now)) scheduleTouch(session);
  return toAuthContext(session);
}
