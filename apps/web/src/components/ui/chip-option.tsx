import type { InputHTMLAttributes, Ref } from "react";

import { cx } from "@/lib/cx";

type ChipOptionProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
  label: string;
  selected: boolean;
  ref?: Ref<HTMLInputElement>;
};

/** One choice in a row of pill chips (design handoff `Chip`, selectable), on a native radio so
 *  it works with react-hook-form's `register`. */
export function ChipOption({ label, selected, ref, ...inputProps }: ChipOptionProps) {
  return (
    <label
      className={cx(
        "inline-flex min-h-11 cursor-pointer items-center rounded-pill border-[1.5px] px-4.5 font-semibold",
        "has-focus-visible:shadow-[var(--ring-focus)]",
        selected
          ? "border-navy bg-navy-50 text-navy"
          : "border-border-2 bg-white text-text-2 hover:border-n-400",
      )}
    >
      <input ref={ref} type="radio" className="sr-only" {...inputProps} />
      {label}
    </label>
  );
}
