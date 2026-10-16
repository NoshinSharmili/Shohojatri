import { notFound } from "next/navigation";

import { CareTeamPage } from "@/components/care-team/care-team-page";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("careTeam");

export default async function ChildCareTeamPage({
  params,
}: PageProps<"/[locale]/children/[id]/care-team">) {
  const childId = Number((await params).id);
  if (!Number.isInteger(childId) || childId <= 0) notFound();
  return <CareTeamPage childId={childId} />;
}
