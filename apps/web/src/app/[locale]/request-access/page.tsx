import { RequestAccessLanding } from "@/components/access/request-access-landing";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("requestAccess");

/** Where a Child ID QR code points. Sends teachers and specialists to their request box. */
export default async function RequestAccessPage({
  searchParams,
}: PageProps<"/[locale]/request-access">) {
  const { code } = await searchParams;
  return <RequestAccessLanding code={typeof code === "string" ? code : ""} />;
}
