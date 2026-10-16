"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { QueryView } from "@/components/app/query-view";
import { FormAlert } from "@/components/auth/auth-screen";
import { FlowPage } from "@/components/screening/flow-page";
import { Button } from "@/components/ui/button";
import { StateView } from "@/components/ui/state-view";
import type { ActivitySlug } from "@/lib/activities/tasks";
import { useErrorMessage } from "@/lib/api/error-message";
import { useRouter } from "@/lib/i18n/navigation";
import { useFinalizeScreening, useScreening } from "@/lib/screening/queries";
import { resultPath } from "@/lib/screening/results";
import { resumePath, type Screening } from "@/lib/screening/rules";

import { CalibrationTask } from "./calibration-task";
import { CameraProblem } from "./camera-states";
import { useCapture } from "./capture-provider";
import { CopyTask } from "./copy-task";
import { FreePlayTask } from "./free-play-task";
import { LookTask } from "./look-task";
import { NameCallTask } from "./name-call-task";
import { PointTask } from "./point-task";
import { SetupStep } from "./setup-step";
import { GameList } from "./task-frame";

/** One step of Part 2 (route `/screening/[id]/activities/[task]`). Every step but the last needs
 *  the camera: after a reload the parent turns it on again here, then carries on. */
export function ActivityPage({ screeningId, slug }: { screeningId: number; slug: ActivitySlug }) {
  const query = useScreening(screeningId);
  const router = useRouter();
  const screening = query.data;
  const misplaced =
    screening && (!screening.questionnaire_completed_at || screening.status === "finalized");

  useEffect(() => {
    if (screening && misplaced) router.replace(resumePath(screening));
  }, [screening, misplaced, router]);

  if (misplaced) return <StateView kind="loading" />;
  return (
    <QueryView query={query}>
      {(data) =>
        slug === "analysing" ? (
          <Analysing screening={data} />
        ) : (
          <WithCamera screening={data} slug={slug} />
        )
      }
    </QueryView>
  );
}

function WithCamera({
  screening,
  slug,
}: {
  screening: Screening;
  slug: Exclude<ActivitySlug, "analysing">;
}) {
  const { state, start } = useCapture();
  if (state.status !== "ready") {
    return <CameraProblem screeningId={screening.id} state={state} onStart={() => void start()} />;
  }
  switch (slug) {
    case "setup":
      return <SetupStep screening={screening} />;
    case "calibration":
      return <CalibrationTask screening={screening} />;
    case "name-call":
      return <NameCallTask screening={screening} />;
    case "point":
      return <PointTask screening={screening} />;
    case "copy":
      return <CopyTask screening={screening} />;
    case "look":
      return <LookTask screening={screening} />;
    case "free-play":
      return <FreePlayTask screening={screening} />;
  }
}

/** Camera off, then everything is scored together (design Screening Flow 13). */
function Analysing({ screening }: { screening: Screening }) {
  const t = useTranslations("activities.analysing");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const { stop } = useCapture();
  const finalize = useFinalizeScreening(screening.id);
  const started = useRef(false);
  const run = finalize.mutate;

  useEffect(() => {
    stop();
    // Once, also under React's development double effects.
    if (started.current) return;
    started.current = true;
    run(undefined, { onSuccess: () => router.replace(resultPath(screening.id)) });
  }, [stop, run, router, screening.id]);

  return (
    <FlowPage
      title={t("title", { name: screening.child_name })}
      subtitle={t("subtitle")}
      footer={
        finalize.isError && (
          <Button
            size="lg"
            block
            onClick={() =>
              run(undefined, { onSuccess: () => router.replace(resultPath(screening.id)) })
            }
          >
            {t("retry")}
          </Button>
        )
      }
    >
      {finalize.isError ? (
        <FormAlert message={errorMessage(finalize.error)} />
      ) : (
        <StateView kind="loading" title={t("working")} />
      )}
      <GameList screening={screening} />
    </FlowPage>
  );
}
