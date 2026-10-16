import { GuestOnly } from "@/components/auth/gates";
import { RoleChoice } from "@/components/auth/role-choice";
import { SignupForm } from "@/components/auth/signup-form";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("signup");

// /signup → choose a role; /signup?role=parent|teacher → the form for that role.
export default async function SignupPage({ searchParams }: PageProps<"/[locale]/signup">) {
  const { role } = await searchParams;
  return (
    <GuestOnly>
      {role === "parent" || role === "teacher" ? (
        <SignupForm key={role} role={role} />
      ) : (
        <RoleChoice />
      )}
    </GuestOnly>
  );
}
