import { cx } from "@/lib/cx";

/** Design handoff `Character` poses, plus pointing to either side for "Look where I point". */
export type Pose = "idle" | "wave" | "point-left" | "point-right" | "clap" | "up" | "head" | "turn";

// Arm angles in degrees (screen left arm, screen right arm). An arm hangs down from its
// shoulder; positive angles swing the hand toward screen left.
const ARMS: Record<Pose, [number, number]> = {
  idle: [14, -14],
  wave: [14, -135],
  "point-left": [100, -14],
  "point-right": [14, -100],
  clap: [-40, 40],
  up: [160, -160],
  head: [150, -150],
  turn: [55, -55],
};
// Poses whose arms move on their own (keyframes in globals.css).
const MOVING: Partial<Record<Pose, [string?, string?]>> = {
  wave: [undefined, "sj-arm-wave"],
  clap: ["sj-arm-clap-l", "sj-arm-clap-r"],
};

type CharacterProps = {
  pose?: Pose;
  /** Where the eyes and head turn: -1 screen left … 1 screen right. */
  look?: number;
  /** Body colours: the friendly guide, or one of the children in Look & watch. */
  palette?: "guide" | "amber" | "leaf";
  className?: string;
};

const PALETTES = {
  guide: { body: ["var(--sj-blue)", "var(--sj-teal)"], head: ["var(--sj-mint)", "var(--sj-teal)"] },
  amber: { body: ["#E8833A", "var(--sj-amber)"], head: ["#FBD9A0", "#F3B868"] },
  leaf: { body: ["var(--sj-leaf)", "var(--sj-sprout)"], head: ["#F6D2B0", "#E5AF85"] },
} as const;

/** The friendly on-screen guide (SVG): looks at the child, points, claps, waves. */
export function Character({
  pose = "idle",
  look = 0,
  palette = "guide",
  className,
}: CharacterProps) {
  const colours = PALETTES[palette];
  const id = `sj-ch-${palette}`;
  const moving = MOVING[pose] ?? [];
  return (
    <svg viewBox="0 0 130 200" aria-hidden className={cx("overflow-visible", className)}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={colours.body[0]} />
          <stop offset="1" stopColor={colours.body[1]} />
        </linearGradient>
        <radialGradient id={`${id}-head`} cx=".35" cy=".3" r=".75">
          <stop offset="0" stopColor={colours.head[0]} />
          <stop offset="1" stopColor={colours.head[1]} />
        </radialGradient>
      </defs>
      <g className="sj-bob">
        <rect x="15" y="88" width="100" height="112" rx="44" fill={`url(#${id}-body)`} />
        {([0, 1] as const).map((side) => (
          <g key={side} transform={`translate(${side ? 109 : 21} 104)`}>
            <g
              className={cx("sj-arm", moving[side])}
              style={{ transform: `rotate(${ARMS[pose][side]}deg)` }}
            >
              <rect x="-11" y="-8" width="22" height="70" rx="11" fill={colours.body[0]} />
              <circle cx="0" cy="64" r="13" fill="var(--sj-amber-100)" />
            </g>
          </g>
        ))}
        <g className="sj-head" style={{ transform: `rotate(${look * 8}deg)` }}>
          <circle cx="65" cy="42" r="40" fill={`url(#${id}-head)`} />
          <g className="sj-eyes" style={{ transform: `translateX(${look * 7}px)` }}>
            <ellipse cx="51" cy="38" rx="5" ry="6.5" fill="var(--sj-navy-deep)" />
            <ellipse cx="79" cy="38" rx="5" ry="6.5" fill="var(--sj-navy-deep)" />
          </g>
          <ellipse cx="43" cy="54" rx="6" ry="3.5" fill="var(--sj-amber)" opacity=".55" />
          <ellipse cx="87" cy="54" rx="6" ry="3.5" fill="var(--sj-amber)" opacity=".55" />
          <path
            d="M55 54 Q65 64 75 54"
            fill="none"
            stroke="var(--sj-navy-deep)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}

export function Ball({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" aria-hidden className={className}>
      <circle cx="40" cy="40" r="36" fill="var(--sj-amber)" />
      <path d="M40 4 A36 36 0 0 1 76 40 L40 40 Z" fill="var(--sj-teal)" />
      <path d="M40 76 A36 36 0 0 1 4 40 L40 40 Z" fill="var(--sj-teal)" />
      <circle cx="28" cy="25" r="6" fill="#fff" opacity=".7" />
    </svg>
  );
}

export function Boat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 96" aria-hidden className={className}>
      <rect x="46" y="4" width="5" height="62" rx="2.5" fill="var(--sj-n-700)" />
      <path d="M53 10 L95 58 L53 58 Z" fill="var(--sj-amber)" />
      <path d="M0 64 H100 L88 92 Q50 100 12 92 Z" fill="var(--sj-navy)" />
    </svg>
  );
}
