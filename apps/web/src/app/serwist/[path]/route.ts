import { randomUUID } from "node:crypto";

import { createSerwistRoute } from "@serwist/turbopack";

import { OFFLINE_PAGES } from "@/sw/offline";

// Builds /serwist/sw.js at build time (src/sw/sw.ts), with the precache manifest injected.
// A new revision per deploy makes browsers refetch the offline pages.
const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute(
  {
    swSrc: "src/sw/sw.ts",
    useNativeEsbuild: true,
    esbuildOptions: {
      define: { MODELS_PATH: JSON.stringify(process.env.NEXT_PUBLIC_MODELS_PATH) },
    },
    additionalPrecacheEntries: OFFLINE_PAGES.map(({ url }) => ({ url, revision })),
    // The app shell: Next's static JS/CSS/fonts and the brand images. The MediaPipe files
    // (~35 MB) are not precached; they are cached on first use or prefetched (lib/cv/prefetch.ts).
    globPatterns: [
      ".next/static/**/*.{js,css,woff2,png,svg,ico,webp}",
      "public/brand/*.png",
      "public/icons/*.png",
    ],
  },
);
