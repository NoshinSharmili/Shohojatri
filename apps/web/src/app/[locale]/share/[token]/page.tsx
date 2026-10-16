import type { Metadata } from "next";

import { SharedReportPage } from "@/components/reports/shared-report";
import { pageMetadata } from "@/lib/i18n/metadata";
import { reportLang, reportMessages } from "@/lib/i18n/report-messages";

const titleOnly = pageMetadata("sharedReport");

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // Child data behind a secret link: keep it out of search engines.
  return { ...(await titleOnly(props)), robots: { index: false, follow: false } };
}

/** Public, read-only doctor report behind a share link (SCREENING_SPEC §7). No login. */
export default async function SharedReport({
  params,
  searchParams,
}: PageProps<"/[locale]/share/[token]">) {
  const lang = reportLang((await searchParams).lang);
  return (
    <SharedReportPage
      token={(await params).token}
      lang={lang}
      messages={await reportMessages(lang)}
    />
  );
}
