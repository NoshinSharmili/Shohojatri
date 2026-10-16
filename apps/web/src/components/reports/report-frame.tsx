"use client";

import { ArrowLeft, Download, FlaskConical } from "lucide-react";
import Image from "next/image";
import { type Locale, NextIntlClientProvider, type Messages, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import { Link, usePathname } from "@/lib/i18n/navigation";

const WORDMARKS = {
  bn: { src: "/brand/wordmark_bn.png", width: 96, alt: "সহযাত্রী" },
  en: { src: "/brand/wordmark_en.png", width: 143, alt: "Shohojatri" },
} as const;

/** Above the sheet, on screen only: back, report language and "Download PDF" (the browser's
 *  print dialog, which shapes Bangla reliably; SCREENING_SPEC §7). */
export function ReportToolbar({
  back,
  lang,
}: {
  back?: { href: string; label: string };
  /** The doctor report's language toggle; omitted where the report follows the app language. */
  lang?: Locale;
}) {
  const t = useTranslations("report");
  const tToggle = useTranslations("common.languageToggle");
  const pathname = usePathname();
  return (
    <div className="mx-auto mb-5 flex w-full max-w-[210mm] flex-wrap items-center gap-3 print:hidden">
      {back && (
        <Link
          href={back.href}
          className="mr-auto inline-flex min-h-12 items-center gap-2 font-semibold text-text-link hover:underline"
        >
          <ArrowLeft aria-hidden className="size-5" />
          {back.label}
        </Link>
      )}
      {lang && (
        <div role="group" aria-label={t("language")} className="flex items-center gap-2">
          <span className="text-small text-text-2">{t("language")}</span>
          <span className="inline-flex rounded-pill bg-n-100 p-1">
            {(["en", "bn"] as const).map((option) => (
              <Link
                key={option}
                href={`${pathname}?lang=${option}`}
                replace
                scroll={false}
                aria-current={option === lang ? "true" : undefined}
                className={cx(
                  "inline-flex min-h-10 items-center rounded-pill px-4 font-semibold no-underline",
                  option === lang ? "bg-white text-navy shadow-xs" : "text-text-2",
                )}
              >
                {tToggle(option)}
              </Link>
            ))}
          </span>
        </div>
      )}
      <div className={cx("flex flex-col items-end", !back && "ml-auto")}>
        <Button icon={Download} onClick={() => window.print()}>
          {t("print")}
        </Button>
        <span className="mt-1 text-caption text-text-3">{t("printHint")}</span>
      </div>
    </div>
  );
}

/** The A4 page: a white sheet on screen, the bare page when printed (@page in globals.css). */
export function ReportSheet({ lang, children }: { lang: Locale; children: ReactNode }) {
  return (
    <article
      lang={lang}
      className={cx(
        "mx-auto flex w-full max-w-[210mm] flex-col gap-5 rounded-lg bg-white p-5 text-[15px] leading-[1.6] text-text-1 shadow-md",
        "sm:p-[12mm] print:max-w-none print:gap-4 print:rounded-none print:p-0 print:shadow-none",
        "print:[print-color-adjust:exact]",
      )}
    >
      {children}
    </article>
  );
}

export function Wordmark({ lang }: { lang: Locale }) {
  const mark = WORDMARKS[lang];
  return (
    <Image src={mark.src} alt={mark.alt} width={mark.width} height={34} className="h-8.5 w-auto" />
  );
}

export function DemoStamp() {
  const t = useTranslations("report");
  return (
    <p className="m-0 flex items-center gap-2 rounded-md border-2 border-dashed border-amber bg-amber-50 px-4 py-2 font-bold tracking-wide text-amber-ink">
      <FlaskConical aria-hidden className="size-5 shrink-0" />
      {t("demo")}
    </p>
  );
}

/** Renders the doctor report in its own language, whatever the app's (SCREENING_SPEC §7). */
export function ReportLanguage({
  lang,
  messages,
  children,
}: {
  lang: Locale;
  messages: Partial<Messages>;
  children: ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={lang} messages={messages} timeZone="Asia/Dhaka">
      {children}
    </NextIntlClientProvider>
  );
}
