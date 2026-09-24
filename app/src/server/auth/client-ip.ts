import "server-only";
import { isIP } from "node:net";

export function getClientIp(
  headers: Pick<Headers, "get">,
  environment = { vercel: process.env.VERCEL, nodeEnv: process.env.NODE_ENV },
): string | null {
  if (environment.vercel === "1") {
    // Only trust the platform-overwritten header when deployed on Vercel.
    const value = headers.get("x-vercel-forwarded-for");
    if (!value || value.length > 2048) return null;
    for (const entry of value.split(",")) {
      const ip = entry.trim();
      if (isIP(ip) && !ip.includes("%")) {
        // Canonicalize IPv6 so equivalent spellings share a bucket.
        return isIP(ip) === 6 ? new URL(`http://[${ip}]/`).hostname.slice(1, -1) : ip;
      }
    }
    return null;
  }
  if (environment.nodeEnv === "development" || environment.nodeEnv === "test") return "127.0.0.1";
  return null;
}
