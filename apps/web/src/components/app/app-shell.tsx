"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { homePathFor, useLogout, useMe } from "@/lib/auth/session";
import { cx } from "@/lib/cx";
import { Link } from "@/lib/i18n/navigation";

const WORDMARKS = {
  bn: { src: "/brand/wordmark_bn.png", width: 96 },
  en: { src: "/brand/wordmark_en.png", width: 143 },
} as const;

/** Header + content column for logged-in pages. Final shells (BottomNav/Sidebar) come in B14. */
export function AppShell({ wide = false, children }: { wide?: boolean; children: ReactNode }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const me = useMe().data;
  const logout = useLogout();
  const wordmark = WORDMARKS[locale === "en" ? "en" : "bn"];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border-1 bg-white">
        <div className="mx-auto flex min-h-14 w-full max-w-(--content-max) items-center gap-2 px-4 py-1.5 md:px-8">
          <Link href={me ? homePathFor(me) : "/"} className="mr-auto rounded-sm">
            <Image
              src={wordmark.src}
              alt={t("appName")}
              width={wordmark.width}
              height={34}
              className="h-8.5 w-auto"
            />
          </Link>
          <LanguageToggle />
          <Button variant="ghost" size="sm" icon={LogOut} onClick={() => void logout()}>
            {t("logout")}
          </Button>
        </div>
      </header>
      <main
        className={cx(
          "mx-auto flex w-full flex-1 flex-col px-5 pt-6 pb-10 md:px-8",
          wide ? "max-w-(--content-max)" : "max-w-(--reading-max)",
        )}
      >
        {children}
      </main>
    </div>
  );
}
