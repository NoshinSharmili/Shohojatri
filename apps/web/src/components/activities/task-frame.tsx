"use client";

import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Crosshair,
  Pause,
  Play,
  RefreshCw,
  Send,
  SkipForward,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { FormAlert } from "@/components/auth/auth-screen";
import { FlowPage } from "@/components/screening/flow-page";
import { TASK_ICONS } from "@/components/screening/screening-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  activityPath,
  nextStep,
  STEPS,
  type StepSlug,
  taskOf,
  type TaskOut,
  uploadOf,
} from "@/lib/activities/tasks";
import { stopSpeech } from "@/lib/activities/sound";
import { Aborted } from "@/lib/activities/timeline";
import { useErrorMessage } from "@/lib/api/error-message";
import type { Camera, CaptureSession, TaskRecorder, TaskUpload } from "@/lib/cv/capture";
import { cx } from "@/lib/cx";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { useSkipTask, useUploadTask } from "@/lib/screening/queries";
import { TASK_GAME } from "@/lib/screening/results";
import type { Screening } from "@/lib/screening/rules";

import { useCapture } from "./capture-provider";

export type RunContext = {
  session: CaptureSession;
  recorder: TaskRecorder;
  signal: AbortSignal;
};
export type RunResult = { variant?: "on_screen" | "live" } | void;
/** What the running game's stage can do: stop (back to the intro) or skip the game. */
export type StageActions = { stop: () => void; skip: () => void };

type Phase =
  | { name: "intro" }
  | { name: "running" }
  | { name: "uploading" }
  | { name: "done"; task: TaskOut }
  | { name: "error"; error: unknown; upload: TaskUpload | null };

type TaskFrameProps = {
  screening: Screening;
  slug: StepSlug;
  /** Which camera the game uses (decided from the device type). */
  camera: Camera;
  /** Pose landmarks on during the game (Copy me, Free play). */
  pose?: boolean;
  title: string;
  subtitle?: string;
  /** Setup instructions and any choices, shown before the game starts. */
  intro: ReactNode;
  /** Disables Start (e.g. until a variant is chosen). */
  canStart?: boolean;
  /** The game itself: drives the stage and fills the recorder's markers. */
  run: (context: RunContext) => Promise<RunResult>;
  /** The full-screen stage while the game runs. */
  stage: (actions: StageActions) => ReactNode;
  /** Calibration retries once by itself when it falls back (§4.3). */
  autoRetryFallback?: boolean;
};

/**
 * One activity, as a small state machine: intro → running → uploading → done (or error). Every
 * game can be skipped (excluded from the score, never a concern), stopped and tried again, and
 * shows how it went. Only the recorder's numbers are uploaded.
 */
export function TaskFrame({
  screening,
  slug,
  camera,
  pose = false,
  title,
  subtitle,
  intro,
  canStart = true,
  run,
  stage,
  autoRetryFallback = false,
}: TaskFrameProps) {
  const t = useTranslations("activities.task");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const { session, deviceType, switchCamera } = useCapture();
  const upload = useUploadTask(screening.id);
  const skipTask = useSkipTask(screening.id);
  const [phase, setPhase] = useState<Phase>({ name: "intro" });
  const [cameraError, setCameraError] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const task = taskOf(slug);
  const previous = uploadOf(screening, task);
  const next = nextStep(screening, slug);

  const abort = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    stopSpeech();
    session?.endTask();
  }, [session]);

  // Leaving the page stops the game.
  useEffect(() => abort, [abort]);

  const goNext = useCallback(() => {
    router.push(activityPath(screening.id, next));
  }, [router, screening.id, next]);

  const send = useCallback(
    async (payload: TaskUpload) => {
      setPhase({ name: "uploading" });
      try {
        const result = await upload.mutateAsync({ task, upload: payload });
        return result;
      } catch (error) {
        setPhase({ name: "error", error, upload: payload });
        return null;
      }
    },
    [task, upload],
  );

  const start = useCallback(async () => {
    if (!session) return;
    abort();
    setCameraError(false);
    const current = new AbortController();
    controller.current = current;
    if (!(await switchCamera(camera))) {
      setCameraError(true);
      return;
    }
    try {
      await session.usePose(pose);
    } catch {
      setCameraError(true);
      return;
    }
    // Calibration runs a second time by itself when it falls back (§4.3).
    for (let attempt = 1; ; attempt++) {
      if (current.signal.aborted) return;
      setPhase({ name: "running" });
      const recorder = session.startTask();
      let result: RunResult;
      try {
        result = await run({ session, recorder, signal: current.signal });
      } catch (error) {
        if (error instanceof Aborted) return;
        session.endTask();
        setPhase({ name: "error", error, upload: null });
        return;
      }
      session.endTask();
      void session.usePose(false);
      const payload = recorder.upload(session.device(deviceType), result?.variant);
      const out = await send(payload);
      if (!out) return;
      if (autoRetryFallback && out.status === "fallback" && attempt < 2) continue;
      controller.current = null;
      if (autoRetryFallback && out.status === "ok") {
        router.push(activityPath(screening.id, next));
        return;
      }
      setPhase({ name: "done", task: out });
      return;
    }
  }, [
    session,
    abort,
    switchCamera,
    camera,
    pose,
    run,
    deviceType,
    send,
    autoRetryFallback,
    router,
    screening.id,
    next,
  ]);

  const stop = useCallback(() => {
    abort();
    setPhase({ name: "intro" });
  }, [abort]);

  const skip = useCallback(() => {
    abort();
    skipTask.mutate(task, { onSuccess: goNext });
  }, [abort, skipTask, task, goNext]);

  if (phase.name === "running") return <StageSlot render={stage} stop={stop} skip={skip} />;

  const header = <GameHeader screening={screening} slug={slug} />;

  if (phase.name === "uploading") {
    return (
      <FlowPage progress={header}>
        <Card tone="sky" className="flex items-center gap-3">
          <span
            aria-hidden
            className="size-5 shrink-0 animate-[sj-spin_.8s_linear_infinite] rounded-full border-[2.5px] border-navy border-r-transparent motion-reduce:animate-none"
          />
          <span role="status">{t("uploading")}</span>
        </Card>
      </FlowPage>
    );
  }

  if (phase.name === "error") {
    const payload = phase.upload;
    return (
      <FlowPage
        progress={header}
        title={t("errorTitle")}
        footer={
          <>
            {payload && (
              <Button
                size="lg"
                block
                icon={Send}
                onClick={() =>
                  void send(payload).then((out) => out && setPhase({ name: "done", task: out }))
                }
              >
                {t("sendAgain")}
              </Button>
            )}
            <Button
              variant={payload ? "secondary" : "primary"}
              size={payload ? "md" : "lg"}
              block
              icon={RefreshCw}
              onClick={() => void start()}
            >
              {t("playAgain")}
            </Button>
            <Button
              variant="ghost"
              block
              icon={SkipForward}
              loading={skipTask.isPending}
              onClick={skip}
            >
              {t("skip")}
            </Button>
          </>
        }
      >
        <FormAlert message={errorMessage(phase.error)} />
        <p className="m-0 text-text-2">{t("errorBody")}</p>
      </FlowPage>
    );
  }

  if (phase.name === "done") {
    return (
      <FlowPage
        progress={header}
        footer={
          <>
            <Button size="lg" block iconRight={ArrowRight} onClick={goNext}>
              {next === "analysing" ? t("toResult") : t("nextGame")}
            </Button>
            <Button variant="secondary" block icon={RefreshCw} onClick={() => void start()}>
              {t("playAgain")}
            </Button>
          </>
        }
      >
        <TaskOutcome task={phase.task} childName={screening.child_name} />
        <GameList screening={screening} current={slug} />
      </FlowPage>
    );
  }

  return (
    <FlowPage
      progress={header}
      title={title}
      subtitle={subtitle}
      footer={
        <>
          {cameraError && <FormAlert message={t("cameraSwitchFailed")} />}
          <Button size="lg" block icon={Play} disabled={!canStart} onClick={() => void start()}>
            {previous ? t("playAgain") : t("start")}
          </Button>
          {previous ? (
            <Button variant="ghost" block iconRight={ArrowRight} onClick={goNext}>
              {next === "analysing" ? t("toResult") : t("nextGame")}
            </Button>
          ) : (
            <Button
              variant="ghost"
              block
              icon={SkipForward}
              loading={skipTask.isPending}
              onClick={skip}
            >
              {t("skip")}
            </Button>
          )}
          {skipTask.isError && <FormAlert message={errorMessage(skipTask.error)} />}
        </>
      }
    >
      {previous && <TaskOutcome task={previous} childName={screening.child_name} compact />}
      {intro}
    </FlowPage>
  );
}

/** Renders the running game's stage; its controls are passed in as event handlers. */
function StageSlot({
  render,
  stop,
  skip,
}: {
  render: (actions: StageActions) => ReactNode;
  stop: () => void;
  skip: () => void;
}) {
  return <>{render({ stop, skip })}</>;
}

/** "Game 2 of 5" + continue later, over the game list's dots. */
function GameHeader({ screening, slug }: { screening: Screening; slug: StepSlug }) {
  const t = useTranslations("activities.task");
  const tScreening = useTranslations("screening");
  const games = STEPS.filter((s) => s.slug !== "calibration");
  const index = games.findIndex((s) => s.slug === slug);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-navy">
          {index >= 0 ? t("gameCount", { n: index + 1, total: games.length }) : t("eyeCheck")}
        </span>
        <Link
          href="/home"
          className="inline-flex min-h-12 items-center gap-2 rounded-sm font-semibold text-text-2 hover:underline"
        >
          <Pause aria-hidden className="size-4.5" />
          {tScreening("later")}
        </Link>
      </div>
      <ol className="m-0 flex list-none gap-1.5 p-0" aria-hidden>
        {STEPS.map((step) => {
          const status = uploadOf(screening, step.task)?.status;
          return (
            <li
              key={step.slug}
              className={cx(
                "h-2 flex-1 rounded-pill",
                step.slug === slug
                  ? "bg-navy"
                  : status === "ok" || status === "low"
                    ? "bg-leaf"
                    : status
                      ? "bg-amber"
                      : "bg-n-100",
              )}
            />
          );
        })}
      </ol>
    </div>
  );
}

type Tone = "good" | "fair" | "none";

function toneOf(task: TaskOut): Tone {
  if (task.status === "ok") return "good";
  if (task.status === "low" || task.status === "fallback") return "fair";
  return "none";
}

/** How a game went (§4.9), in the parent's words. */
export function TaskOutcome({
  task,
  childName,
  compact = false,
}: {
  task: TaskOut;
  childName: string;
  compact?: boolean;
}) {
  const t = useTranslations("activities.outcome");
  const tReasons = useTranslations("results.reasons");
  const tone = toneOf(task);
  const skipped = task.reason === "skipped";
  const key =
    task.task === "calibration"
      ? (`calibration.${task.status === "ok" ? "ok" : skipped ? "skipped" : "fallback"}` as const)
      : skipped
        ? "skipped"
        : tone;
  const Icon = tone === "good" ? CircleCheck : tone === "fair" ? CircleAlert : CircleDashed;
  const reason =
    !skipped && task.reason && tReasons.has(task.reason as "skipped")
      ? tReasons(task.reason as "skipped")
      : null;
  return (
    <Card
      tone={tone === "good" ? "calm" : "warm"}
      className={cx("flex gap-3", compact ? "p-3.5" : "p-4.5")}
    >
      <Icon
        aria-hidden
        className={cx(
          "mt-0.5 size-6 shrink-0",
          tone === "good" ? "text-leaf-ink" : "text-amber-ink",
        )}
      />
      <div className="flex flex-col gap-1">
        <p className="m-0 font-display text-[18px] font-bold">{t(`${key}.title`)}</p>
        {!compact && <p className="m-0 text-text-2">{t(`${key}.body`, { name: childName })}</p>}
        {reason && <p className="m-0 text-small text-text-2">{t("reason", { reason })}</p>}
      </div>
    </Card>
  );
}

/** Every game with its status: done, measured with less certainty, not measured, or to come. */
export function GameList({ screening, current }: { screening: Screening; current?: StepSlug }) {
  const t = useTranslations("activities.task");
  const tGames = useTranslations("screening.activities.games");
  const tStatus = useTranslations("activities.status");
  const format = useFormatter();
  return (
    <ol className="m-0 list-none overflow-hidden rounded-lg border border-[rgba(0,60,120,.06)] bg-white p-0 shadow-sm">
      {STEPS.map((step, index) => {
        const upload = uploadOf(screening, step.task);
        const Icon = step.task === "calibration" ? Crosshair : TASK_ICONS[step.task];
        const label = step.task === "calibration" ? t("eyeCheck") : tGames(TASK_GAME[step.task]);
        const status = upload
          ? upload.reason === "skipped"
            ? "skipped"
            : toneOf(upload)
          : step.slug === current
            ? "now"
            : "todo";
        return (
          <li
            key={step.slug}
            className={cx(
              "flex items-center gap-3 border-b border-border-1 px-3.5 py-3 last:border-b-0",
              step.slug === current && "bg-sky-50",
            )}
          >
            <span className="sr-only">{format.number(index + 1)}</span>
            <Icon aria-hidden className="size-5 shrink-0 text-teal-ink" />
            <span className="flex-1 font-semibold">{label}</span>
            <span
              className={cx(
                "text-small font-semibold",
                status === "good" && "text-leaf-ink",
                (status === "fair" || status === "none") && "text-amber-ink",
                (status === "skipped" || status === "todo" || status === "now") && "text-text-2",
              )}
            >
              {tStatus(status)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
