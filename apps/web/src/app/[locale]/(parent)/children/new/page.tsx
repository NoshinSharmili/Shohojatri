import { NewChildForm } from "@/components/children/new-child-form";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("newChild");

export default function NewChildPage() {
  return <NewChildForm />;
}
