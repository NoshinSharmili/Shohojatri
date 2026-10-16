import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cx } from "@/lib/cx";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  icon: LucideIcon;
  /** Required: the button has no visible text. */
  label: string;
  variant?: "ghost" | "soft";
};

/** Icon-only button with a 48 px hit area (design handoff `IconButton`). */
export function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full text-navy",
        "transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45",
        variant === "ghost"
          ? "bg-transparent enabled:hover:bg-navy-50"
          : "bg-navy-50 enabled:hover:bg-navy-100",
        className,
      )}
      {...rest}
    >
      <Icon aria-hidden className="size-5.5" />
    </button>
  );
}
