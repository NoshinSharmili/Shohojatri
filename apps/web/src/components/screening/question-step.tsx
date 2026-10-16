"use client";

import { ArrowLeft, ArrowRight, Check, Pause, PencilLine, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useEffect, useId, useState } from "react";

import { QueryView } from "@/components/app/query-view";
import { FormAlert } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { ChoiceGroup, OTHER } from "@/components/ui/choice-group";
import { StateView } from "@/components/ui/state-view";
import { useErrorMessage } from "@/lib/api/error-message";
import { usePrefetchModels } from "@/lib/cv/prefetch";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { useMapOther, useSaveAnswer, useScreening } from "@/lib/screening/queries";
import { type OtherMapping, questionPath, resumePath, type Screening } from "@/lib/screening/rules";

import { FlowPage } from "./flow-page";
import { DomainIcon } from "./screening-icons";
import { useOptionLabel } from "./use-option-label";

const NOT_SURE = "not_sure";
const MAX_OTHER = 1000;

type DomainKey = Parameters<ReturnType<typeof useTranslations<"screening.domains">>>[0];

/**
 * One question per screen (SCREENING_SPEC §3). Answers save as they're picked; own words go
 * through the AI mapping and only count once the parent confirms a card (§3.3).
 */
export function QuestionStep({ screeningId, n }: { screeningId: number; n: number }) {
  const query = useScreening(screeningId);
  const router = useRouter();
  const screening = query.data;
  const misplaced = screening && (!screening.consent_at || n < 1 || n > screening.items.length);
  // Demo screenings replay recorded games and never load the models.
  usePrefetchModels(!!screening && !screening.is_demo);

  useEffect(() => {
    if (screening && misplaced) router.replace(resumePath(screening));
  }, [screening, misplaced, router]);

  if (misplaced) return <StateView kind="loading" />;
  return (
    <QueryView query={query}>
      {(data) => <QuestionScreen key={data.items[n - 1].id} screening={data} n={n} />}
    </QueryView>
  );
}

/**
 * choose: answer cards + "Other (write)" · confirm: the AI's reading of the parent's words ·
 * pick: the parent picks the closest card for their words · confirmed: words saved with a card.
 */
type Mode = "choose" | "confirm" | "pick" | "confirmed";

function QuestionScreen({ screening, n }: { screening: Screening; n: number }) {
  const t = useTranslations("screening.question");
  const tScreening = useTranslations("screening");
  const tDomains = useTranslations("screening.domains");
  const locale = useLocale();
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const options = useOptionLabel();
  const save = useSaveAnswer(screening.id);
  const mapOther = useMapOther(screening.id);
  const questionId = useId();

  const item = screening.items[n - 1];
  const total = screening.items.length;
  const saved = screening.answers.find((a) => a.item_id === item.id);
  const ownWords = saved?.other_text ?? null;

  const [mode, setMode] = useState<Mode>(() => {
    if (!ownWords || !item.maps_other) return "choose";
    if (saved?.final) return "confirmed";
    return saved?.ai_mapping?.status === "suggested" ? "confirm" : "pick";
  });
  const [choice, setChoice] = useState<string | null>(() =>
    ownWords ? OTHER : (saved?.option ?? null),
  );
  const [text, setText] = useState(ownWords ?? "");
  const [mapping, setMapping] = useState<OtherMapping | null>(saved?.ai_mapping ?? null);
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextHref =
    n < total ? questionPath(screening.id, n + 1) : `/screening/${screening.id}/note`;
  const prevHref = n > 1 ? questionPath(screening.id, n - 1) : `/screening/${screening.id}/consent`;
  const nextLabel = n < total ? t("next") : t("last");
  const busy = save.isPending || mapOther.isPending;

  async function saveAndGo(option: string, otherText?: string) {
    setError(null);
    try {
      await save.mutateAsync({ itemId: item.id, option, other_text: otherText ?? null });
      router.push(nextHref);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  function pickCard(value: string) {
    setChoice(value);
    setError(null);
    // Autosave, so a reload or "continue later" keeps the answer.
    if (value !== OTHER) {
      save.mutate(
        { itemId: item.id, option: value },
        { onError: (e) => setError(errorMessage(e)) },
      );
    }
  }

  async function submitChoice() {
    if (choice === null) return;
    if (choice !== OTHER) {
      const alreadySaved = saved?.option === choice && !saved.other_text;
      return alreadySaved ? router.push(nextHref) : saveAndGo(choice);
    }
    const words = text.trim();
    if (!item.maps_other) return saveAndGo(OTHER, words);
    setError(null);
    try {
      const result = await mapOther.mutateAsync({ itemId: item.id, otherText: words });
      setText(words);
      setMapping(result);
      setPicked(null);
      setMode(result.status === "suggested" ? "confirm" : "pick");
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  const cards = item.options.map((option) => ({
    value: option,
    label: options.label(item, option),
    description: options.hint(item, option),
  }));

  let body: ReactNode;
  let footer: ReactNode;
  switch (mode) {
    case "choose":
      body = (
        <ChoiceGroup
          name={item.id}
          labelledBy={questionId}
          options={cards}
          value={choice}
          onChange={pickCard}
          other={{
            label: tScreening("options.other"),
            fieldLabel: t("otherField"),
            placeholder: t("otherPlaceholder"),
            text,
            onTextChange: setText,
            maxLength: MAX_OTHER,
          }}
        />
      );
      footer = (
        <Button
          size="lg"
          block
          iconRight={ArrowRight}
          loading={busy}
          disabled={choice === null || (choice === OTHER && !text.trim())}
          onClick={() => void submitChoice()}
        >
          {mapOther.isPending
            ? t("reading")
            : choice === OTHER && item.maps_other
              ? t("checkAnswer")
              : nextLabel}
        </Button>
      );
      break;

    case "confirm":
      body = (
        <OwnWords text={text} onEdit={() => setMode("choose")}>
          <div className="rounded-leaf border-[1.5px] border-dashed border-sky bg-teal-50 px-4.5 py-4">
            <p className="m-0 flex items-center gap-2 text-small font-semibold text-teal-ink">
              <Sparkles aria-hidden className="size-4.5" />
              {t("aiTitle")}
            </p>
            <p className="mt-1.5 mb-1 font-display text-[21px] leading-[1.5] font-bold text-text-1">
              {t.rich("understood", {
                option: mapping?.option ? options.label(item, mapping.option) : "",
                b: (chunks) => <span className="text-navy">{chunks}</span>,
              })}
            </p>
            {mapping?.reason && <p className="m-0 text-[15px] text-text-2">{mapping.reason}</p>}
            <p className="mt-1 mb-3.5 text-[15px] text-text-2">{t("keptInReport")}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                icon={Check}
                loading={save.isPending}
                onClick={() => mapping?.option && void saveAndGo(mapping.option, text)}
              >
                {t("confirm")}
              </Button>
              <Button variant="secondary" icon={PencilLine} onClick={() => setMode("pick")}>
                {t("change")}
              </Button>
            </div>
          </div>
        </OwnWords>
      );
      break;

    case "pick":
      body = (
        <OwnWords text={text} onEdit={() => setMode("choose")}>
          <div className="flex flex-col gap-2.5">
            <p id={`${questionId}-pick`} className="m-0 font-display text-h3 font-bold text-text-1">
              {t("pickTitle")}
            </p>
            <p className="m-0 text-[15px] text-text-2">
              {mapping?.status === "unclear"
                ? t("pickUnclear")
                : mapping?.status === "unavailable"
                  ? t("pickUnavailable")
                  : t("pickHint")}
            </p>
            <ChoiceGroup
              name={`${item.id}-closest`}
              labelledBy={`${questionId}-pick`}
              options={cards}
              value={picked}
              onChange={setPicked}
            />
          </div>
        </OwnWords>
      );
      footer = (
        <>
          <Button
            size="lg"
            block
            iconRight={ArrowRight}
            loading={save.isPending}
            disabled={picked === null}
            onClick={() => picked && void saveAndGo(picked, text)}
          >
            {nextLabel}
          </Button>
          {!item.options.includes(NOT_SURE) && (
            <Button variant="ghost" block onClick={() => void saveAndGo(NOT_SURE, text)}>
              {t("cantChoose")}
            </Button>
          )}
        </>
      );
      break;

    case "confirmed":
      body = (
        <OwnWords text={text}>
          <p className="m-0 rounded-md bg-leaf-50 px-4 py-3 text-body text-text-1">
            {t.rich("savedAs", {
              option: saved ? options.label(item, saved.option) : "",
              b: (chunks) => <strong className="text-leaf-ink">{chunks}</strong>,
            })}
          </p>
          <Button
            variant="secondary"
            icon={PencilLine}
            className="self-start"
            onClick={() => setMode("choose")}
          >
            {t("changeAnswer")}
          </Button>
        </OwnWords>
      );
      footer = (
        <Button size="lg" block iconRight={ArrowRight} onClick={() => router.push(nextHref)}>
          {nextLabel}
        </Button>
      );
      break;
  }

  const domainLabel = tDomains(item.domain as DomainKey);

  return (
    <FlowPage
      progress={
        <QuestionHeader
          n={n}
          total={total}
          answered={screening.answered}
          domain={domainLabel}
          prevHref={prevHref}
        />
      }
      footer={
        // The AI card carries its own buttons; an empty sticky bar would cover them.
        (footer || error) && (
          <>
            <FormAlert message={error ?? undefined} />
            {footer}
          </>
        )
      }
    >
      <div
        aria-hidden
        className="flex h-24 items-center justify-center rounded-leaf bg-sky-50 text-amber-ink"
      >
        <span className="flex size-14 items-center justify-center rounded-[16px] bg-amber-50">
          <DomainIcon domain={item.domain} className="size-7" />
        </span>
      </div>
      <div>
        <h1
          id={questionId}
          className="m-0 font-display text-[21px] leading-[1.5] font-bold text-pretty text-text-1"
        >
          {locale === "en" ? item.text_en : item.text_bn}
        </h1>
        <p className="mt-1 mb-0 text-[15px] text-text-2">{t("noRightAnswer")}</p>
      </div>
      <div aria-live="polite">{body}</div>
    </FlowPage>
  );
}

/** The parent's own words as a quote, with a way back to edit them. */
function OwnWords({
  text,
  onEdit,
  children,
}: {
  text: string;
  onEdit?: () => void;
  children: ReactNode;
}) {
  const t = useTranslations("screening.question");
  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <p className="mt-0 mb-2 text-small font-semibold text-text-2">{t("yourAnswer")}</p>
        <blockquote className="m-0 flex flex-col items-start gap-0.5 rounded-leaf-r border border-border-1 bg-white px-4 py-3.5 text-body leading-[1.7] text-text-1">
          “{text}”
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="min-h-9 cursor-pointer border-0 bg-transparent p-0 text-[15px] font-semibold text-text-link hover:underline"
            >
              {t("editWords")}
            </button>
          )}
        </blockquote>
      </div>
      {children}
    </div>
  );
}

function QuestionHeader({
  n,
  total,
  answered,
  domain,
  prevHref,
}: {
  n: number;
  total: number;
  answered: number;
  domain: string;
  prevHref: string;
}) {
  const t = useTranslations("screening");
  const iconLink =
    "flex size-12 shrink-0 items-center justify-center rounded-full text-text-2 hover:bg-n-100";
  return (
    <div className="-mx-2 flex items-center gap-2">
      <Link href={prevHref} aria-label={t("question.back")} className={iconLink}>
        <ArrowLeft aria-hidden className="size-5.5" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex justify-between gap-3 text-small font-semibold">
          <span className="text-navy">{t("question.count", { n, total })}</span>
          <span className="text-right text-text-2">{domain}</span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answered}
          aria-label={t("question.count", { n, total })}
          className="h-2 overflow-hidden rounded-pill bg-n-100"
        >
          <div
            className="h-full rounded-pill bg-navy transition-[width] duration-(--dur-slow)"
            style={{ width: `${(answered / total) * 100}%` }}
          />
        </div>
      </div>
      <Link href="/home" aria-label={t("later")} className={iconLink}>
        <Pause aria-hidden className="size-5" />
      </Link>
    </div>
  );
}
