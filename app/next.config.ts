import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Includes the verified CA when deploying the Node server to Vercel.
  outputFileTracingIncludes: { "/*": ["./certs/supabase-prod-ca-2021.crt"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(process.env.NODE_ENV === "production") }];
  },
};

export default nextConfig;
