"use client";

import { useTranslations } from "next-intl";

import type { QuestionItem } from "@/lib/screening/rules";

const NOT_SURE = "not_sure";

type OptionKey = Parameters<ReturnType<typeof useTranslations<"screening.options">>>[0];
type HintKey = Parameters<ReturnType<typeof useTranslations<"screening.optionHints">>>[0];

/** Label (and optional hint) for an answer card of a given item. */
export function useOptionLabel() {
  const t = useTranslations("screening.options");
  const tHint = useTranslations("screening.optionHints");
  return {
    label(item: QuestionItem, option: string): string {
      // not_sure is also the "couldn't pick a card" fallback on items without that card (q13).
      if (option === NOT_SURE && !item.options.includes(NOT_SURE)) return t("notSure");
      return t(`${item.type}.${option}` as OptionKey);
    },
    hint(item: QuestionItem, option: string): string | undefined {
      const key = `${item.type}.${option}` as HintKey;
      return tHint.has(key) ? tHint(key) : undefined;
    },
  };
}
