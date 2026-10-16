"use client";

import { ArrowRight, Compass, Smartphone, Trash2, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { QueryView } from "@/components/app/query-view";
import { FormAlert } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/ui/choice-card";
import { useErrorMessage } from "@/lib/api/error-message";
import { useRouter } from "@/lib/i18n/navigation";
import { useAcceptConsent, useScreening } from "@/lib/screening/queries";
import { resumePath, type Screening } from "@/lib/screening/rules";

import { FlowPage } from "./flow-page";
import { IconTile } from "./icon-tile";

// SCREENING_SPEC §2. Changing any of this text means a new CONSENT_VERSION (lib/screening/rules).
const POINTS = [
  { key: "notDiagnosis", icon: Compass, tone: "calm" },
  { key: "onDevice", icon: Smartphone, tone: "sky" },
  { key: "delete", icon: Trash2, tone: "warm" },
  { key: "sharing", icon: Users, tone: "leaf" },
] as const;

/** Step 2: the four consent points. Stored with the text version and time. */
export function ConsentStep({ screeningId }: { screeningId: number }) {
  const screening = useScreening(screeningId);
  return <QueryView query={screening}>{(data) => <ConsentForm screening={data} />}</QueryView>;
}

function ConsentForm({ screening }: { screening: Screening }) {
  const t = useTranslations("screening.consent");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const accept = useAcceptConsent(screening.id);
  const [agreed, setAgreed] = useState(screening.consent_at !== null);

  return (
    <FlowPage
      back={{ href: "/home", label: t("home") }}
      step="consent"
      title={t("title")}
      footer={
        <Button
          size="lg"
          block
          iconRight={ArrowRight}
          disabled={!agreed}
          loading={accept.isPending}
          onClick={() =>
            accept.mutate(undefined, { onSuccess: (updated) => router.push(resumePath(updated)) })
          }
        >
          {t("submit")}
        </Button>
      }
    >
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {POINTS.map(({ key, icon, tone }) => (
          <li key={key} className="flex items-start gap-3.5">
            <IconTile icon={icon} tone={tone} />
            <div className="leading-[1.55]">
              <p className="m-0 font-semibold text-text-1">{t(`points.${key}.title`)}</p>
              <p className="m-0 text-[15px] text-text-2">{t(`points.${key}.body`)}</p>
            </div>
          </li>
        ))}
      </ul>
      <ChoiceCard
        multi
        name="consent"
        value="agree"
        label={t("agree")}
        selected={agreed}
        onSelect={() => setAgreed((value) => !value)}
      />
      {accept.isError && <FormAlert message={errorMessage(accept.error)} />}
    </FlowPage>
  );
}
