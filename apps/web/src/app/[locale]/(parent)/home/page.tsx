import { ParentHome } from "@/components/parent/parent-home";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("home");

export default function ParentHomePage() {
  return <ParentHome />;
}
