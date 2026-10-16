import type { components } from "@/lib/api/schema";

export type Screening = components["schemas"]["ScreeningOut"];
export type ScreeningSummary = components["schemas"]["ScreeningSummary"];
export type QuestionItem = components["schemas"]["ItemOut"];
export type SavedAnswer = components["schemas"]["AnswerOut"];
export type OtherMapping = components["schemas"]["OtherMappingOut"];
export type Informant = components["schemas"]["Informant"];

/**
 * Version of the consent text in messages (screening.consent). Change it whenever that text
 * changes, and add the new version to CONSENT_VERSIONS in apps/api/app/core/screenings.py.
 */
export const CONSENT_VERSION = "screening-consent-1";

export const INFORMANTS: readonly Informant[] = ["mother", "father", "other_caregiver"];

/** Mirrors `eligibility` in apps/api/app/scoring/config.yaml (SCREENING_SPEC §2). The API
 *  enforces it; the form uses it to explain before the parent submits. */
export const AGE_RANGE = { min: 12, designedMin: 16, designedMax: 48, max: 72 } as const;

export type AgeFit = "blocked" | "younger" | "older" | "ok";

export function ageFit(months: number): AgeFit {
  if (months < AGE_RANGE.min || months > AGE_RANGE.max) return "blocked";
  if (months < AGE_RANGE.designedMin) return "younger";
  if (months > AGE_RANGE.designedMax) return "older";
  return "ok";
}

/** Where a parent picks up a screening: consent, the first unanswered question, the games, or
 *  the result once it is finalized. */
export function resumePath(screening: Screening): string {
  const base = `/screening/${screening.id}`;
  if (screening.status === "finalized") return `${base}/result`;
  if (!screening.consent_at) return `${base}/consent`;
  const final = new Set(screening.answers.filter((a) => a.final).map((a) => a.item_id));
  const next = screening.items.findIndex((item) => !final.has(item.id));
  if (next >= 0) return `${base}/questions/${next + 1}`;
  return screening.questionnaire_completed_at ? `${base}/activities` : `${base}/note`;
}

export const questionPath = (screeningId: number, n: number) =>
  `/screening/${screeningId}/questions/${n}`;
