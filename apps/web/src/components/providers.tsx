"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

// Imported for its side effect: catches Chrome's install prompt as early as possible.
import "@/lib/pwa/install";

export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session; useState keeps it stable across re-renders.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }),
  );
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      // A service worker in `next dev` would serve stale code; production builds only.
      disable={process.env.NODE_ENV === "development"}
      // A classic worker (the bundle has no imports) also registers on older iPhones.
      options={{ scope: "/", type: "classic" }}
      // Never reload on reconnect: it would end a screening game in the middle.
      reloadOnOnline={false}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SerwistProvider>
  );
}
