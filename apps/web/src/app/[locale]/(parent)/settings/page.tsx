import { ParentSettings } from "@/components/parent/parent-settings";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("settings");

export default function SettingsPage() {
  return <ParentSettings />;
}
