import { ResultScreen } from "@/components/results/result-screen";
import { pageMetadata } from "@/lib/i18n/metadata";

import { screeningIdFrom } from "@/lib/screening/screening-id";

export const generateMetadata = pageMetadata("screeningResult");

export default async function ResultPage({ params }: PageProps<"/[locale]/screening/[id]/result">) {
  return <ResultScreen screeningId={await screeningIdFrom(params)} />;
}
