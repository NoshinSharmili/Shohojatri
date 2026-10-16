"use client";

import { FlaskConical, Info, ShieldCheck, Star } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { RiskBadge } from "@/components/ui/risk-badge";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { cx } from "@/lib/cx";
import { type Finding, type Report, RISK_ORDER } from "@/lib/screening/results";

import { useResultText } from "./use-result-text";

// Pieces of the parent-facing result (design Results R1-R4), shared by the result screen and
// the printable parent report.

type ClassKey = "low" | "moderate" | "elevated" | "high";

/** Gauge + class badge, or nothing when there is no score (nothing was scorable). */
export function ResultGauge({ report, width = 240 }: { report: Report; width?: number }) {
  const t = useTranslations("results");
  const format = useFormatter();
  const { score, risk_class: level } = report.result;
  if (score == null || level == null) return null;
  const limits = RISK_ORDER.slice(0, 3).map(
    (name) => report.score_bands.find((band) => band.risk_class === name)?.max_score ?? 0,
  ) as [number, number, number];
  return (
    <ScoreGauge
      value={score}
      thresholds={limits}
      level={level}
      valueText={format.number(score)}
      maxLabel={t("gaugeMax")}
      ariaLabel={`${t("gaugeLabel")}: ${t("gaugeAria", { value: format.number(score) })}`}
      width={width}
      badge={<RiskBadge level={level} label={t(`classes.${level}`)} size="lg" />}
    />
  );
}

export function useHeadline(report: Report) {
  const t = useTranslations("results");
  const level = report.result.risk_class as ClassKey | null;
  const name = report.child.name;
  return {
    headline: t(`headline.${level ?? "incomplete"}`),
    meaning: t(`meaning.${level ?? "incomplete"}`, { name }),
    support: level === "high" ? t("support") : null,
  };
}

export function DemoBanner({ report }: { report: Report }) {
  const t = useTranslations("results");
  if (!report.is_demo) return null;
  return (
    <p className="m-0 flex items-start gap-2.5 rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-[15px] leading-[1.6] font-semibold text-amber-ink print:[print-color-adjust:exact]">
      <FlaskConical aria-hidden className="mt-0.5 size-5 shrink-0" />
      {t("demoBanner", { name: report.child.name })}
    </p>
  );
}

export function NotDiagnosis({ className }: { className?: string }) {
  const t = useTranslations("results");
  return (
    <p className={cx("m-0 flex items-start gap-2 font-semibold text-blue-ink", className)}>
      <Info aria-hidden className="mt-1 size-4.5 shrink-0" />
      {t("notDiagnosis")}
    </p>
  );
}

export function FindingRows({ report, findings }: { report: Report; findings: Finding[] }) {
  const t = useTranslations("results");
  const text = useResultText(report);
  if (findings.length === 0) return <p className="m-0 text-text-2">{t("noticedEmpty")}</p>;
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {findings.map((finding) => {
        const { text: sentence, source, icon: Icon } = text.finding(finding);
        return (
          <li
            key={finding.key + finding.source}
            className="flex items-start gap-3 border-b border-border-1 py-3 first:pt-0 last:border-b-0 last:pb-0 print:break-inside-avoid"
          >
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-sky-50 text-navy print:size-8 print:rounded-[10px]"
            >
              <Icon className="size-5 print:size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="leading-[1.6] font-semibold text-text-1">{sentence}</span>
              <span className="text-small text-text-2">{source}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function StrengthList({ report }: { report: Report }) {
  const text = useResultText(report);
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 rounded-lg bg-leaf-50 p-4 print:[print-color-adjust:exact]">
      {report.result.strengths.map((finding) => (
        <li key={finding.key + finding.source} className="flex items-center gap-2.5 leading-[1.55]">
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-ink"
          >
            <Star className="size-4" />
          </span>
          {text.finding(finding).text}
        </li>
      ))}
    </ul>
  );
}

/** The class's recommendation, any red-flag or hearing advice, then a gentle everyday step. */
export function useNextSteps(report: Report): string[] {
  const t = useTranslations("results");
  const text = useResultText(report);
  return [
    ...report.result.recommendations.map(text.recommendation),
    t("keepPlaying", { name: report.child.name }),
  ];
}

export function ConfidenceNote({ report, compact = false }: { report: Report; compact?: boolean }) {
  const t = useTranslations("results.confidence");
  const text = useResultText(report);
  const level = report.result.confidence;
  const notCounted = text.notCounted();
  const lowQuality = text.lowQuality();
  return (
    <div
      className={cx(
        "flex gap-3 rounded-md bg-n-50 text-text-2 print:[print-color-adjust:exact]",
        compact ? "px-3 py-2.5 text-small leading-[1.55]" : "px-4 py-3.5 text-[15px] leading-[1.6]",
      )}
    >
      <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-teal-ink" />
      <div className="flex flex-col gap-1">
        <b className="text-text-1">{t("title", { level: t(`levels.${level}`) })}</b>
        <span>{t(`body.${level}`, { games: text.validGames })}</span>
        {report.result.questionnaire.low_coverage && <span>{t("lowCoverage")}</span>}
        {lowQuality && <span>{t("lowQuality", { list: lowQuality })}</span>}
        {notCounted && <span>{t("notCounted", { list: notCounted })}</span>}
      </div>
    </div>
  );
}
