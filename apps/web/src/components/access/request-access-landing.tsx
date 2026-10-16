"use client";

import { QrCode } from "lucide-react";
import { useTranslations } from "next-intl";

import { AppShell } from "@/components/app/app-shell";
import { RequireUser } from "@/components/auth/gates";
import { buttonClasses } from "@/components/ui/button";
import { StateView } from "@/components/ui/state-view";
import { homePathFor, useMe } from "@/lib/auth/session";
import { Link } from "@/lib/i18n/navigation";

/** Target of a Child ID QR code: teachers and specialists land on their request box with the
 *  code filled in; anyone else is told the code isn't for them. */
export function RequestAccessLanding({ code }: { code: string }) {
  const query = code ? `?code=${encodeURIComponent(code)}` : "";
  return (
    <RequireUser
      returnTo={`/request-access${query}`}
      redirectFor={(me) =>
        me.role === "teacher" || me.role === "specialist" ? `${homePathFor(me)}${query}` : null
      }
    >
      <AppShell>
        <NotForYou />
      </AppShell>
    </RequireUser>
  );
}

function NotForYou() {
  const t = useTranslations("access.qrLanding");
  const me = useMe().data;
  return (
    <div className="flex flex-col items-center gap-2">
      <QrCode aria-hidden className="size-10 text-navy" />
      <StateView kind="empty" title={t("title")} message={t("body")} />
      {me && (
        <Link href={homePathFor(me)} className={buttonClasses()}>
          {t("home")}
        </Link>
      )}
    </div>
  );
}
