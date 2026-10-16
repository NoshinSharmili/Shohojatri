import type { Metadata, Viewport } from "next";
import { Baloo_Da_2, Hind_Siliguri } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DemoBanner } from "@/components/app/demo-banner";
import { Providers } from "@/components/providers";
import { routing } from "@/lib/i18n/routing";

import "../globals.css";

// Self-hosted by next/font at build time. Variables are consumed by --font-body / --font-display
// in src/styles/tokens.css.
const hind = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});
const baloo = Baloo_Da_2({
  subsets: ["bengali", "latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("title"), template: `%s · ${t("title")}` },
    description: t("description"),
    // A pitch demo: kept out of search engines (next.config.ts also sends X-Robots-Tag).
    robots: { index: false, follow: false },
    icons: { apple: "/icons/apple-touch-icon.png" },
    appleWebApp: { capable: true, title: t("title"), statusBarStyle: "default" },
    // Next only emits the standard mobile-web-app-capable tag; older iOS needs Apple's name.
    other: { "apple-mobile-web-app-capable": "yes" },
  };
}

export const viewport: Viewport = { themeColor: "#004E8B" };

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${hind.variable} ${baloo.variable}`}>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <Providers>
            <DemoBanner />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
