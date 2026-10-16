import type { LucideIcon } from "lucide-react";

import { cx } from "@/lib/cx";

type ChoiceCardProps = {
  /** Radio group name; cards with the same name are one single-choice group. */
  name: string;
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  selected: boolean;
  onSelect: (value: string) => void;
};

/** Single-choice answer card (design handoff `ChoiceCard`), built on a native radio input so
 *  keyboard and screen-reader behaviour come for free. */
export function ChoiceCard({
  name,
  value,
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
}: ChoiceCardProps) {
  return (
    <label
      className={cx(
        "flex min-h-16 w-full cursor-pointer items-start gap-3.5 rounded-lg border-[1.5px] px-4.5 py-4 shadow-xs",
        "transition-[border-color,background-color,box-shadow] duration-200 ease-out active:scale-[.99]",
        "has-focus-visible:shadow-[var(--ring-focus)]",
        selected
          ? "border-navy bg-navy-50 shadow-[inset_0_0_0_1px_var(--sj-navy)]"
          : "border-border-1 bg-white hover:border-border-2 hover:bg-n-25",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onSelect(value)}
        className="sr-only"
      />
      {Icon && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-teal-50 text-teal-ink">
          <Icon aria-hidden className="size-5.5" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body font-semibold leading-[1.55] text-text-1">{label}</span>
        {description && <span className="text-small leading-[1.6] text-text-2">{description}</span>}
      </span>
      <span
        aria-hidden
        className={cx(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
          selected ? "border-navy bg-navy" : "border-n-300 bg-white",
        )}
      >
        {selected && <span className="size-2.5 rounded-full bg-white" />}
      </span>
    </label>
  );
}
