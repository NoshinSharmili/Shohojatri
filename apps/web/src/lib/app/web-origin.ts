"use client";

import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api/client";

/** Where links and QR codes should point: the API's PUBLIC_WEB_URL in production, so a link
 *  made on a preview deployment still opens the real site; this origin in development. */
export function useWebOrigin(): string {
  const config = useQuery({
    queryKey: ["client-config"],
    queryFn: () => unwrap(api.GET("/api/v1/client-config")),
    staleTime: Infinity,
  });
  // Links are only built in the browser, but a server render must not crash on `window`.
  const own = typeof window === "undefined" ? "" : window.location.origin;
  return config.data?.public_web_url ?? own;
}
