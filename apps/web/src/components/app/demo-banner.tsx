"use client";

import { FlaskConical, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { useDismissed } from "@/lib/pwa/storage";

const DISMISSED = "sj-demo-banner-dismissed";

/** Public demo notice at the top of every page, until the viewer closes it. */
export function DemoBanner() {
  const t = useTranslations("demoBanner");
  const [dismissed, dismiss] = useDismissed(DISMISSED);
  if (dismissed) return null;

  return (
    <div
      role="note"
      className="flex items-center gap-2 bg-amber-50 py-1 pr-1 pl-4 text-[15px] leading-[1.5] text-amber-ink"
    >
      <FlaskConical aria-hidden className="size-4.5 shrink-0" />
      <p className="m-0 flex-1 py-1.5 font-semibold">{t("text")}</p>
      <button
        type="button"
        aria-label={t("dismiss")}
        title={t("dismiss")}
        onClick={dismiss}
        className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-amber-ink hover:bg-amber-100"
      >
        <X aria-hidden className="size-5" />
      </button>
    </div>
  );
}
