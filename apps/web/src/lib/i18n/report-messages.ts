import type { Locale, Messages } from "next-intl";

import { routing } from "./routing";

/**
 * The doctor report has its own language, English by default with a বাংলা toggle (SCREENING_SPEC
 * §7), independent of the app's. The page loads that language's messages for the namespaces the
 * report renders and gives them to a nested intl provider.
 */
export async function reportMessages(lang: Locale): Promise<Partial<Messages>> {
  const all = (await import(`../../../messages/${lang}.json`)).default as Messages;
  // `screening` for answer labels, domains, informants and game names; `errors` for the QR
  // button's failure message.
  const { report, results, findings, recommendations, children, common, screening, errors } = all;
  return { report, results, findings, recommendations, children, common, screening, errors };
}

/** `?lang=` on report pages: a supported locale, else English. */
export function reportLang(value: string | string[] | undefined): Locale {
  return routing.locales.find((locale) => locale === value) ?? "en";
}
