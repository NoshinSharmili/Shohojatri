"use client";

import {
  Camera,
  CameraOff,
  ClipboardCheck,
  Globe,
  Info,
  RefreshCw,
  ShieldCheck,
  Timer,
  Trash2,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { FormAlert } from "@/components/auth/auth-screen";
import { FlowPage } from "@/components/screening/flow-page";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StateView } from "@/components/ui/state-view";
import { useErrorMessage } from "@/lib/api/error-message";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { useFinalizeScreening } from "@/lib/screening/queries";
import { resultPath } from "@/lib/screening/results";

import { type CaptureStatus, useCapture } from "./capture-provider";

/** "See the result without the games": a questionnaire-only result (SCREENING_SPEC §1). */
function AnswersOnly({ screeningId, primary }: { screeningId: number; primary?: boolean }) {
  const t = useTranslations("activities.camera");
  const errorMessage = useErrorMessage();
  const finalize = useFinalizeScreening(screeningId);
  const router = useRouter();
  const { stop } = useCapture();
  return (
    <>
      {finalize.isError && <FormAlert message={errorMessage(finalize.error)} />}
      <Button
        variant={primary ? "secondary" : "ghost"}
        block
        icon={ClipboardCheck}
        loading={finalize.isPending}
        onClick={() =>
          finalize.mutate(undefined, {
            onSuccess: () => {
              stop();
              router.replace(resultPath(screeningId));
            },
          })
        }
      >
        {t("answersOnly")}
      </Button>
    </>
  );
}

function Tile({ tone, children }: { tone: "sky" | "warm"; children: ReactNode }) {
  return (
    <span
      className={
        tone === "sky"
          ? "flex size-16 items-center justify-center rounded-lg bg-sky-50 text-navy"
          : "flex size-16 items-center justify-center rounded-lg bg-amber-50 text-amber-ink"
      }
    >
      {children}
    </span>
  );
}

function LessCertain() {
  const t = useTranslations("activities.camera");
  return (
    <p className="m-0 flex gap-2 text-small text-text-2">
      <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
      {t("lessCertain")}
    </p>
  );
}

/** K1: why the camera is needed, before the browser asks. */
export function CameraAsk({ screeningId, onStart }: { screeningId: number; onStart: () => void }) {
  const t = useTranslations("activities.camera");
  const { state } = useCapture();
  return (
    <FlowPage
      back={{ href: `/screening/${screeningId}/activities`, label: t("back") }}
      footer={
        <>
          <Button
            size="lg"
            block
            icon={Camera}
            loading={state.status === "starting"}
            onClick={onStart}
          >
            {t("turnOn")}
          </Button>
          <Link
            href={`/screening/${screeningId}/activities`}
            className={buttonClasses({ variant: "ghost", block: true })}
          >
            {t("later")}
          </Link>
        </>
      }
    >
      <Tile tone="sky">
        <Camera aria-hidden className="size-8" />
      </Tile>
      <div>
        <h1 className="m-0 font-display text-h1 font-bold text-pretty">{t("askTitle")}</h1>
        <p className="mt-1.5 mb-0 text-text-2">{t("askBody")}</p>
      </div>
      <Card className="flex flex-col gap-3.5">
        {(
          [
            ["onlyGames", Timer],
            ["staysHere", ShieldCheck],
            ["nothingSaved", Trash2],
          ] as const
        ).map(([key, Icon]) => (
          <p key={key} className="m-0 flex gap-3">
            <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-teal-ink" />
            <span>{t(`promise.${key}`)}</span>
          </p>
        ))}
      </Card>
    </FlowPage>
  );
}

/** K2: permission denied, with steps to turn it back on. */
function CameraDenied({ screeningId, onRetry }: { screeningId: number; onRetry: () => void }) {
  const t = useTranslations("activities.camera");
  const format = useFormatter();
  return (
    <FlowPage
      footer={
        <>
          <Button size="lg" block icon={RefreshCw} onClick={onRetry}>
            {t("tryAgain")}
          </Button>
          <AnswersOnly screeningId={screeningId} primary />
        </>
      }
    >
      <Tile tone="warm">
        <CameraOff aria-hidden className="size-8" />
      </Tile>
      <div>
        <h1 className="m-0 font-display text-h1 font-bold text-pretty">{t("deniedTitle")}</h1>
        <p className="mt-1.5 mb-0 text-text-2">{t("deniedBody")}</p>
      </div>
      <Card tone="sky">
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {(["one", "two", "three"] as const).map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white font-display font-bold text-navy">
                {format.number(i + 1)}
              </span>
              <span>{t(`deniedSteps.${step}`)}</span>
            </li>
          ))}
        </ol>
      </Card>
      <LessCertain />
    </FlowPage>
  );
}

/** K3: the camera won't start (in use, missing), or the game models couldn't download. */
function CameraFailed({
  screeningId,
  kind,
  onRetry,
}: {
  screeningId: number;
  kind: "not_found" | "busy" | "failed" | "models";
  onRetry: () => void;
}) {
  const t = useTranslations("activities.camera");
  return (
    <FlowPage
      footer={
        <>
          <Button size="lg" block icon={RefreshCw} onClick={onRetry}>
            {t("tryAgain")}
          </Button>
          <AnswersOnly screeningId={screeningId} />
        </>
      }
    >
      <StateView
        kind="error"
        title={t(`failed.${kind}.title`)}
        message={t(`failed.${kind}.body`)}
      />
      <LessCertain />
    </FlowPage>
  );
}

/** A browser without camera access, WebAssembly or audio processing (or a page not on https). */
function Unsupported({ screeningId, reason }: { screeningId: number; reason: string }) {
  const t = useTranslations("activities.camera");
  return (
    <FlowPage footer={<AnswersOnly screeningId={screeningId} primary />}>
      <Tile tone="warm">
        <Globe aria-hidden className="size-8" />
      </Tile>
      <div>
        <h1 className="m-0 font-display text-h1 font-bold text-pretty">{t("unsupportedTitle")}</h1>
        <p className="mt-1.5 mb-0 text-text-2">
          {t(reason === "insecure" ? "unsupportedInsecure" : "unsupportedBody")}
        </p>
      </div>
      <LessCertain />
    </FlowPage>
  );
}

/** Renders the right screen for a camera that isn't ready, or null when it is. */
export function CameraProblem({
  screeningId,
  state,
  onStart,
}: {
  screeningId: number;
  state: CaptureStatus;
  onStart: () => void;
}) {
  const t = useTranslations("activities.camera");
  switch (state.status) {
    case "idle":
    case "starting":
      return <CameraAsk screeningId={screeningId} onStart={onStart} />;
    case "loading":
      return (
        <div className="flex flex-1 items-center justify-center">
          <StateView kind="loading" title={t("loadingTitle")} message={t("loadingBody")} />
        </div>
      );
    case "unsupported":
      return <Unsupported screeningId={screeningId} reason={state.reason} />;
    case "error":
      return state.kind === "denied" ? (
        <CameraDenied screeningId={screeningId} onRetry={onStart} />
      ) : (
        <CameraFailed screeningId={screeningId} kind={state.kind} onRetry={onStart} />
      );
    case "ready":
      return null;
  }
}
