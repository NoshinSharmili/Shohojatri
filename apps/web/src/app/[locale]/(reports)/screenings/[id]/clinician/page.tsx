import { ClinicianReportPage } from "@/components/reports/clinician-report";
import { pageMetadata } from "@/lib/i18n/metadata";
import { reportLang, reportMessages } from "@/lib/i18n/report-messages";

import { screeningIdFrom } from "@/lib/screening/screening-id";

export const generateMetadata = pageMetadata("clinicianReport");

export default async function ClinicianPage({
  params,
  searchParams,
}: PageProps<"/[locale]/screenings/[id]/clinician">) {
  const lang = reportLang((await searchParams).lang);
  return (
    <ClinicianReportPage
      screeningId={await screeningIdFrom(params)}
      lang={lang}
      messages={await reportMessages(lang)}
    />
  );
}
