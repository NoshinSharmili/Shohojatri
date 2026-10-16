import type { HTMLAttributes } from "react";

import { cx } from "@/lib/cx";

type Tone = "default" | "calm" | "warm" | "sky" | "flat";

const TONES: Record<Tone, string> = {
  default: "border-[rgba(0,60,120,.06)] bg-surface-card shadow-sm",
  // Toned cards have no shadow (design handoff).
  calm: "border-transparent bg-teal-50",
  warm: "border-transparent bg-amber-50",
  sky: "border-transparent bg-sky-50",
  flat: "border-border-1 bg-surface-card",
};

/** Surface card (design handoff `Card`): white, 20 px radius, hairline + soft shadow. */
export function Card({
  tone = "default",
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return (
    <div className={cx("rounded-lg border p-5 text-text-1", TONES[tone], className)} {...rest} />
  );
}
