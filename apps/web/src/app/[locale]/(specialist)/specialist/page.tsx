import { MemberHome } from "@/components/access/member-home";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("home");

export default async function SpecialistHomePage({
  searchParams,
}: PageProps<"/[locale]/specialist">) {
  // ?code= comes from a scanned Child ID QR code (see /request-access).
  const { code } = await searchParams;
  return <MemberHome initialCode={typeof code === "string" ? code : undefined} />;
}
