"use client";

import { ArrowRight, ClipboardList, FlaskConical, Hourglass, Play } from "lucide-react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { RiskBadge } from "@/components/ui/risk-badge";
import { Link } from "@/lib/i18n/navigation";
import { useChildScreenings } from "@/lib/screening/queries";
import { resultPath } from "@/lib/screening/results";
import type { ScreeningSummary } from "@/lib/screening/rules";

/** "Start a screening" hero on the parent home (design Screening Flow 01a). */
export function ScreenHero() {
  const t = useTranslations("screening.home");
  return (
    <section className="relative rounded-leaf border border-navy-100 bg-(image:--sj-gradient-sky) px-4.5 pt-4 pb-4.5">
      <Image
        src="/brand/mark.png"
        alt=""
        width={60}
        height={58}
        className="absolute top-3.5 right-3.5 h-auto w-12 sm:w-15"
      />
      <h2 className="m-0 pr-16 font-display text-[21px] leading-[1.45] font-bold text-navy">
        {t("heroTitle")}
      </h2>
      <p className="mt-0.5 mb-3 max-w-[52ch] pr-14 text-[15px] leading-[1.6] text-text-1">
        {t("heroBody")}
      </p>
      <Link href="/screening/new" className={buttonClasses()}>
        <Play aria-hidden className="size-5" />
        {t("heroCta")}
        <ArrowRight aria-hidden className="size-5" />
      </Link>
    </section>
  );
}

/** On a child card: continue the unfinished screening, or the last result and a new one. */
export function ChildScreeningLink({ childId }: { childId: number }) {
  const t = useTranslations("screening.home");
  const screenings = useChildScreenings(childId);
  const open = screenings.data?.find((s) => s.status === "in_progress");
  // Newest first, so this is the latest result.
  const last = screenings.data?.find((s) => s.status === "finalized");
  const rowClass =
    "flex min-h-12 items-center gap-3 rounded-md px-4 py-2 font-semibold text-navy no-underline";

  if (open) {
    return (
      <Link href={`/screening/${open.id}`} className={`${rowClass} bg-amber-50 hover:bg-amber-100`}>
        <Hourglass aria-hidden className="size-5 shrink-0 text-amber-ink" />
        <span className="flex flex-1 flex-col leading-[1.4]">
          {t("continue")}
          <span className="text-small font-normal text-text-2">
            {open.questionnaire_completed_at
              ? t("questionsDone")
              : t("progress", { answered: open.answered, total: open.total })}
          </span>
        </span>
        <ArrowRight aria-hidden className="size-5 shrink-0" />
      </Link>
    );
  }
  return (
    <>
      {last && <LastResult screening={last} rowClass={rowClass} />}
      <Link
        href={`/screening/new?child=${childId}`}
        className={`${rowClass} bg-sky-50 hover:bg-navy-50`}
      >
        <ClipboardList aria-hidden className="size-5 shrink-0" />
        <span className="flex-1">{t("start")}</span>
        <ArrowRight aria-hidden className="size-5 shrink-0" />
      </Link>
    </>
  );
}

function LastResult({ screening, rowClass }: { screening: ScreeningSummary; rowClass: string }) {
  const t = useTranslations("screening.home");
  const tResults = useTranslations("results");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const level = screening.risk_class;
  const date = screening.finalized_at
    ? format.dateTime(new Date(screening.finalized_at), { dateStyle: "medium" })
    : "";
  return (
    <Link
      href={resultPath(screening.id)}
      className={`${rowClass} flex-wrap border border-border-1 bg-white hover:bg-navy-50`}
    >
      <span className="flex flex-1 flex-col leading-[1.4]">
        {t("seeResult")}
        <span className="text-small font-normal text-text-2">{t("lastResult", { date })}</span>
      </span>
      {screening.is_demo && (
        <span className="inline-flex items-center gap-1 rounded-pill bg-amber-50 px-2.5 py-0.5 text-small text-amber-ink">
          <FlaskConical aria-hidden className="size-3.5" />
          {tCommon("demo")}
        </span>
      )}
      {level && <RiskBadge level={level} label={tResults(`classes.${level}`)} />}
      <ArrowRight aria-hidden className="size-5 shrink-0" />
    </Link>
  );
}
