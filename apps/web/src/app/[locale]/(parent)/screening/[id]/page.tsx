import { ScreeningResume } from "@/components/screening/screening-resume";
import { pageMetadata } from "@/lib/i18n/metadata";

import { screeningIdFrom } from "@/lib/screening/screening-id";

export const generateMetadata = pageMetadata("screening");

export default async function ScreeningPage({ params }: PageProps<"/[locale]/screening/[id]">) {
  return <ScreeningResume screeningId={await screeningIdFrom(params)} />;
}
