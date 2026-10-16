import type { LucideIcon } from "lucide-react";

import { cx } from "@/lib/cx";

const TONES = {
  sky: "bg-sky-50 text-navy",
  calm: "bg-teal-50 text-teal-ink",
  leaf: "bg-leaf-50 text-leaf-ink",
  warm: "bg-amber-50 text-amber-ink",
} as const;

/** Rounded icon tile from the screening designs; stands in where illustrations will go. */
export function IconTile({
  icon: Icon,
  tone = "sky",
  size = "md",
}: {
  icon: LucideIcon;
  tone?: keyof typeof TONES;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      aria-hidden
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-[14px]",
        TONES[tone],
        { sm: "size-10", md: "size-11", lg: "size-13" }[size],
      )}
    >
      <Icon className={{ sm: "size-5", md: "size-5", lg: "size-6" }[size]} />
    </span>
  );
}
