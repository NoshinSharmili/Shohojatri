"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { useSaveLocale } from "@/lib/auth/session";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";

/** Segmented বাংলা | EN switch. Swaps the [locale] segment and keeps the rest of the path.
 *  For a logged-in user the choice is also saved to their account. */
export function LanguageToggle() {
  const t = useTranslations("common.languageToggle");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const saveLocale = useSaveLocale();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="inline-flex gap-0.5 rounded-pill bg-n-100 p-1"
      aria-busy={isPending}
    >
      {routing.locales.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={active}
            onClick={() => {
              if (active) return;
              saveLocale(option);
              startTransition(() => router.replace(pathname, { locale: option }));
            }}
            className={[
              "min-h-10 min-w-15 cursor-pointer rounded-pill px-3.5 font-semibold leading-none",
              "transition-[color,background-color,box-shadow] duration-200 ease-out",
              option === "bn" ? "text-body" : "text-[15px]",
              active ? "bg-white text-navy shadow-sm" : "text-text-2 hover:text-navy",
            ].join(" ")}
          >
            {t(option)}
          </button>
        );
      })}
    </div>
  );
}
