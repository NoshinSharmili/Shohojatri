"use client";

import { Check, Crosshair, FileCheck2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { FormAlert } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { useErrorMessage } from "@/lib/api/error-message";
import { cx } from "@/lib/cx";
import { useRouter } from "@/lib/i18n/navigation";
import { useDemoMode } from "@/lib/screening/demo";
import {
  fetchDemoTask,
  useFinalizeScreening,
  useScreening,
  useUploadTask,
} from "@/lib/screening/queries";
import { resultPath, TASK_GAME } from "@/lib/screening/results";
import { resumePath } from "@/lib/screening/rules";

import { TASK_ICONS } from "./screening-icons";

// SCREENING_SPEC §1 order. Joint attention replays the on-screen variant, the default.
const TASKS = [
  "calibration",
  "rtn",
  "joint_attention",
  "imitation",
  "gaze_preference",
  "free_play",
] as const;
type Step = (typeof TASKS)[number] | "result";
const STEPS: readonly Step[] = [...TASKS, "result"];
// Long enough to read each line; the real uploads take a fraction of this.
const MIN_STEP_MS = 650;

const pause = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** Demo mode (SCREENING_SPEC §9): replays a recorded sample session for every game through the
 *  same upload and finalize endpoints as the camera, with a short "analysing" view. */
export function DemoRun({ screeningId }: { screeningId: number }) {
  const t = useTranslations("demo.run");
  const tGames = useTranslations("screening.activities.games");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const { profile } = useDemoMode();
  const screening = useScreening(screeningId);
  const upload = useUploadTask(screeningId);
  const finalize = useFinalizeScreening(screeningId);
  const [done, setDone] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const started = useRef(false);
  // Steps already uploaded, so "Try again" carries on from where it stopped.
  const progress = useRef(0);
  const uploadTask = upload.mutateAsync;
  const finalizeScreening = finalize.mutateAsync;

  const run = useCallback(async () => {
    setError(null);
    try {
      for (const [index, task] of TASKS.entries()) {
        if (index < progress.current) continue;
        const [demo] = await Promise.all([fetchDemoTask(task, profile), pause(MIN_STEP_MS)]);
        await uploadTask({ task: demo.task, upload: demo.upload });
        progress.current = index + 1;
        setDone(progress.current);
      }
      await Promise.all([finalizeScreening(), pause(MIN_STEP_MS)]);
      setDone(STEPS.length);
      router.replace(resultPath(screeningId));
    } catch (caught) {
      setError(caught);
    }
  }, [profile, screeningId, router, uploadTask, finalizeScreening]);

  const data = screening.data;
  const ready = data?.status === "in_progress" && data.questionnaire_completed_at;

  useEffect(() => {
    if (!data) return;
    if (!ready) {
      router.replace(resumePath(data));
    } else if (!started.current) {
      // Once, also under React's development double effects.
      started.current = true;
      void run();
    }
  }, [data, ready, router, run]);

  return (
    <div className="mx-auto flex w-full max-w-(--reading-max) flex-1 flex-col items-center justify-center gap-6 py-6 text-center">
      <span aria-hidden className="flex gap-2">
        {["bg-blue", "bg-teal [animation-delay:.2s]", "bg-sprout [animation-delay:.4s]"].map(
          (c) => (
            <i
              key={c}
              className={cx(
                "size-3.5 rounded-full",
                !error &&
                  "animate-[sj-breathe_1.4s_var(--ease-in-out)_infinite] motion-reduce:animate-none",
                c,
              )}
            />
          ),
        )}
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-display text-h1 font-bold text-text-1">{t("title")}</h1>
        <p className="m-0 text-text-2">{t("subtitle")}</p>
      </div>

      <ol
        aria-live="polite"
        className="m-0 flex w-full max-w-[360px] list-none flex-col gap-2 p-0 text-left"
      >
        {STEPS.map((step, index) => {
          const state = index < done ? "done" : index === done && !error ? "running" : "waiting";
          const Icon =
            step === "calibration" ? Crosshair : step === "result" ? FileCheck2 : TASK_ICONS[step];
          const label =
            step === "calibration" || step === "result" ? t(step) : tGames(TASK_GAME[step]);
          return (
            <li
              key={step}
              className={cx(
                "flex items-center gap-3 rounded-md px-3.5 py-2.5 transition-colors duration-200",
                state === "running" ? "bg-sky-50 font-semibold text-navy" : "text-text-2",
                state === "done" && "text-text-1",
              )}
            >
              <Icon aria-hidden className="size-5 shrink-0" />
              <span className="flex-1">{label}</span>
              {state === "done" && (
                <span className="flex items-center gap-1 text-small text-leaf-ink">
                  <Check aria-hidden className="size-4.5" />
                  <span className="sr-only">{t("done")}</span>
                </span>
              )}
              {state === "running" && (
                <span
                  aria-hidden
                  className="size-4 animate-[sj-spin_.8s_linear_infinite] rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
                />
              )}
            </li>
          );
        })}
      </ol>

      {error !== null && (
        <div className="flex w-full max-w-[360px] flex-col gap-3">
          <FormAlert message={`${t("error")} ${errorMessage(error)}`} />
          <Button variant="secondary" onClick={() => void run()}>
            {tCommon("retry")}
          </Button>
        </div>
      )}
    </div>
  );
}
