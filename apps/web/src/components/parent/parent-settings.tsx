"use client";

import { FlaskConical } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { ChoiceCard } from "@/components/ui/choice-card";
import { Switch } from "@/components/ui/switch";
import { DEMO_PROFILES, setDemoMode, useDemoMode } from "@/lib/screening/demo";

/** `/settings` (parent): for now, demo screening mode (SCREENING_SPEC §9, CLAUDE.md §10). */
export function ParentSettings() {
  const t = useTranslations("settings");
  const tProfiles = useTranslations("demo.profiles");
  const demo = useDemoMode();

  return (
    <div className="mx-auto flex w-full max-w-(--reading-max) flex-col gap-5">
      <h1 className="m-0 font-display text-h1 font-bold text-text-1">{t("title")}</h1>
      <Card className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-amber-50 text-amber-ink">
            <FlaskConical aria-hidden className="size-5.5" />
          </span>
          <div className="flex flex-1 flex-col gap-1">
            <h2 className="m-0 font-display text-h3 font-bold">{t("demo.title")}</h2>
            <p className="m-0 text-[15px] leading-[1.6] text-text-2">{t("demo.body")}</p>
          </div>
          <Switch
            checked={demo.enabled}
            onChange={(enabled) => setDemoMode({ enabled })}
            label={t("demo.toggle")}
          />
        </div>
        {demo.enabled && (
          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2 p-0 font-semibold">{t("demo.profile")}</legend>
            {DEMO_PROFILES.map((profile) => (
              <ChoiceCard
                key={profile}
                name="demo-profile"
                value={profile}
                label={capitalise(tProfiles(profile))}
                selected={demo.profile === profile}
                onSelect={() => setDemoMode({ profile })}
              />
            ))}
          </fieldset>
        )}
      </Card>
    </div>
  );
}

// The profile names also sit mid-sentence on the Part 2 intro, so they're stored lower-case.
const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
