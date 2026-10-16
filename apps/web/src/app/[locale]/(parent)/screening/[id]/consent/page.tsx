import { ConsentStep } from "@/components/screening/consent-step";
import { pageMetadata } from "@/lib/i18n/metadata";

import { screeningIdFrom } from "@/lib/screening/screening-id";

export const generateMetadata = pageMetadata("screeningConsent");

export default async function ConsentPage({
  params,
}: PageProps<"/[locale]/screening/[id]/consent">) {
  return <ConsentStep screeningId={await screeningIdFrom(params)} />;
}
