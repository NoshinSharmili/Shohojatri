import type { Metadata } from "next";
import { hasLocale, type Messages } from "next-intl";
import { getTranslations } from "next-intl/server";

import { routing } from "./routing";

/** `generateMetadata` for a page whose <title> is `meta.pages.<key>` (layout adds the app name). */
export function pageMetadata(key: keyof Messages["meta"]["pages"]) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) return {};
    const t = await getTranslations({ locale, namespace: "meta.pages" });
    return { title: t(key) };
  };
}
