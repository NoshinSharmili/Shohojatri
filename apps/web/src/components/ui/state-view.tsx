import { CloudOff, Sprout, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cx } from "@/lib/cx";

type Kind = "loading" | "empty" | "error";

const ART: Record<Exclude<Kind, "loading">, { icon: LucideIcon; className: string }> = {
  empty: { icon: Sprout, className: "bg-sprout-50 text-leaf-ink" },
  error: { icon: CloudOff, className: "bg-amber-50 text-amber-ink" },
};

/** Empty / loading / error placeholder (design handoff `StateView`). */
export function StateView({
  kind,
  title,
  message,
  action,
}: {
  kind: Kind;
  title?: string;
  message?: string;
  action?: ReactNode;
}) {
  if (kind === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-3 px-5 py-8 text-center"
      >
        <span aria-hidden className="flex gap-2 pt-6 pb-2">
          {["bg-blue", "bg-teal [animation-delay:.2s]", "bg-sprout [animation-delay:.4s]"].map(
            (c) => (
              <i
                key={c}
                className={cx(
                  "size-3 rounded-full animate-[sj-breathe_1.4s_var(--ease-in-out)_infinite] motion-reduce:animate-none",
                  c,
                )}
              />
            ),
          )}
        </span>
        {title && <p className="m-0 font-display text-[18px] font-bold text-text-1">{title}</p>}
        {message && <p className="m-0 max-w-[36ch] text-body text-text-2">{message}</p>}
      </div>
    );
  }

  const { icon: Icon, className } = ART[kind];
  return (
    <div
      role={kind === "error" ? "alert" : undefined}
      className="flex flex-col items-center gap-3 px-5 py-8 text-center"
    >
      <span className={cx("mb-1 flex size-26 items-center justify-center rounded-full", className)}>
        <Icon aria-hidden className="size-11" />
      </span>
      {title && <p className="m-0 font-display text-[20px] font-bold text-text-1">{title}</p>}
      {message && <p className="m-0 max-w-[36ch] text-body text-text-2">{message}</p>}
      {action}
    </div>
  );
}
