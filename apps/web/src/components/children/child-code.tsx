import { cx } from "@/lib/cx";

/** A Child ID as text: Latin letters in every locale, never translated or auto-linked. */
export function ChildCode({ code, className }: { code: string; className?: string }) {
  return (
    <span
      lang="en"
      translate="no"
      className={cx(
        "inline-flex items-center rounded-pill bg-navy-50 px-2.5 py-0.5 font-display text-[14px] font-bold tracking-[.04em] whitespace-nowrap text-navy",
        className,
      )}
    >
      {code}
    </span>
  );
}
