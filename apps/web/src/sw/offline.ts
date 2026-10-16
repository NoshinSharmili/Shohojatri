// The offline fallback pages (src/app/[locale]/offline), one per locale. Shared by the
// service worker and the route that builds it, so both precache and serve the same URLs.
export const OFFLINE_PAGES = [
  { locale: "en", url: "/en/offline" },
  { locale: "bn", url: "/bn/offline" },
] as const;

/** The offline page for a URL: English under /en, Bangla (the default) everywhere else. */
export function offlinePageFor(pathname: string): string {
  const [en, bn] = OFFLINE_PAGES;
  return pathname === "/en" || pathname.startsWith("/en/") ? en.url : bn.url;
}
