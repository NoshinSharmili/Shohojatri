"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { playTune } from "@/lib/activities/sound";
import { sleep } from "@/lib/activities/timeline";
import type { Screening } from "@/lib/screening/rules";

import { Character } from "./character";
import { ParentControls, Stage } from "./stage";
import { type RunContext, TaskFrame } from "./task-frame";

// SCREENING_SPEC §4.7: 40 s, sides swap at 20 s.
const HALF_MS = 20000;
type Side = "left" | "right";

/** Look & watch (optional; design Screening Flow 11): dancing children on one side, moving
 *  shapes on the other. An animated stand-in for the published real-video stimulus, which is
 *  why the clinician report notes it isn't validated. */
export function LookTask({ screening }: { screening: Screening }) {
  const t = useTranslations("activities.look");
  const [social, setSocial] = useState<Side>("left");
  const name = screening.child_name;

  async function run({ recorder, signal }: RunContext) {
    const stopTune = playTune();
    try {
      setSocial("left");
      recorder.mark({ type: "stimulus", social_side: "left" });
      await sleep(HALF_MS, signal);
      setSocial("right");
      recorder.mark({ type: "stimulus", social_side: "right" });
      await sleep(HALF_MS, signal);
      recorder.mark({ type: "end" });
    } finally {
      stopTune();
    }
  }

  return (
    <TaskFrame
      screening={screening}
      slug="look"
      camera="front"
      title={t("title")}
      subtitle={t("subtitle", { name })}
      intro={
        <Card tone="sky" className="flex flex-col gap-2">
          <p className="m-0">{t("setup", { name })}</p>
          <p className="m-0 text-text-2">{t("optional")}</p>
        </Card>
      }
      run={run}
      stage={({ stop, skip }) => (
        <Stage
          tone="dark"
          onStop={stop}
          controls={<ParentControls dark onSkip={skip} onWrong={stop} />}
        >
          <div aria-hidden className="flex flex-1">
            {social === "left" ? (
              <>
                <SocialHalf />
                <ShapesHalf />
              </>
            ) : (
              <>
                <ShapesHalf />
                <SocialHalf />
              </>
            )}
          </div>
        </Stage>
      )}
    />
  );
}

function SocialHalf() {
  return (
    <div className="flex flex-1 items-end justify-center gap-[2vw] overflow-hidden bg-linear-to-b from-sky-50 to-amber-50 pb-[18vh]">
      <Character pose="wave" palette="amber" look={0.3} className="w-[13vw] max-w-28" />
      <Character pose="clap" palette="guide" className="w-[15vw] max-w-32" />
      <Character pose="up" palette="leaf" look={-0.3} className="w-[13vw] max-w-28" />
    </div>
  );
}

function ShapesHalf() {
  return (
    <div className="relative flex-1 overflow-hidden bg-navy-deep">
      <i className="sj-float absolute top-[22%] left-[30%] size-[16vw] max-w-20 rounded-full bg-amber" />
      <i className="sj-spin-slow absolute top-[46%] left-[14%] size-[13vw] max-w-16 rounded-[12px] bg-teal" />
      <i className="sj-spin-slow absolute top-[58%] left-[55%] size-0 border-x-[34px] border-b-[58px] border-x-transparent border-b-sprout [animation-direction:reverse]" />
      <i className="sj-float absolute top-[72%] left-[22%] size-[17vw] max-w-20 rounded-full border-[10px] border-sky [animation-delay:.6s]" />
    </div>
  );
}
