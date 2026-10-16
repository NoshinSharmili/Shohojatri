"use client";

import { ArrowRight, Check, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { FlowPage } from "@/components/screening/flow-page";
import { Button } from "@/components/ui/button";
import { ChipOption } from "@/components/ui/chip-option";
import { activityPath, nextStep } from "@/lib/activities/tasks";
import { backgroundDb, type CaptureSession } from "@/lib/cv/capture";
import { cx } from "@/lib/cx";
import { useRouter } from "@/lib/i18n/navigation";
import type { Screening } from "@/lib/screening/rules";

import { CamFeed, LivePill } from "./cam-feed";
import { useCapture, useSample } from "./capture-provider";

// SCREENING_SPEC §4.2.
const MIN_LUMA = 60;
const MIN_IOD = 0.035;
const MAX_NOISE_DB = -35;

type Check = { key: "devices" | "light" | "face" | "noise"; ok: boolean | null; tip?: string };

/** Setup check (design Screening Flow 06): light, the child's face and distance, background
 *  noise, and which device this is. Checks update live; the parent may carry on regardless. */
export function SetupStep({ screening }: { screening: Screening }) {
  const t = useTranslations("activities.setup");
  const router = useRouter();
  const { session, deviceType, setDeviceType, switchCamera } = useCapture();
  const sample = useSample(session, 4);
  const [, setPicked] = useState(0);
  // Only rendered once the camera is on (never on the server), so reading the URL here is safe.
  const [debug] = useState(() => new URLSearchParams(window.location.search).has("cvdebug"));
  const name = screening.child_name;

  // The check runs on the front camera, the one calibration uses next.
  useEffect(() => {
    void switchCamera("front");
  }, [switchCamera]);

  if (!session) return null;
  const features = sample?.features;
  const faces = sample?.faces.length ?? 0;
  const noise = backgroundDb(session.meter);
  const luma = sample?.luma ?? null;

  const checks: Check[] = [
    { key: "devices", ok: true },
    {
      key: "light",
      ok: luma === null ? null : luma >= MIN_LUMA,
      tip: t("tips.light"),
    },
    {
      key: "face",
      ok: features ? !!features.face && (features.iod ?? 0) >= MIN_IOD : null,
      tip: features?.face ? t("tips.closer") : t("tips.noFace", { name }),
    },
    { key: "noise", ok: noise === null ? null : noise < MAX_NOISE_DB, tip: t("tips.noise") },
  ];
  const twoFaces = faces > 1 && !session.childConfirmed;
  const allOk = checks.every((c) => c.ok) && !twoFaces;

  return (
    <FlowPage
      back={{ href: `/screening/${screening.id}/activities`, label: t("back") }}
      title={t("title")}
      subtitle={t("subtitle", { name })}
      footer={
        <>
          <Button
            size="lg"
            block
            variant={allOk ? "primary" : "secondary"}
            iconRight={ArrowRight}
            onClick={() => router.push(activityPath(screening.id, nextStep(screening)))}
          >
            {allOk ? t("start") : t("continueAnyway")}
          </Button>
        </>
      }
    >
      <CamFeed
        session={session}
        fit="fit"
        showFaces
        onPickChild={() => setPicked((n) => n + 1)}
        className="relative rounded-lg"
      >
        <LivePill className="absolute bottom-3 left-3">{t("live")}</LivePill>
      </CamFeed>

      {twoFaces && (
        <p
          role="status"
          className="m-0 rounded-md bg-amber-50 px-4 py-3 font-semibold text-amber-ink"
        >
          {t("twoFaces", { name })}
        </p>
      )}

      <ul className="m-0 flex list-none flex-col gap-2.5 p-0" aria-live="polite">
        {checks.map((check) => (
          <li
            key={check.key}
            className="flex items-start gap-3 rounded-md border border-[rgba(0,60,120,.06)] bg-white px-3.5 py-3 shadow-xs"
          >
            <span
              aria-hidden
              className={cx(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                check.ok === null
                  ? "bg-n-100 text-text-3"
                  : check.ok
                    ? "bg-leaf-50 text-leaf-ink"
                    : "bg-amber-50 text-amber-ink",
              )}
            >
              {check.ok ? <Check className="size-4" /> : <Volume2 className="size-4" />}
            </span>
            <div className="flex flex-col leading-normal">
              <span className="font-semibold">
                {t(
                  `checks.${check.key}.${check.ok === null ? "waiting" : check.ok ? "ok" : "fix"}`,
                  {
                    name,
                  },
                )}
              </span>
              {check.ok === false && check.tip && (
                <span className="text-[15px] text-amber-ink">{check.tip}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 p-0 font-semibold">{t("deviceQuestion")}</legend>
        <div className="flex flex-wrap gap-2">
          {(["phone", "laptop"] as const).map((type) => (
            <ChipOption
              key={type}
              name="device-type"
              value={type}
              label={t(`device.${type}`)}
              selected={deviceType === type}
              onChange={() => setDeviceType(type)}
            />
          ))}
        </div>
        <p className="m-0 text-small text-text-2">{t(`deviceHint.${deviceType}`)}</p>
      </fieldset>

      {debug && <DebugReadout session={session} />}
    </FlowPage>
  );
}

/** `?cvdebug=1`: the raw numbers, for checking sign conventions (lib/cv/README.md). */
function DebugReadout({ session }: { session: CaptureSession }) {
  const sample = useSample(session, 8);
  const f = sample?.features;
  const rows: [string, unknown][] = [
    ["face", f?.face],
    ["yaw", f?.yaw],
    ["pitch", f?.pitch],
    ["nose_dx", f?.nose_dx],
    ["iris_x", f?.iris_x],
    ["iod", f?.iod],
    ["eye_open", f?.eye_open],
    ["rms_db", f?.rms_db],
    ["luma", sample?.luma],
    ["camera", session.camera],
    ["delegate", session.delegate],
    ["size", `${session.size.width}×${session.size.height}`],
  ];
  return (
    <pre
      lang="en"
      className="m-0 overflow-x-auto rounded-md bg-n-900 p-3 text-[13px] leading-normal text-white"
    >
      {rows.map(([k, v]) => `${k.padEnd(9)} ${String(v ?? "–")}`).join("\n")}
    </pre>
  );
}
