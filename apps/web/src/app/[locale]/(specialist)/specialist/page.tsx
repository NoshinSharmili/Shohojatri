import { RoleHome } from "@/components/app/role-home";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("home");

export default function SpecialistHomePage() {
  return <RoleHome role="specialist" />;
}
