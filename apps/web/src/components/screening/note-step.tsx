"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { QueryView } from "@/components/app/query-view";
import { FormAlert } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { StateView } from "@/components/ui/state-view";
import { TextAreaField } from "@/components/ui/text-field";
import { ApiRequestError } from "@/lib/api/client";
import { useErrorMessage } from "@/lib/api/error-message";
import { useRouter } from "@/lib/i18n/navigation";
import { useCompleteQuestionnaire, useScreening } from "@/lib/screening/queries";
import { questionPath, resumePath, type Screening } from "@/lib/screening/rules";

import { FlowPage } from "./flow-page";

const MAX_NOTE = 2000;

/** After the last question: "Anything else you've noticed?" — optional, verbatim for the
 *  doctor report, not scored (SCREENING_SPEC §3.2). */
export function NoteStep({ screeningId }: { screeningId: number }) {
  const query = useScreening(screeningId);
  const router = useRouter();
  const screening = query.data;
  const misplaced = screening && !screening.consent_at;

  useEffect(() => {
    if (screening && misplaced) router.replace(resumePath(screening));
  }, [screening, misplaced, router]);

  if (misplaced) return <StateView kind="loading" />;
  return <QueryView query={query}>{(data) => <NoteForm screening={data} />}</QueryView>;
}

function NoteForm({ screening }: { screening: Screening }) {
  const t = useTranslations("screening.note");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const complete = useCompleteQuestionnaire(screening.id);
  const [note, setNote] = useState(screening.parent_note ?? "");

  const finish = () =>
    complete.mutate(note, {
      onSuccess: () => router.push(`/screening/${screening.id}/activities`),
      onError: (error) => {
        // A question still open (e.g. own words never confirmed): go straight to it.
        const itemId = missingItem(error);
        const index = screening.items.findIndex((item) => item.id === itemId);
        if (index >= 0) router.push(questionPath(screening.id, index + 1));
      },
    });

  return (
    <FlowPage
      back={{ href: questionPath(screening.id, screening.items.length), label: t("back") }}
      step="questions"
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          {complete.isError && <FormAlert message={errorMessage(complete.error)} />}
          <Button size="lg" block icon={Check} loading={complete.isPending} onClick={finish}>
            {t("submit")}
          </Button>
        </>
      }
    >
      <TextAreaField
        label={t("label")}
        placeholder={t("placeholder")}
        rows={5}
        maxLength={MAX_NOTE}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
    </FlowPage>
  );
}

function missingItem(error: unknown): string | null {
  if (!(error instanceof ApiRequestError) || error.code !== "questionnaire_incomplete") return null;
  const itemId = error.body?.error.detail?.item_id;
  return typeof itemId === "string" ? itemId : null;
}
