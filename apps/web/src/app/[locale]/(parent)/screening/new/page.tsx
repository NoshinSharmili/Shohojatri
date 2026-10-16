import { DetailsStep } from "@/components/screening/details-step";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("screeningNew");

export default async function NewScreeningPage({
  searchParams,
}: PageProps<"/[locale]/screening/new">) {
  // ?child=ID preselects the child (from a child card on home).
  const child = Number((await searchParams).child);
  return <DetailsStep preselect={Number.isInteger(child) && child > 0 ? child : null} />;
}
