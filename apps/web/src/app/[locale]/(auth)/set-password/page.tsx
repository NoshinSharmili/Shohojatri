import { PendingPasswordOnly } from "@/components/auth/gates";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("setPassword");

export default function SetPasswordPage() {
  return (
    <PendingPasswordOnly>
      <SetPasswordForm />
    </PendingPasswordOnly>
  );
}
