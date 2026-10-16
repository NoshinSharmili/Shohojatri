"use client";

import { ArrowLeft, Pause } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Stepper } from "@/components/ui/stepper";
import { Link } from "@/lib/i18n/navigation";

const STEPS = ["details", "consent", "questions", "games"] as const;
export type FlowStep = (typeof STEPS)[number];

type FlowPageProps = {
  back?: { href: string; label: string };
  /** The screening step this page belongs to, shown as the segmented stepper. */
  step?: FlowStep;
  /** Replaces the stepper and the top links (the questions show their own header). */
  progress?: ReactNode;
  title?: string;
  subtitle?: string;
  /** Sticky at the bottom of the screen on phones: the page's main action. */
  footer?: ReactNode;
  children: ReactNode;
};

/** Frame for every screening page: back + "continue later", progress, title, sticky action.
 *  Progress is saved as the parent goes, so leaving is always safe. */
export function FlowPage({
  back,
  step,
  progress,
  title,
  subtitle,
  footer,
  children,
}: FlowPageProps) {
  const t = useTranslations("screening");
  const linkClass =
    "inline-flex min-h-12 items-center gap-2 rounded-sm font-semibold text-text-link hover:underline";

  return (
    <div className="mx-auto flex w-full max-w-(--reading-max) flex-1 flex-col">
      {/* A custom progress header brings its own back and pause controls. */}
      {!progress && (
        <div className="flex items-center justify-between gap-3">
          {back ? (
            <Link href={back.href} className={linkClass}>
              <ArrowLeft aria-hidden className="size-5" />
              {back.label}
            </Link>
          ) : (
            <span />
          )}
          <Link href="/home" className={`${linkClass} text-text-2`}>
            <Pause aria-hidden className="size-4.5" />
            {t("later")}
          </Link>
        </div>
      )}
      <div className="mt-2 mb-5">
        {progress ??
          (step && (
            <Stepper
              steps={STEPS.map((s) => t(`steps.${s}`))}
              current={STEPS.indexOf(step)}
              countLabel={t("stepCount", { n: STEPS.indexOf(step) + 1, total: STEPS.length })}
            />
          ))}
      </div>

      {title && (
        <h1 className="m-0 font-display text-h1 font-bold text-pretty text-text-1">{title}</h1>
      )}
      {subtitle && <p className="mt-1.5 mb-0 text-body text-pretty text-text-2">{subtitle}</p>}
      <div className="mt-5 flex flex-col gap-5">{children}</div>

      {footer && (
        <div className="sticky bottom-0 z-10 -mx-5 mt-auto flex flex-col gap-2 bg-linear-to-b from-surface-page/0 to-surface-page to-[length:1.5rem] px-5 pt-6 pb-4 md:mx-0 md:px-0">
          {footer}
        </div>
      )}
    </div>
  );
}
