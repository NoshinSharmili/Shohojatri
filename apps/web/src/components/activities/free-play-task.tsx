"use client";

import { CircleHelp, Music, SkipForward, Square, ToyBrick } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { FlowPage } from "@/components/screening/flow-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sleep, untilSignal } from "@/lib/activities/timeline";
import type { Screening } from "@/lib/screening/rules";

import { CamFeed, LivePill } from "./cam-feed";
import { useCapture, useSample } from "./capture-provider";
import { type RunContext, TaskFrame } from "./task-frame";

// SCREENING_SPEC §4.8: 2 minutes of ordinary play.
const DURATION_MS = 120_000;

/** Free play (design Screening Flow 12): the device watches while parent and child play as
 *  they always do. A parent page rather than a child-facing stage. */
export function FreePlayTask({ screening }: { screening: Screening }) {
  const t = useTranslations("activities.freePlay");
  const { session } = useCapture();
  const [endsAt, setEndsAt] = useState(0);
  const finish = useRef<(() => void) | null>(null);
  const name = screening.child_name;

  async function run({ recorder, signal }: RunContext) {
    setEndsAt(performance.now() + DURATION_MS);
    const early = new Promise<void>((resolve) => (finish.current = resolve));
    await untilSignal(Promise.race([sleep(DURATION_MS, signal), early]), signal);
    recorder.mark({ type: "end" });
  }

  return (
    <TaskFrame
      screening={screening}
      slug="free-play"
      camera="front"
      pose
      title={t("title")}
      subtitle={t("subtitle", { name })}
      intro={
        <Card tone="sky" className="flex flex-col gap-2">
          <p className="m-0">{t("setup", { name })}</p>
          <p className="m-0">{t("play", { name })}</p>
        </Card>
      }
      run={run}
      stage={({ stop, skip }) => (
        <FlowPage
          title={t("title")}
          subtitle={t("running")}
          footer={
            <>
              <Button
                size="lg"
                block
                variant="secondary"
                icon={Square}
                onClick={() => finish.current?.()}
              >
                {t("finishEarly")}
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" block icon={SkipForward} onClick={skip}>
                  {t("skip")}
                </Button>
                <Button variant="ghost" block icon={CircleHelp} onClick={stop}>
                  {t("wrong")}
                </Button>
              </div>
            </>
          }
        >
          <Countdown endsAt={endsAt} />
          {session && (
            <CamFeed session={session} className="relative h-32 rounded-lg">
              <InFrame name={name} />
            </CamFeed>
          )}
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            <li className="inline-flex min-h-10 items-center gap-2 rounded-pill bg-teal-50 px-4 font-semibold text-teal-ink">
              <Music aria-hidden className="size-4" />
              {t("tipTalk")}
            </li>
            <li className="inline-flex min-h-10 items-center gap-2 rounded-pill bg-teal-50 px-4 font-semibold text-teal-ink">
              <ToyBrick aria-hidden className="size-4" />
              {t("tipShare")}
            </li>
          </ul>
        </FlowPage>
      )}
    />
  );
}

function Countdown({ endsAt }: { endsAt: number }) {
  const t = useTranslations("activities.freePlay");
  const format = useFormatter();
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(timer);
  }, []);
  const left = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const r = 88;
  const c = 2 * Math.PI * r;
  const time = `${format.number(Math.floor(left / 60))}:${format.number(left % 60, { minimumIntegerDigits: 2 })}`;
  return (
    <div className="flex justify-center">
      <div className="relative size-52">
        <svg viewBox="0 0 210 210" aria-hidden className="size-full">
          <circle cx="105" cy="105" r={r} fill="none" stroke="var(--sj-teal-50)" strokeWidth="14" />
          <circle
            cx="105"
            cy="105"
            r={r}
            fill="none"
            stroke="var(--sj-teal)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - (left * 1000) / DURATION_MS)}
            transform="rotate(-90 105 105)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[48px] leading-none font-bold text-navy">{time}</span>
          <span className="mt-1.5 text-small text-text-2">{t("left")}</span>
        </div>
      </div>
    </div>
  );
}

/** "Rafi is in the picture": head, shoulders and hands seen. */
function InFrame({ name }: { name: string }) {
  const t = useTranslations("activities.freePlay");
  const { session } = useCapture();
  const pose = useSample(session, 3)?.features.pose;
  const seen = (k?: [number, number, number] | null) => !!k && k[2] >= 0.5;
  const inView = !!pose && seen(pose.l_shoulder) && seen(pose.r_shoulder);
  return (
    <LivePill className="absolute bottom-3 left-3">
      {inView ? t("inFrame", { name }) : t("notInFrame", { name })}
    </LivePill>
  );
}
