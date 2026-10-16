import { DemoRun } from "@/components/screening/demo-run";
import { pageMetadata } from "@/lib/i18n/metadata";

import { screeningIdFrom } from "@/lib/screening/screening-id";

export const generateMetadata = pageMetadata("screeningDemo");

export default async function DemoRunPage({
  params,
}: PageProps<"/[locale]/screening/[id]/activities/demo">) {
  return <DemoRun screeningId={await screeningIdFrom(params)} />;
}
