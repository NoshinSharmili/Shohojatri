import type { ReactNode } from "react";

type Level = "low" | "moderate" | "elevated" | "high";

const LEVELS: readonly Level[] = ["low", "moderate", "elevated", "high"];
const COLOURS: Record<Level, string> = {
  low: "var(--sj-risk-low)",
  moderate: "var(--sj-risk-moderate)",
  elevated: "var(--sj-risk-elevated)",
  high: "var(--sj-risk-high)",
};
const CX = 110;
const CY = 112;
const R = 88;
const GAP = 0.014;

/** Point at fraction `t` of the half circle, left (0) to right (1). */
function point(t: number): [number, number] {
  return [CX - R * Math.cos(Math.PI * t), CY - R * Math.sin(Math.PI * t)];
}

function arc(a: number, b: number): string {
  const [x1, y1] = point(a);
  const [x2, y2] = point(b);
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

type ScoreGaugeProps = {
  value: number;
  max?: number;
  /** Upper limits of low, moderate and elevated (from the scoring config). */
  thresholds: readonly [number, number, number];
  level: Level;
  /** The value as shown, already formatted for the locale. */
  valueText: string;
  maxLabel: string;
  ariaLabel: string;
  width?: number;
  /** Shown under the dial; the design always pairs the gauge with a `RiskBadge`. */
  badge: ReactNode;
  caption?: string;
};

/** Half-circle gauge with the four class zones (design handoff `ScoreGauge`). */
export function ScoreGauge({
  value,
  max = 100,
  thresholds,
  level,
  valueText,
  maxLabel,
  ariaLabel,
  width = 240,
  badge,
  caption,
}: ScoreGaugeProps) {
  const stops = [0, ...thresholds.map((limit) => limit / max), 1];
  const [mx, my] = point(Math.max(0, Math.min(1, value / max)));
  return (
    <div className="flex flex-col items-center gap-2.5" style={{ maxWidth: width }}>
      <svg
        viewBox="0 0 220 128"
        width={width}
        className="h-auto max-w-full print:[print-color-adjust:exact]"
        role="img"
        aria-label={ariaLabel}
      >
        {LEVELS.map((zone, i) => (
          <path
            key={zone}
            d={arc(stops[i] + (i ? GAP : 0), stops[i + 1] - (i < 3 ? GAP : 0))}
            fill="none"
            stroke={COLOURS[zone]}
            strokeWidth={18}
            opacity={zone === level ? 1 : 0.28}
          />
        ))}
        <circle cx={mx} cy={my} r={13} fill="#fff" stroke="var(--sj-navy)" strokeWidth={4} />
        <text
          x={CX}
          y={CY - 14}
          textAnchor="middle"
          className="fill-navy font-display text-[44px] font-bold"
        >
          {valueText}
        </text>
        <text x={CX} y={CY + 8} textAnchor="middle" className="fill-text-3 text-[14px] font-medium">
          {maxLabel}
        </text>
      </svg>
      {badge}
      {caption && (
        <p className="m-0 text-center text-[15px] leading-[1.65] text-text-2">{caption}</p>
      )}
    </div>
  );
}
