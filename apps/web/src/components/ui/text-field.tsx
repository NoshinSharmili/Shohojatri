import { CircleAlert, type LucideIcon } from "lucide-react";
import {
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  useId,
} from "react";

import { cx } from "@/lib/cx";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  /** Shown after the label, e.g. "(optional)". */
  optionalLabel?: string;
  className?: string;
};

type TextFieldProps = FieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & {
    icon?: LucideIcon;
    ref?: Ref<HTMLInputElement>;
  };

type TextAreaFieldProps = FieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className"> & {
    ref?: Ref<HTMLTextAreaElement>;
  };

const BOX = [
  "flex gap-2.5 rounded-md border-[1.5px] bg-white px-4 text-text-3",
  "transition-[border-color,box-shadow] duration-200 ease-out",
  "focus-within:border-blue focus-within:shadow-[0_0_0_4px_rgba(21,134,188,.16)]",
].join(" ");
const CONTROL =
  "min-w-0 flex-1 border-0 bg-transparent py-3 text-body leading-[1.6] text-text-1 outline-none placeholder:text-n-400 focus-visible:shadow-none";

/** Label, hint and error around a control, wired up for screen readers. */
function Field({
  label,
  hint,
  error,
  optionalLabel,
  className,
  children,
}: FieldProps & { children: (ids: { id: string; describedBy?: string }) => ReactNode }) {
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
      {children({ id, describedBy })}
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
  return (
    <Field {...{ label, hint, error, optionalLabel, className }}>
      {({ id, describedBy }) => (
        <div
          className={cx(
            BOX,
            "min-h-13 items-center",
            error ? "border-danger" : "border-border-2 hover:border-n-400",
          )}
        >
          {Icon && <Icon aria-hidden className="size-5 shrink-0" />}
          <input
            ref={ref}
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={CONTROL}
            {...inputProps}
          />
        </div>
      )}
    </Field>
  );
}

/** The handoff's `TextField multiline`: same frame, a growing textarea inside. */
export function TextAreaField({
  label,
  hint,
  error,
  optionalLabel,
  className,
  ref,
  rows = 3,
  ...textareaProps
}: TextAreaFieldProps) {
  return (
    <Field {...{ label, hint, error, optionalLabel, className }}>
      {({ id, describedBy }) => (
        <div className={cx(BOX, error ? "border-danger" : "border-border-2 hover:border-n-400")}>
          <textarea
            ref={ref}
            id={id}
            rows={rows}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cx(CONTROL, "resize-y")}
            {...textareaProps}
          />
        </div>
      )}
    </Field>
  );
}
