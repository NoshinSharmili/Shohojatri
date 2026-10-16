"use client";

import { FileText, NotebookPen, Pill, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Switch } from "@/components/ui/switch";

export type Options = { share_medications: boolean; share_documents: boolean };
type MemberRole = "teacher" | "specialist";

/** What a parent starts from when approving (COMPANION_SPEC §3.2). */
export function defaultOptions(role: string): Options {
  return { share_medications: false, share_documents: role === "specialist" };
}

/** The "what they can see" rows: logs always on; medicines a choice for teachers only
 *  (clinical scope always includes them); documents a choice for everyone. */
export function ScopeOptions({
  role,
  value,
  onChange,
}: {
  role: MemberRole;
  value: Options;
  onChange: (value: Options) => void;
}) {
  const t = useTranslations("careTeam");
  const always = (
    <span className="rounded-pill bg-n-100 px-2.5 py-0.5 text-caption font-semibold text-text-2">
      {t("always")}
    </span>
  );

  return (
    <div className="flex flex-col gap-2">
      <Row icon={NotebookPen} title={t("logs")} hint={t("logsHint")}>
        {always}
      </Row>
      {role === "teacher" ? (
        <Row icon={Pill} title={t("medications")} hint={t("medicationsHint")}>
          <Switch
            label={t("medications")}
            checked={value.share_medications}
            onChange={(on) => onChange({ ...value, share_medications: on })}
          />
        </Row>
      ) : (
        <Row icon={Pill} title={t("medicationsClinical")} hint={t("medicationsClinicalHint")}>
          {always}
        </Row>
      )}
      <Row icon={FileText} title={t("documents")} hint={t("documentsHint")}>
        <Switch
          label={t("documents")}
          checked={value.share_documents}
          onChange={(on) => onChange({ ...value, share_documents: on })}
        />
      </Row>
    </div>
  );
}

function Row({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-white py-2.5 pr-3 pl-3.5">
      <Icon aria-hidden className="size-5 shrink-0 text-navy" />
      <div className="min-w-0 flex-1 text-[15px] leading-normal">
        <b className="block font-semibold text-text-1">{title}</b>
        <span className="text-caption text-text-2">{hint}</span>
      </div>
      {children}
    </div>
  );
}
