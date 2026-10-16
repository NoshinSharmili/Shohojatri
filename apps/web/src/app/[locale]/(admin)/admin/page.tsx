import { SpecialistsAdmin } from "@/components/admin/specialists-admin";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("adminSpecialists");

export default function AdminPage() {
  return <SpecialistsAdmin />;
}
