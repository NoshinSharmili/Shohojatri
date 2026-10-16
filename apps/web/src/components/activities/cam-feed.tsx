"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef } from "react";

import { boxCentre } from "@/lib/cv/features";
import type { CaptureSession } from "@/lib/cv/capture";
import { cx } from "@/lib/cx";

import { useSample, useStreamVersion } from "./capture-provider";

type CamFeedProps = {
  session: CaptureSession;
  /** `cover` fills the box (full-screen views); `fit` keeps the whole picture, so face boxes
   *  line up with the faces. */
  fit?: "cover" | "fit";
  /** Draw a box on each face; with `onPickChild`, the boxes become buttons. */
  showFaces?: boolean;
  onPickChild?: () => void;
  className?: string;
  children?: ReactNode;
};

/** The live camera picture (design `CamFeed`). Only shown on this device: it is the same
 *  in-memory stream the features come from, never recorded. */
export function CamFeed({
  session,
  fit = "cover",
  showFaces = false,
  onPickChild,
  className,
  children,
}: CamFeedProps) {
  const t = useTranslations("activities.setup");
  const video = useRef<HTMLVideoElement>(null);
  const version = useStreamVersion(session);
  const sample = useSample(showFaces ? session : null, 8);
  const mirrored = session.mirrored;

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.srcObject = session.mediaStream;
    void element.play().catch(() => undefined);
  }, [session, version]);

  // Read on every render: the size is known once the first frame arrives.
  const { width, height } = session.size;
  const faces = sample?.faces ?? [];
  const picture = (
    <>
      <video
        ref={video}
        muted
        playsInline
        aria-hidden
        className={cx(
          "absolute inset-0 size-full",
          fit === "cover" ? "object-cover" : "object-contain",
          mirrored && "-scale-x-100",
        )}
      />
      {showFaces &&
        faces.map((box, i) => {
          // Boxes come in un-mirrored coordinates; the preview may be mirrored.
          const left = mirrored ? 1 - box.x - box.w : box.x;
          const style = {
            left: `${left * 100}%`,
            top: `${box.y * 100}%`,
            width: `${box.w * 100}%`,
            height: `${box.h * 100}%`,
          };
          const isChild = i === sample?.child;
          const ring = cx(
            "absolute rounded-md border-[3px]",
            isChild ? "border-sprout" : "border-white/70 border-dashed",
          );
          return onPickChild && faces.length > 1 ? (
            <button
              key={i}
              type="button"
              style={style}
              className={cx(ring, "cursor-pointer bg-transparent")}
              aria-label={t("thisIsMyChild")}
              onClick={() => {
                session.confirmChild(boxCentre(box));
                onPickChild();
              }}
            />
          ) : (
            <span key={i} aria-hidden style={style} className={ring} />
          );
        })}
    </>
  );

  return (
    // Positioning comes from the caller ("relative h-44", or "absolute inset-0" as a backdrop).
    <div className={cx("overflow-hidden bg-n-800", className)}>
      {fit === "fit" && width && height ? (
        // A box with the picture's own shape (at most 46% of the screen's height), so overlay
        // percentages match the picture.
        <div
          className="relative mx-auto"
          style={{
            aspectRatio: `${width} / ${height}`,
            width: `min(100%, calc(46dvh * ${width / height}))`,
          }}
        >
          {picture}
        </div>
      ) : (
        picture
      )}
      {children}
    </div>
  );
}

/** "Live · only on this phone" (design `sf-live`). */
export function LivePill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-pill bg-n-900/60 px-3 py-1.5 text-small font-semibold whitespace-nowrap text-white",
        className,
      )}
    >
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-sprout" />
      {children}
    </span>
  );
}
