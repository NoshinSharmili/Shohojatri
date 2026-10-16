"use client";

import { CircleHelp, type LucideIcon, SkipForward, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { cx } from "@/lib/cx";

type StageProps = {
  /** `sky`: the child-facing scene with hills; `dark`: a full-screen camera view. */
  tone?: "sky" | "dark";
  /** Left of the top bar (trial dots, a parent pill); the stop button is on the right. */
  top?: ReactNode;
  onStop: () => void;
  /** Parent controls at the bottom. */
  controls?: ReactNode;
  /** Behind everything (a camera feed). */
  background?: ReactNode;
  children: ReactNode;
};

/** Full-screen frame for a running game (design `Stage`). It covers the app header so the
 *  child sees only the game; the parent's controls stay small at the edges. */
export function Stage({ tone = "sky", top, onStop, controls, background, children }: StageProps) {
  const t = useTranslations("activities.stage");
  const dark = tone === "dark";
  return (
    <div
      className={cx(
        "fixed inset-0 z-50 flex flex-col overflow-hidden",
        dark ? "bg-n-900 text-white" : "bg-linear-to-b from-sky-50 to-[#F4FBF6] text-text-1",
      )}
    >
      {background}
      {/* Scrims keep the controls readable over a bright camera picture. */}
      {dark && background && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-28 bg-linear-to-b from-n-900/75 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-36 bg-linear-to-t from-n-900/75 to-transparent"
          />
        </>
      )}
      {!dark && <Hills />}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            role="img"
            aria-label={t("cameraOn")}
            className="inline-block size-3 shrink-0 rounded-full bg-leaf shadow-[0_0_0_4px_rgba(71,172,141,.25)]"
          />
          {top}
        </div>
        <button
          type="button"
          onClick={onStop}
          aria-label={t("stop")}
          title={t("stop")}
          className={cx(
            "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0",
            dark ? "bg-white/15 text-white" : "bg-white/70 text-n-600",
          )}
        >
          <X aria-hidden className="size-5" />
        </button>
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      {controls && (
        <div className="relative z-10 flex gap-2.5 px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
          {controls}
        </div>
      )}
    </div>
  );
}

function Hills() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-64">
      <i className="absolute -bottom-28 -left-[30%] h-60 w-[120%] rounded-[50%] bg-teal-100" />
      <i className="absolute -right-[35%] -bottom-32 h-56 w-[120%] rounded-[50%] bg-sprout opacity-55" />
    </div>
  );
}

/** A parent control on the stage (design `sf-darkbtn` on dark, a soft pill on the scene). */
export function StageButton({
  icon: Icon,
  dark,
  onClick,
  children,
}: {
  icon: LucideIcon;
  dark?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-pill px-3 font-semibold",
        dark
          ? "border border-white/30 bg-white/12 text-white"
          : "border border-navy-100 bg-white/80 text-navy",
      )}
    >
      <Icon aria-hidden className="size-4.5 shrink-0" />
      {children}
    </button>
  );
}

/** Skip + "Something went wrong", the two controls every running game has. */
export function ParentControls({
  dark,
  onSkip,
  onWrong,
}: {
  dark?: boolean;
  onSkip: () => void;
  onWrong: () => void;
}) {
  const t = useTranslations("activities.stage");
  return (
    <>
      <StageButton icon={SkipForward} dark={dark} onClick={onSkip}>
        {t("skip")}
      </StageButton>
      <StageButton icon={CircleHelp} dark={dark} onClick={onWrong}>
        {t("wrong")}
      </StageButton>
    </>
  );
}

/** "Try 2 of 3" with dots (design `TrialDots`). */
export function TrialDots({
  current,
  total,
  label,
  dark,
}: {
  current: number;
  total: number;
  label: string;
  dark?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex items-center gap-2 text-[15px] font-semibold",
        dark ? "text-white" : "text-navy",
      )}
    >
      <span className="whitespace-nowrap">{label}</span>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={cx(
            "size-3 rounded-full border-2",
            i + 1 < current && (dark ? "border-white bg-white" : "border-navy bg-navy"),
            i + 1 === current && "border-amber bg-amber",
            i + 1 > current && (dark ? "border-white/60" : "border-navy/40"),
          )}
        />
      ))}
    </div>
  );
}

/** A short message to the parent over the scene (design `ParentPill`). */
export function ParentPill({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 rounded-pill bg-white/85 px-3.5 py-2 text-small font-semibold text-n-700">
      <Icon aria-hidden className="size-4 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
}

/** A brief notice after "Something went wrong" ("That try won't count"). */
export function StageToast({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="pointer-events-none absolute inset-x-4 top-20 z-20 mx-auto max-w-sm animate-[sj-rise_.2s_var(--ease-out)] rounded-md bg-n-900/85 px-4 py-3 text-center font-semibold text-white"
    >
      {children}
    </div>
  );
}
