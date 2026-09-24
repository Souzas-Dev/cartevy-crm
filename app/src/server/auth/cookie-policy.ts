export function getSessionCookieName(environment = process.env.NODE_ENV): string {
  return environment === "development" ? "cartevy_session" : "__Host-cartevy_session";
}

export function sessionCookieOptions(environment = process.env.NODE_ENV) {
  return {
    httpOnly: true,
    secure: environment !== "development",
    sameSite: "strict" as const,
    path: "/",
  };
}
