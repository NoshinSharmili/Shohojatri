import type { components } from "@/lib/api/schema";

type Screening = components["schemas"]["ScreeningOut"];
export type TaskSlug = components["schemas"]["TaskOut"]["task"];
export type TaskOut = components["schemas"]["TaskOut"];

/** Route segments under /screening/[id]/activities/ (design route map), in SCREENING_SPEC §1
 *  order, with the API task each one uploads. */
export const STEPS = [
  { slug: "calibration", task: "calibration" },
  { slug: "name-call", task: "rtn" },
  { slug: "point", task: "joint_attention" },
  { slug: "copy", task: "imitation" },
  { slug: "look", task: "gaze_preference" },
  { slug: "free-play", task: "free_play" },
] as const satisfies readonly { slug: string; task: TaskSlug }[];

export type StepSlug = (typeof STEPS)[number]["slug"];
export type ActivitySlug = StepSlug | "setup" | "analysing";

export const ACTIVITY_SLUGS: readonly ActivitySlug[] = [
  "setup",
  ...STEPS.map((s) => s.slug),
  "analysing",
];

export const activityPath = (screeningId: number, slug: ActivitySlug) =>
  `/screening/${screeningId}/activities/${slug}`;

export const taskOf = (slug: StepSlug): TaskSlug => STEPS.find((s) => s.slug === slug)!.task;

/** The first step after `after` (or from the start) that has no upload yet; "analysing" when
 *  every one is done or skipped. */
export function nextStep(screening: Screening, after?: StepSlug): StepSlug | "analysing" {
  const done = new Set(screening.tasks.map((t) => t.task));
  const from = after ? STEPS.findIndex((s) => s.slug === after) + 1 : 0;
  return STEPS.slice(from).find((s) => !done.has(s.task))?.slug ?? "analysing";
}

export function uploadOf(screening: Screening, task: TaskSlug): TaskOut | undefined {
  return screening.tasks.find((t) => t.task === task);
}
