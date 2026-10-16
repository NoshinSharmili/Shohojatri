"use client";

import { Link2Off, Lock } from "lucide-react";
import Image from "next/image";
import { type Locale, type Messages, useFormatter, useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { StateView } from "@/components/ui/state-view";
import { ApiRequestError } from "@/lib/api/client";
import { useErrorMessage } from "@/lib/api/error-message";
import { useWebOrigin } from "@/lib/app/web-origin";
import { usePathname } from "@/lib/i18n/navigation";
import { useSharedReport } from "@/lib/screening/queries";

import { ClinicianReport } from "./clinician-report";
import { ReportLanguage, ReportToolbar } from "./report-frame";

const CLOSED = {
  share_expired: { title: "expiredTitle", message: "expired" },
  share_revoked: { title: "revokedTitle", message: "revoked" },
  share_not_found: { title: "notFoundTitle", message: "notFound" },
} as const;

/** `/share/[token]`: what a doctor sees when the parent sends a link. Read-only, no account. */
export function SharedReportPage({
  token,
  lang,
  messages,
}: {
  token: string;
  lang: Locale;
  messages: Partial<Messages>;
}) {
  const t = useTranslations("report.shared");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const format = useFormatter();
  const locale = useLocale();
  const pathname = usePathname();
  const origin = useWebOrigin();
  const query = useSharedReport(token);
  const wordmark = locale === "en" ? "/brand/wordmark_en.png" : "/brand/wordmark_bn.png";

  let body;
  if (query.isPending) {
    body = <StateView kind="loading" title={tCommon("loading")} />;
  } else if (query.isError) {
    const code = query.error instanceof ApiRequestError ? query.error.code : null;
    const closed = code && code in CLOSED ? CLOSED[code as keyof typeof CLOSED] : null;
    body = closed ? (
      <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
        <span className="flex size-24 items-center justify-center rounded-full bg-n-100 text-text-2">
          <Link2Off aria-hidden className="size-10" />
        </span>
        <h1 className="m-0 font-display text-h2 font-bold">{t(closed.title)}</h1>
        <p className="m-0 max-w-[40ch] text-text-2">{t(closed.message)}</p>
      </div>
    ) : (
      <StateView
        kind="error"
        message={errorMessage(query.error)}
        action={
          <Button variant="secondary" onClick={() => void query.refetch()}>
            {tCommon("retry")}
          </Button>
        }
      />
    );
  } else {
    const { report, expires_at: expiresAt } = query.data;
    body = (
      <>
        <div className="mx-auto mb-4 flex w-full max-w-[210mm] flex-col gap-1 print:hidden">
          <p className="m-0 flex items-center gap-2 font-semibold">
            <Lock aria-hidden className="size-4.5 text-teal-ink" />
            {t("intro", { name: report.child.name })}
          </p>
          <p className="m-0 text-small text-text-2">
            {t("validUntil", { date: format.dateTime(new Date(expiresAt), { dateStyle: "long" }) })}
          </p>
        </div>
        <ReportToolbar lang={lang} />
        <ReportLanguage lang={lang} messages={messages}>
          <ClinicianReport
            report={report}
            link={{ url: `${origin}/${locale}${pathname}`, expiresAt }}
          />
        </ReportLanguage>
      </>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border-1 bg-white print:hidden">
        <div className="mx-auto flex min-h-14 w-full max-w-(--content-max) items-center gap-2 px-4 py-1.5 md:px-8">
          <Image
            src={wordmark}
            alt={tCommon("appName")}
            width={locale === "en" ? 143 : 96}
            height={34}
            className="mr-auto h-8.5 w-auto"
          />
          <LanguageToggle />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-(--content-max) flex-1 flex-col px-5 pt-6 pb-10 md:px-8 print:max-w-none print:p-0">
        {body}
      </main>
    </div>
  );
}
