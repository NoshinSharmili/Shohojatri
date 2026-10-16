import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Where the Next server reaches FastAPI. Read at build time (rewrites are compiled into the build).
const apiInternalUrl = process.env.API_INTERNAL_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The browser only ever talks to this origin, so auth cookies (B2) stay first-party.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${apiInternalUrl}/api/v1/:path*` }];
  },
};

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

export default withNextIntl(nextConfig);
