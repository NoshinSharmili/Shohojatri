import { cx } from "@/lib/cx";

const TONES = [
  "bg-teal-50 text-teal-ink",
  "bg-sky-50 text-blue-ink",
  "bg-amber-50 text-amber-ink",
  "bg-sprout-50 text-leaf-ink",
  "bg-navy-50 text-navy",
];

/** Round initial (design handoff `Avatar`). Photos come later; the tone is stable per name. */
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initial = Array.from(name.trim())[0] ?? "?";
  const tone = TONES[Array.from(name).reduce((sum, char) => sum + char.codePointAt(0)!, 0) % 5];
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold",
        tone,
      )}
    >
      {initial.toLocaleUpperCase()}
    </span>
  );
}
