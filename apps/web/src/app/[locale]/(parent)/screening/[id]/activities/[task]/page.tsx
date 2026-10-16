import { notFound } from "next/navigation";

import { ActivityPage } from "@/components/activities/activity-page";
import { ACTIVITY_SLUGS, type ActivitySlug } from "@/lib/activities/tasks";
import { pageMetadata } from "@/lib/i18n/metadata";
import { screeningIdFrom } from "@/lib/screening/screening-id";

export const generateMetadata = pageMetadata("screeningActivities");

export default async function ActivityRoute({
  params,
}: PageProps<"/[locale]/screening/[id]/activities/[task]">) {
  const { task } = await params;
  if (!ACTIVITY_SLUGS.includes(task as ActivitySlug)) notFound();
  return <ActivityPage screeningId={await screeningIdFrom(params)} slug={task as ActivitySlug} />;
}
