import { CircleAlert, type LucideIcon } from "lucide-react";
import { type InputHTMLAttributes, type Ref, useId } from "react";

import { cx } from "@/lib/cx";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  /** Shown after the label, e.g. "(optional)". */
  optionalLabel?: string;
  icon?: LucideIcon;
  ref?: Ref<HTMLInputElement>;
};

/** Labelled input with hint and error (design handoff `TextField`). Works with RHF `register`. */
export function TextField({
  label,
  hint,
  error,
  optionalLabel,
  icon: Icon,
  className,
  ref,
  ...inputProps
}: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = cx(hint && hintId, error && errorId) || undefined;

  return (
    <div className={cx("flex min-w-0 flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="flex items-baseline gap-1.5 text-[15px] font-semibold text-text-1"
      >
        {label}
        {optionalLabel && (
          <span className="text-small font-normal text-text-3">{optionalLabel}</span>
        )}
      </label>
      <div
        className={cx(
          "flex min-h-13 items-center gap-2.5 rounded-md border-[1.5px] bg-white px-4 text-text-3",
          "transition-[border-color,box-shadow] duration-200 ease-out",
          "focus-within:border-blue focus-within:shadow-[0_0_0_4px_rgba(21,134,188,.16)]",
          error ? "border-danger" : "border-border-2 hover:border-n-400",
        )}
      >
        {Icon && <Icon aria-hidden className="size-5 shrink-0" />}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 border-0 bg-transparent py-3 text-body leading-[1.6] text-text-1 outline-none placeholder:text-n-400 focus-visible:shadow-none"
          {...inputProps}
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="m-0 text-small text-text-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="m-0 flex items-center gap-1.5 text-small text-danger">
          <CircleAlert aria-hidden className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
