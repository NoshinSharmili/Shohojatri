import { GuestOnly } from "@/components/auth/gates";
import { LoginForm } from "@/components/auth/login-form";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("login");

export default async function LoginPage({ searchParams }: PageProps<"/[locale]/login">) {
  const { next } = await searchParams;
  return (
    <GuestOnly>
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </GuestOnly>
  );
}
