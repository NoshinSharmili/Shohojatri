import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { MODELS_PATH } from "./scripts/mediapipe-assets.mjs";

// Where the Next server reaches FastAPI, e.g. https://shohojatri-api.onrender.com. Read at build
// time: rewrites are compiled into the build, so change it → redeploy.
const apiOrigin = (process.env.API_ORIGIN ?? "http://localhost:8000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  env: {
    // Versioned folder of the self-hosted MediaPipe files (scripts/mediapipe-assets.mjs).
    NEXT_PUBLIC_MODELS_PATH: MODELS_PATH,
  },
  // The browser only ever talks to this origin, so auth cookies stay first-party.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${apiOrigin}/api/v1/:path*` }];
  },
  async headers() {
    return [
      // A pitch demo: keep every page out of search engines (the layout's meta tag covers HTML).
      { source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      // The folder name carries the MediaPipe version, so its contents never change.
      {
        source: "/models/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Browsers must see a new service worker as soon as it's deployed.
      { source: "/serwist/:path*", headers: [{ key: "Cache-Control", value: "no-cache" }] },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

export default withSerwist(withNextIntl(nextConfig));
