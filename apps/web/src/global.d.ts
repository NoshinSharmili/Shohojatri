import type bn from "../messages/bn.json";
import type { routing } from "@/lib/i18n/routing";

// Type-safe locales and message keys for next-intl (bn.json is the reference catalogue).
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof bn;
  }
}
