import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { LanguageToggle } from "@/components/ui/language-toggle";
import { Link } from "@/lib/i18n/navigation";

const WORDMARKS = {
  bn: { src: "/brand/wordmark_bn.png", width: 96 },
  en: { src: "/brand/wordmark_en.png", width: 143 },
} as const;

/** Mobile-first frame for login / sign-up / set-password (design Onboarding 02–04). */
export function AuthScreen({
  backHref,
  title,
  subtitle,
  eyebrow,
  children,
}: {
  /** Shows a back arrow instead of the wordmark. */
  backHref?: string;
  title: string;
  subtitle?: string;
  /** Small line above the title, e.g. a role badge. */
  eyebrow?: ReactNode;
  children: ReactNode;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const wordmark = WORDMARKS[locale === "en" ? "en" : "bn"];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-(--reading-max) flex-col">
      <header className="flex min-h-14 items-center justify-between px-4 pt-1 pb-2">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={t("back")}
            className="inline-flex size-12 items-center justify-center rounded-full text-text-2 hover:bg-n-100 hover:text-navy"
          >
            <ArrowLeft aria-hidden className="size-6" />
          </Link>
        ) : (
          <Image
            src={wordmark.src}
            alt={t("appName")}
            width={wordmark.width}
            height={34}
            priority
            className="ml-1 h-8.5 w-auto"
          />
        )}
        <LanguageToggle />
      </header>
      <main className="flex flex-1 flex-col px-5 pt-2 pb-7">
        {eyebrow && <div className="mb-2 flex flex-wrap items-center gap-2.5">{eyebrow}</div>}
        <h1 className="m-0 font-display text-h1 font-bold text-text-1">{title}</h1>
        {subtitle && <p className="mt-1.5 mb-0 text-body text-text-2">{subtitle}</p>}
        <div className="mt-6 flex flex-1 flex-col">{children}</div>
      </main>
    </div>
  );
}

/** "Already have an account? Log in" style line under the main action. */
export function AltLink({
  question,
  label,
  href,
}: {
  question: string;
  label: string;
  href: string;
}) {
  return (
    <p className="m-0 flex flex-wrap items-center justify-center gap-1 text-[15px] text-text-2">
      <span>{question}</span>
      <Link
        href={href}
        className="inline-flex min-h-12 items-center px-2 font-semibold text-text-link hover:underline"
      >
        {label}
      </Link>
    </p>
  );
}

/** Form-level error (e.g. wrong password), announced to screen readers. */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="m-0 rounded-md bg-danger-bg px-4 py-3 text-[15px] text-danger">
      {message}
    </p>
  );
}
