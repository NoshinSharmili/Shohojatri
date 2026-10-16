// Service worker, bundled by Serwist into /serwist/sw.js (src/app/serwist/[path]/route.ts).
// - App shell (Next static files, brand images, offline pages): precached.
// - MediaPipe WASM and models (/models/…): cache-first; the folder name is versioned.
// - /api/…: never cached. Child data only ever comes from the network.
// - Pages: Serwist's Next defaults (network first), with an offline page when that fails.
import { defaultCache } from "@serwist/turbopack/worker";
import {
  CacheableResponsePlugin,
  CacheFirst,
  NetworkOnly,
  type PrecacheEntry,
  Serwist,
} from "serwist";

import { OFFLINE_PAGES, offlinePageFor } from "./offline";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};
// Defined by the route that bundles this file: the versioned MediaPipe folder.
declare const MODELS_PATH: string;

const MODELS_CACHE = "mediapipe-models";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // First, so none of the defaults (which cache same-origin /api GETs) can match.
    {
      matcher: ({ sameOrigin, url }) => sameOrigin && url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ sameOrigin, url }) => sameOrigin && url.pathname.startsWith("/models/"),
      handler: new CacheFirst({
        cacheName: MODELS_CACHE,
        plugins: [new CacheableResponsePlugin({ statuses: [200] })],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: OFFLINE_PAGES.map(({ url }) => ({
      url,
      matcher: ({ request }) =>
        request.destination === "document" && offlinePageFor(new URL(request.url).pathname) === url,
    })),
  },
});

// Drop model folders of older MediaPipe versions; only the current one is ever requested.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.open(MODELS_CACHE).then(async (cache) => {
      const current = MODELS_PATH;
      for (const request of await cache.keys()) {
        if (!new URL(request.url).pathname.startsWith(`${current}/`)) await cache.delete(request);
      }
    }),
  );
});

serwist.addEventListeners();
