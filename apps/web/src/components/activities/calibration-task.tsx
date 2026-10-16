"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { chime } from "@/lib/activities/sound";
import { sleep } from "@/lib/activities/timeline";
import { cx } from "@/lib/cx";
import type { Screening } from "@/lib/screening/rules";

import { ParentControls, Stage } from "./stage";
import { type RunContext, TaskFrame } from "./task-frame";

type Position = "left" | "centre" | "right";

// SCREENING_SPEC §4.3: left → centre → right → centre, 1.5 s each, after a short settle.
const ORDER: Position[] = ["left", "centre", "right", "centre"];
const SEGMENT_MS = 1500;
const SETTLE_MS = 500;
// "Left" is the screen's left as the child sees it (the screen is never mirrored).
const STAR_X: Record<Position, string> = { left: "12%", centre: "50%", right: "88%" };

/** Calibration (design Screening Flow 07): a star the child follows across the screen. The API
 *  fits the gaze line; a fallback is retried once automatically. */
export function CalibrationTask({ screening }: { screening: Screening }) {
  const t = useTranslations("activities.calibration");
  const [star, setStar] = useState<Position>("centre");
  const name = screening.child_name;

  async function run({ recorder, signal }: RunContext) {
    setStar("centre");
    await sleep(SETTLE_MS, signal);
    for (const position of ORDER) {
      setStar(position);
      recorder.mark({ type: "target", position });
      chime();
      await sleep(SEGMENT_MS, signal);
    }
  }

  return (
    <TaskFrame
      screening={screening}
      slug="calibration"
      camera="front"
      title={t("title")}
      subtitle={t("subtitle", { name })}
      autoRetryFallback
      intro={
        <Card tone="sky" className="flex flex-col gap-2">
          <p className="m-0">{t("how1", { name })}</p>
          <p className="m-0">{t("how2", { name })}</p>
        </Card>
      }
      run={run}
      stage={({ stop, skip }) => (
        <Stage onStop={stop} controls={<ParentControls onSkip={skip} onWrong={stop} />}>
          <div aria-hidden className="relative flex-1">
            <div className="absolute inset-x-[12%] top-[42%] flex justify-between">
              {[0, 1, 2].map((i) => (
                <i key={i} className="size-3.5 rounded-full bg-navy/10" />
              ))}
            </div>
            <div
              className="absolute top-[42%] -translate-x-1/2 -translate-y-1/2 transition-[left] duration-500 ease-in-out drop-shadow-[0_6px_14px_rgba(248,180,66,.45)]"
              style={{ left: STAR_X[star] }}
            >
              <Star className={cx("sj-twinkle size-24 fill-amber text-amber")} />
            </div>
          </div>
          <p className="sr-only" role="status">
            {t("running", { name })}
          </p>
        </Stage>
      )}
    />
  );
}
