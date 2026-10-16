import { CreateSpecialistForm } from "@/components/admin/create-specialist-form";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("adminNewSpecialist");

export default function NewSpecialistPage() {
  return <CreateSpecialistForm />;
}
