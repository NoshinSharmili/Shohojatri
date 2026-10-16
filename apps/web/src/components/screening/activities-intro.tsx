"use client";

import {
  ArrowRight,
  Blocks,
  CircleCheck,
  ClipboardCheck,
  Ear,
  Eye,
  FlaskConical,
  Hand,
  PersonStanding,
  ShieldCheck,
  Play,
  SkipForward,
  Sun,
  ToyBrick,
  VolumeX,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect } from "react";

import { QueryView } from "@/components/app/query-view";
import { FormAlert } from "@/components/auth/auth-screen";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StateView } from "@/components/ui/state-view";
import { useErrorMessage } from "@/lib/api/error-message";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { useDemoMode } from "@/lib/screening/demo";
import { useFinalizeScreening, useScreening } from "@/lib/screening/queries";
import { resultPath } from "@/lib/screening/results";
import { resumePath } from "@/lib/screening/rules";

import { FlowPage } from "./flow-page";

// SCREENING_SPEC §1 order; durations from the design (Screening Flow 05).
const GAMES = [
  { key: "nameCall", icon: Ear, minutes: 1 },
  { key: "point", icon: Hand, minutes: 2 },
  { key: "copy", icon: PersonStanding, minutes: 2 },
  { key: "look", icon: Eye, minutes: 1, optional: true },
  { key: "freePlay", icon: Blocks, minutes: 2 },
] as const;
const NEEDS = [
  { key: "toy", icon: ToyBrick },
  { key: "light", icon: Sun },
  { key: "quiet", icon: VolumeX },
] as const;

/** Part 2 intro (design Screening Flow 05), reached once the questionnaire is done: on to the
 *  camera games (or the demo games in demo mode), or a result from the answers alone
 *  (SCREENING_SPEC §1). */
export function ActivitiesIntro({ screeningId }: { screeningId: number }) {
  const t = useTranslations("screening.activities");
  const tProfiles = useTranslations("demo.profiles");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const query = useScreening(screeningId);
  const finalize = useFinalizeScreening(screeningId);
  const demo = useDemoMode();
  const router = useRouter();
  const screening = query.data;
  const misplaced =
    screening && (!screening.questionnaire_completed_at || screening.status === "finalized");

  function answersOnly() {
    finalize.mutate(undefined, { onSuccess: () => router.replace(resultPath(screeningId)) });
  }

  useEffect(() => {
    if (screening && misplaced) router.replace(resumePath(screening));
  }, [screening, misplaced, router]);

  if (misplaced) return <StateView kind="loading" />;
  return (
    <QueryView query={query}>
      {() => (
        <FlowPage
          step="games"
          title={t("title")}
          subtitle={t("subtitle")}
          footer={
            <>
              {finalize.isError && <FormAlert message={errorMessage(finalize.error)} />}
              {demo.enabled ? (
                <Link
                  href={`/screening/${screeningId}/activities/demo`}
                  className={buttonClasses({ size: "lg", block: true })}
                >
                  <Play aria-hidden className="size-5" />
                  {t("demoCta")}
                </Link>
              ) : (
                <Link
                  href={`/screening/${screeningId}/activities/setup`}
                  className={buttonClasses({ size: "lg", block: true })}
                >
                  {screening?.tasks.length ? t("ctaContinue") : t("cta")}
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
              )}
              <Button
                variant="secondary"
                block
                icon={ClipboardCheck}
                loading={finalize.isPending}
                onClick={answersOnly}
              >
                {t("answersOnly")}
              </Button>
              <Link href="/home" className={buttonClasses({ variant: "ghost", block: true })}>
                {t("home")}
              </Link>
            </>
          }
        >
          <p className="m-0 flex items-center gap-2.5 rounded-md bg-leaf-50 px-4 py-3 font-semibold text-leaf-ink">
            <CircleCheck aria-hidden className="size-5 shrink-0" />
            {t("partOneDone")}
          </p>
          <ol className="m-0 list-none overflow-hidden rounded-lg border border-[rgba(0,60,120,.06)] bg-white p-0 shadow-sm">
            {GAMES.map(({ key, icon: Icon, minutes, ...rest }, index) => (
              <li
                key={key}
                className="flex items-center gap-3 border-b border-border-1 px-3.5 py-3 last:border-b-0"
              >
                <span className="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-navy-50 font-display text-small font-bold text-navy">
                  {format.number(index + 1)}
                </span>
                <Icon aria-hidden className="size-5 shrink-0 text-teal-ink" />
                <span className="flex-1 font-semibold">{t(`games.${key}`)}</span>
                <span className="text-small text-text-2">
                  {t("minutes", { count: minutes })}
                  {"optional" in rest && ` · ${t("optional")}`}
                </span>
              </li>
            ))}
          </ol>
          <div>
            <p className="mt-0 mb-2 font-semibold">{t("needTitle")}</p>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {NEEDS.map(({ key, icon: Icon }) => (
                <li
                  key={key}
                  className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-amber-50 px-4 font-semibold text-amber-ink"
                >
                  <Icon aria-hidden className="size-4.5" />
                  {t(`need.${key}`)}
                </li>
              ))}
            </ul>
          </div>
          <Card tone="calm" className="flex gap-2.5 p-3.5 text-[15px] leading-[1.6] text-teal-ink">
            <SkipForward aria-hidden className="mt-0.5 size-5 shrink-0" />
            <span>{t("skipNote")}</span>
          </Card>
          {demo.enabled ? (
            <Card tone="warm" className="flex gap-2.5 p-3.5 text-[15px] leading-[1.6] text-text-1">
              <FlaskConical aria-hidden className="mt-0.5 size-5 shrink-0 text-amber-ink" />
              <span className="flex flex-col gap-1">
                <b>{t("demoTitle")}</b>
                <span>{t("demoBody", { profile: tProfiles(demo.profile) })}</span>
                <Link href="/settings" className="font-semibold text-text-link">
                  {t("demoSettings")}
                </Link>
              </span>
            </Card>
          ) : (
            <Card tone="sky" className="flex gap-2.5 p-3.5 text-[15px] leading-[1.6] text-text-1">
              <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-navy" />
              <span>{t("privacy")}</span>
            </Card>
          )}
          <p className="m-0 text-small text-text-2">{t("answersOnlyNote")}</p>
        </FlowPage>
      )}
    </QueryView>
  );
}
