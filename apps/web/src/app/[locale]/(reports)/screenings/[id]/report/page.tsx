import { ParentReportPage } from "@/components/reports/parent-report";
import { pageMetadata } from "@/lib/i18n/metadata";

import { screeningIdFrom } from "@/lib/screening/screening-id";

export const generateMetadata = pageMetadata("screeningReport");

export default async function ReportPage({
  params,
}: PageProps<"/[locale]/screenings/[id]/report">) {
  return <ParentReportPage screeningId={await screeningIdFrom(params)} />;
}
