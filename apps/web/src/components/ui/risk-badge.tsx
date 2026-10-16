import { Compass, Eye, HandHeart, Sprout, type LucideIcon } from "lucide-react";

import { cx } from "@/lib/cx";

type Level = "low" | "moderate" | "elevated" | "high";

const LEVELS: Record<Level, { icon: LucideIcon; bars: number; className: string }> = {
  low: { icon: Sprout, bars: 1, className: "bg-risk-low-bg text-risk-low-ink" },
  moderate: { icon: Eye, bars: 2, className: "bg-risk-moderate-bg text-risk-moderate-ink" },
  elevated: { icon: Compass, bars: 3, className: "bg-risk-elevated-bg text-risk-elevated-ink" },
  high: { icon: HandHeart, bars: 4, className: "bg-risk-high-bg text-risk-high-ink" },
};

/** The only way a risk class is shown (design handoff `RiskBadge`): tint + icon + label + bars,
 *  so it never relies on colour alone. */
export function RiskBadge({
  level,
  label,
  size = "md",
  showBars = true,
}: {
  level: Level;
  label: string;
  size?: "md" | "lg";
  showBars?: boolean;
}) {
  const { icon: Icon, bars, className } = LEVELS[level];
  const lg = size === "lg";
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-pill font-semibold whitespace-nowrap print:[print-color-adjust:exact]",
        lg ? "h-11 pr-4.5 pl-3.5 text-[17px]" : "h-8.5 pr-3.5 pl-2.5 text-[15px]",
        className,
      )}
    >
      <Icon aria-hidden className={lg ? "size-5.5" : "size-4.5"} strokeWidth={2.25} />
      {label}
      {showBars && (
        <span aria-hidden className="ml-0.5 inline-flex items-end gap-0.5">
          {[1, 2, 3, 4].map((i) => (
            <i
              key={i}
              className={cx("w-1 rounded-xs bg-current", i > bars && "opacity-20")}
              style={{ height: (lg ? 6 : 5) + i * (lg ? 3 : 2.5) }}
            />
          ))}
        </span>
      )}
    </span>
  );
}
