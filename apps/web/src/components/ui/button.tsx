import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "border-transparent bg-navy text-white shadow-[0_2px_6px_rgba(0,60,120,.18)] enabled:hover:bg-navy-deep",
  secondary: "border-navy bg-white text-navy enabled:hover:bg-navy-50",
  ghost: "border-transparent bg-transparent text-navy enabled:hover:bg-navy-50",
  danger: "border-transparent bg-danger text-white enabled:hover:bg-danger-hover",
};

const SIZES: Record<Size, string> = {
  sm: "min-h-10 px-4 py-1 text-[15px]",
  md: "min-h-12 px-5.5 py-1.5 text-body",
  lg: "min-h-14 px-7 py-2 text-[17px]",
};

/** Button look, also for links that act as buttons. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  block = false,
}: { variant?: Variant; size?: Size; block?: boolean } = {}): string {
  return cx(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border-[1.5px]",
    "text-center font-semibold leading-[1.35] no-underline",
    "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out",
    "enabled:active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    block && "flex w-full",
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  /** Shows a spinner and disables the button; the label stays for screen readers. */
  loading?: boolean;
};

/** Pill button (design handoff `Button`). Labels are verbs; `danger` only for destructive acts. */
export function Button({
  variant,
  size,
  block,
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(buttonClasses({ variant, size, block }), className)}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          className="size-4.5 animate-[sj-spin_.8s_linear_infinite] rounded-full border-[2.5px] border-current border-r-transparent motion-reduce:animate-none"
        />
      ) : (
        Icon && <Icon aria-hidden className="size-5" />
      )}
      {children}
      {IconRight && !loading && <IconRight aria-hidden className="size-5" />}
    </button>
  );
}
