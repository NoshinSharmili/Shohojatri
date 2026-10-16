"use client";

import type { LucideIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { domainIcon, TASK_ICONS } from "@/components/screening/screening-icons";
import { useFormatAge } from "@/lib/children/queries";
import {
  excludedReason,
  type Finding,
  type Report,
  type ScoredTask,
  TASK_GAME,
} from "@/lib/screening/results";

// Finding and recommendation keys come from the API (scoring/results.py), so they can't be
// checked against the messages at compile time; messages-parity keeps bn and en in step.
type Translate = (key: string, values?: Record<string, string | number>) => string;

export type FindingText = { text: string; source: string; icon: LucideIcon };

/** Report sentences from the result's i18n keys + params (SCREENING_SPEC §5): no LLM, and the
 *  same words on the result screen and both reports. Uses the nearest intl provider, so the
 *  doctor report can render in its own language. */
export function useResultText(report: Report) {
  const t = useTranslations() as unknown as Translate;
  const tResults = useTranslations("results");
  const tGames = useTranslations("screening.activities.games");
  const format = useFormatter();
  const formatAge = useFormatAge();
  const name = report.child.name;
  const result = report.result;

  const game = (task: string) => tGames(TASK_GAME[task as ScoredTask]);
  const reason = (key: string) => (tResults as unknown as Translate)(`reasons.${key}`);

  return {
    name,
    age: formatAge(report.age_months),
    date: format.dateTime(new Date(report.finalized_at), { dateStyle: "long" }),
    game,

    finding(finding: Finding): FindingText {
      const item = report.items.find((i) => i.item_id === finding.source);
      // Item sentences differ for a concern and a strength; task sentences carry their numbers.
      const key = item ? `${finding.key}.${finding.polarity}` : finding.key;
      const params = Object.fromEntries(
        Object.entries(finding.params ?? {}).filter(
          (entry): entry is [string, string | number] => entry[1] !== null,
        ),
      );
      return {
        text: t(key, { ...params, name }),
        source: item
          ? tResults("sources.item", { n: format.number(item.number) })
          : tResults("sources.task", { game: game(finding.source) }),
        icon: item ? domainIcon(item.domain) : TASK_ICONS[finding.source as ScoredTask],
      };
    },

    recommendation: (key: string) => t(key, { name }),

    /** "Calling their name (skipped), Free play (not enough light)". */
    notCounted(): string | null {
      const excluded = result.tasks.filter((task) => task.status === "inconclusive");
      // No games at all: the confidence text already says so, and listing all five adds noise.
      const noGames = excluded.length === result.tasks.length;
      if (
        excluded.length === 0 ||
        (noGames && excluded.every((task) => task.quality.reason === "skipped"))
      ) {
        return null;
      }
      return format.list(
        excluded.map((task) => {
          const why = excludedReason(report, task);
          return why
            ? tResults("confidence.taskReason", { game: game(task.task), reason: reason(why) })
            : game(task.task);
        }),
      );
    },

    lowQuality(): string | null {
      const low = result.tasks.filter((task) => task.status === "low");
      if (low.length === 0) return null;
      return format.list(
        low.map((task) => {
          const why = excludedReason(report, task);
          return why === "low_light"
            ? tResults("confidence.taskReason", { game: game(task.task), reason: reason(why) })
            : game(task.task);
        }),
      );
    },

    validGames: result.tasks.filter((task) => task.status !== "inconclusive").length,
  };
}
