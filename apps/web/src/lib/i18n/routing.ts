import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["bn", "en"],
  defaultLocale: "bn",
  // Bangla-first: "/" always goes to /bn, whatever the browser's language (CLAUDE.md §6).
  // The per-user choice is remembered server-side in users.preferred_locale.
  localeDetection: false,
});
