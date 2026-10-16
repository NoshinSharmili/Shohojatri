import { ActivitiesIntro } from "@/components/screening/activities-intro";
import { pageMetadata } from "@/lib/i18n/metadata";

import { screeningIdFrom } from "@/lib/screening/screening-id";

export const generateMetadata = pageMetadata("screeningActivities");

export default async function ActivitiesPage({
  params,
}: PageProps<"/[locale]/screening/[id]/activities">) {
  return <ActivitiesIntro screeningId={await screeningIdFrom(params)} />;
}
