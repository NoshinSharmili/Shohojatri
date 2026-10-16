"use client";

import { Flag } from "lucide-react";
import { type Locale, type Messages, useFormatter, useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { QueryView } from "@/components/app/query-view";
import { useResultText } from "@/components/results/use-result-text";
import { RiskBadge } from "@/components/ui/risk-badge";
import { homePathFor, useMe } from "@/lib/auth/session";
import { cx } from "@/lib/cx";
import { useScreeningReport } from "@/lib/screening/queries";
import {
  excludedReason,
  type Finding,
  type Report,
  type ReportItem,
  resultPath,
  RISK_ORDER,
  type TaskResult,
} from "@/lib/screening/results";

import { DemoStamp, ReportLanguage, ReportSheet, ReportToolbar, Wordmark } from "./report-frame";
import { ParentReportQr, ReportQr } from "./report-qr";

// Keys built from API values (domains, options, reasons); the message files hold every value.
type Loose = (key: string, values?: Record<string, string | number>) => string;
type OnlineLink = { url: string; expiresAt: string };

/** `/screenings/[id]/clinician`: the doctor report for the parent and approved specialists.
 *  English by default with a বাংলা toggle (SCREENING_SPEC §7, design Doctor Report). */
export function ClinicianReportPage({
  screeningId,
  lang,
  messages,
}: {
  screeningId: number;
  lang: Locale;
  messages: Partial<Messages>;
}) {
  const t = useTranslations();
  const query = useScreeningReport(screeningId, "clinician");
  const me = useMe().data;
  const isParent = me?.role === "parent";
  const back = isParent
    ? { href: resultPath(screeningId), label: t("report.back") }
    : me && { href: homePathFor(me), label: t("common.back") };
  return (
    <QueryView query={query}>
      {(report) => (
        <>
          <ReportToolbar back={back ?? undefined} lang={lang} />
          <ReportLanguage lang={lang} messages={messages}>
            <ClinicianReport report={report} canCreateLink={isParent} />
          </ReportLanguage>
        </>
      )}
    </QueryView>
  );
}

/** The doctor report body, also shown on a public share link (`link` = that link). */
export function ClinicianReport({
  report,
  link,
  canCreateLink = false,
}: {
  report: Report;
  link?: OnlineLink;
  canCreateLink?: boolean;
}) {
  const t = useTranslations("report.clinician");
  const tReport = useTranslations("report");
  const tResults = useTranslations("results");
  const tScreening = useTranslations("screening") as unknown as Loose;
  const format = useFormatter();
  const lang = useLocale() as Locale;
  const text = useResultText(report);
  const result = report.result;
  const level = result.risk_class;
  const device = report.tasks.find((task) => task.device)?.device;
  const className = (name: string) => tResults(`classes.${name}` as "classes.low");
  const number = (value: number) => format.number(value);
  const flagged = report.items.filter((item) => (item.concern ?? 0) > 0).length;

  return (
    <ReportSheet lang={lang}>
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-navy pb-3">
        <Wordmark lang={lang} />
        <div className="flex flex-col">
          <b className="font-display text-[19px] leading-[1.35] text-navy">{t("title")}</b>
          <span className="text-caption text-text-2">{t("copy")}</span>
        </div>
        <div className="ml-auto flex flex-col text-right text-small">
          <span className="font-mono font-semibold">{report.report_no}</span>
          <span className="text-text-2">
            {t("headerChild", { name: text.name, months: number(report.age_months) })}
          </span>
        </div>
      </header>

      {report.is_demo && <DemoStamp />}

      <dl className="m-0 grid grid-cols-2 gap-x-5 gap-y-2 text-small sm:grid-cols-3 print:grid-cols-3">
        <Id label={t("ids.child")}>{text.name}</Id>
        <Id label={t("ids.sex")}>{t(`sex.${report.child.sex ?? "unknown"}`)}</Id>
        <Id label={t("ids.dob")}>
          {format.dateTime(new Date(report.child.dob), { dateStyle: "medium", timeZone: "UTC" })}
        </Id>
        <Id label={t("ids.age")}>
          {t("ids.ageValue", { months: number(report.age_months), age: text.age })}
        </Id>
        <Id label={t("ids.informant")}>{tScreening(`details.informants.${report.informant}`)}</Id>
        <Id label={t("ids.date")}>{text.date}</Id>
        <Id label={t("ids.setting")}>{t("ids.settingValue")}</Id>
        <Id label={t("ids.device")}>
          {device
            ? t("ids.deviceValue", {
                type: device.device_type ?? "other",
                camera: device.camera ?? "other",
              })
            : t("ids.noDevice")}
        </Id>
        <Id label={t("ids.version")}>
          <span className="font-mono text-caption">
            {result.scoring_version} · {report.questionnaire_version}
          </span>
        </Id>
      </dl>

      <section className="grid gap-4 rounded-lg border border-border-1 p-4 sm:grid-cols-[auto_1fr] print:grid-cols-[auto_1fr] print:break-inside-avoid">
        <div className="flex flex-col items-start gap-2">
          <span className="text-small text-text-2">{t("score")}</span>
          {result.score != null && level ? (
            <>
              <b className="font-display text-[34px] leading-none text-navy">
                {t("scoreValue", { score: number(result.score) })}
              </b>
              <RiskBadge level={level} label={className(level)} />
            </>
          ) : (
            <b>{t("noScore")}</b>
          )}
        </div>
        {result.score != null && level && (
          <ScoreBandBar report={report} label={className} format={number} />
        )}
      </section>

      <Block title={t("summary")}>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
          <li>
            {t("confidence")}: <b>{tResults(`confidence.levels.${result.confidence}`)}</b> —{" "}
            {t("gamesCounted", {
              games: number(text.validGames),
              total: number(result.tasks.length),
              lowCoverage: String(result.questionnaire.low_coverage),
            })}
          </li>
          {result.floors.map((floor) => (
            <li key={floor.rule}>
              {t("floor", {
                from: className(floor.from_class),
                to: className(floor.to_class),
                rule: floor.rule,
              })}
            </li>
          ))}
        </ul>
        {result.components.length > 0 && (
          <div>
            <h3 className="m-0 mt-1 text-small font-semibold text-text-2">{t("components")}</h3>
            <ul className="m-0 flex list-none flex-col p-0 text-small">
              {result.components.map((component) => (
                <li key={component.name}>
                  {t("component", {
                    name:
                      component.name === "questionnaire"
                        ? t("questionnaireName")
                        : text.game(component.name),
                    concern: format.number(component.concern, { maximumFractionDigits: 2 }),
                    share: format.number(component.share * 100, { maximumFractionDigits: 0 }),
                    points: format.number(component.points, { maximumFractionDigits: 1 }),
                  })}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
          <FindingList title={t("topConcerns")} items={result.top_concerns.map(clinicalFinding)} />
          <FindingList title={t("strengths")} items={result.strengths.map(clinicalFinding)} />
        </div>
      </Block>

      <Block title={t("redFlags")}>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {result.red_flags.includes("regression") && (
            <FlagLine strong>{t("regressionFlag")}</FlagLine>
          )}
          {result.questionnaire.failed_critical.length > 0 && (
            <FlagLine>
              {t("failedCritical", {
                items: format.list(
                  result.questionnaire.failed_critical.map((id) => {
                    const item = report.items.find((i) => i.item_id === id);
                    return item
                      ? `${id.toUpperCase()} (${tScreening(`domains.${item.domain}`)})`
                      : id;
                  }),
                ),
              })}
            </FlagLine>
          )}
          {result.red_flags.length === 0 && result.questionnaire.failed_critical.length === 0 && (
            <li className="text-text-2">{t("noRedFlags")}</li>
          )}
          {result.recommendations.map((key) => (
            <li key={key} className="flex gap-2">
              <span aria-hidden>→</span>
              {text.recommendation(key)}
            </li>
          ))}
        </ul>
      </Block>

      <Block
        title={t("questionnaire")}
        aside={t("questionnaireSub", {
          count: number(report.items.length),
          flagged: number(flagged),
        })}
      >
        <QuestionnaireTable report={report} />
        <p className="m-0 text-caption text-text-2">
          {t("coverage", {
            scorable: number(result.questionnaire.scorable),
            eligible: number(result.questionnaire.eligible),
          })}
          {" · "}
          {t("itemsNote", { version: report.questionnaire_version })}
        </p>
        {report.parent_note && (
          <blockquote className="m-0 rounded-md border-l-4 border-teal bg-teal-50 px-4 py-2.5">
            <b className="block text-small text-teal-ink">{t("note")}</b>
            <span className="whitespace-pre-line">{report.parent_note}</span>
          </blockquote>
        )}
      </Block>

      <Block title={t("activities")} aside={t("activitiesSub")}>
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
          {result.tasks.map((task) => (
            <TaskCard key={task.task} report={report} task={task} />
          ))}
        </div>
        <TrialTable report={report} />
      </Block>

      <Block title={t("method")}>
        <p className="m-0 text-small">
          {t("methodBody", {
            items: number(report.items.length),
            q: pct(report.weights.questionnaire),
            rtn: pct(report.weights.rtn),
            ja: pct(report.weights.joint_attention),
            im: pct(report.weights.imitation),
            gp: pct(report.weights.gaze_preference),
            fp: pct(report.weights.free_play),
            ...Object.fromEntries(
              RISK_ORDER.slice(0, 3).map((name) => [
                name,
                number(report.score_bands.find((b) => b.risk_class === name)?.max_score ?? 0),
              ]),
            ),
            version: result.scoring_version,
          })}
        </p>
        <p className="m-0 text-small font-semibold text-text-2">{t("limits")}</p>
      </Block>

      {link ? (
        <ReportQr link={link} title={t("online")} />
      ) : (
        canCreateLink && <ParentReportQr screeningId={report.screening_id} title={t("online")} />
      )}

      <footer className="mt-auto flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-border-1 pt-2 text-caption text-text-3">
        <span>{tReport("footer")}</span>
        <span>{tReport("generated", { date: text.date })}</span>
      </footer>
    </ReportSheet>
  );

  /** The parent-facing sentence, sourced the way a clinician reads it: item id or activity. */
  function clinicalFinding(finding: Finding) {
    const isItem = report.items.some((item) => item.item_id === finding.source);
    return {
      text: text.finding(finding).text,
      source: isItem ? finding.source.toUpperCase() : text.game(finding.source),
    };
  }

  function pct(weight: number | undefined) {
    return format.number((weight ?? 0) * 100, { maximumFractionDigits: 0 });
  }
}

function Id({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-caption text-text-2">{label}</dt>
      <dd className="m-0 font-semibold">{children}</dd>
    </div>
  );
}

function Block({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      {/* Never the last line of a printed page. */}
      <h2 className="m-0 flex flex-wrap items-baseline gap-x-3 border-b border-border-1 pb-1 font-display text-[17px] font-bold text-navy print:break-after-avoid">
        {title}
        {aside && <span className="font-body text-caption font-normal text-text-2">{aside}</span>}
      </h2>
      {children}
    </section>
  );
}

function FlagLine({ strong = false, children }: { strong?: boolean; children: ReactNode }) {
  return (
    <li className={cx("flex items-start gap-2", strong && "font-semibold text-risk-high-ink")}>
      <Flag aria-hidden className="mt-1 size-4 shrink-0 text-risk-high" />
      {children}
    </li>
  );
}

function FindingList({
  title,
  items,
}: {
  title: string;
  items: { text: string; source: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <h3 className="m-0 text-small font-semibold text-text-2">{title}</h3>
      <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
        {items.map((item) => (
          <li key={item.text}>
            {item.text} <span className="text-caption text-text-2">({item.source})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal class band with labelled zones and a marker at the score: never colour alone. */
function ScoreBandBar({
  report,
  label,
  format,
}: {
  report: Report;
  label: (name: string) => string;
  format: (value: number) => string;
}) {
  const score = report.result.score ?? 0;
  const bands = report.score_bands.map((band, index) => ({
    ...band,
    from: index === 0 ? 0 : report.score_bands[index - 1].max_score,
  }));
  return (
    <div className="flex flex-col justify-center gap-1 pt-5">
      <div className="relative">
        <div className="flex h-3.5 overflow-hidden rounded-pill">
          {bands.map((band) => (
            <span
              key={band.risk_class}
              style={{
                width: `${band.max_score - band.from}%`,
                background: `var(--sj-risk-${band.risk_class})`,
              }}
              className={cx(band.risk_class !== report.result.score_class && "opacity-45")}
            />
          ))}
        </div>
        <span
          aria-hidden
          className="absolute -top-5 -translate-x-1/2 font-display text-small font-bold text-navy"
          style={{ left: `${score}%` }}
        >
          ▼
        </span>
      </div>
      <div className="flex text-caption text-text-2">
        {bands.map((band) => (
          <span
            key={band.risk_class}
            style={{ width: `${band.max_score - band.from}%` }}
            className="flex flex-col"
          >
            <b className="font-semibold text-text-1">{label(band.risk_class)}</b>
            {format(band.from === 0 ? 0 : band.from + 1)}–{format(band.max_score)}
          </span>
        ))}
      </div>
    </div>
  );
}

function QuestionnaireTable({ report }: { report: Report }) {
  const t = useTranslations("report.clinician");
  const tScreening = useTranslations("screening") as unknown as Loose;
  const format = useFormatter();
  const lang = useLocale();

  function response(item: ReportItem): string {
    if (item.option == null) return t("unanswered");
    if (item.option === "not_sure") return tScreening("options.notSure");
    if (item.option === "other") return tScreening("options.other");
    return tScreening(`options.${item.type}.${item.option}`);
  }

  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full min-w-[560px] border-collapse text-small print:min-w-0">
        <thead>
          <tr className="border-b-2 border-border-2 text-left text-caption text-text-2">
            <th className="py-1.5 pr-2 font-semibold">{t("cols.n")}</th>
            <th className="py-1.5 pr-2 font-semibold">{t("cols.item")}</th>
            <th className="py-1.5 pr-2 font-semibold">{t("cols.domain")}</th>
            <th className="py-1.5 pr-2 font-semibold">{t("cols.response")}</th>
            <th className="py-1.5 pr-2 font-semibold">{t("cols.concern")}</th>
            <th className="py-1.5 font-semibold">{t("cols.flag")}</th>
          </tr>
        </thead>
        <tbody>
          {report.items.map((item) => {
            const concern = item.concern ?? 0;
            return (
              <tr
                key={item.item_id}
                className={cx(
                  "border-b border-border-1 align-top print:break-inside-avoid",
                  concern > 0 && "bg-risk-moderate-bg",
                )}
              >
                <td className="py-1.5 pr-2 font-mono text-caption">{item.item_id.toUpperCase()}</td>
                <td className="py-1.5 pr-2">
                  {lang === "bn" ? item.text_bn : item.text_en}
                  {item.critical && (
                    <span className="ml-1.5 inline-block rounded-pill bg-navy-50 px-2 text-caption font-semibold text-navy">
                      {t("critical")}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pr-2 text-text-2">{tScreening(`domains.${item.domain}`)}</td>
                <td className="py-1.5 pr-2">
                  {response(item)}
                  {item.other_text && (
                    <span className="mt-0.5 block text-caption text-text-2">
                      {t("otherText", { text: item.other_text })}
                      {item.type !== "hearing" && (
                        <> · {t("mappedBy", { ai: String(item.mapped_by_ai) })}</>
                      )}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pr-2">
                  {item.concern == null
                    ? t("notScored")
                    : format.number(item.concern, { maximumFractionDigits: 2 })}
                </td>
                <td className="py-1.5">
                  {concern > 0 && (
                    <span className="inline-flex items-center gap-1 font-semibold text-risk-high-ink">
                      <Flag aria-hidden className="size-3.5" />
                      {item.failed ? t("failed") : t("atRisk")}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TaskCard({ report, task }: { report: Report; task: TaskResult }) {
  const t = useTranslations("report.clinician");
  const tResults = useTranslations("results") as unknown as Loose;
  const tLoose = t as unknown as Loose;
  const format = useFormatter();
  const text = useResultText(report);
  const m = task.metrics ?? {};
  const n = (value: unknown) => (typeof value === "number" ? format.number(value) : "—");
  const meta = report.tasks.find((captured) => captured.task === task.task);
  const reason = excludedReason(report, task);

  let metrics: string | null = null;
  if (task.status !== "inconclusive") {
    switch (task.task) {
      case "rtn":
        metrics = t("metrics.rtn", {
          responded: n(m.responded),
          valid: n(m.valid),
          latency:
            typeof m.mean_latency_ms === "number"
              ? t("seconds", {
                  value: format.number(m.mean_latency_ms / 1000, { maximumFractionDigits: 1 }),
                })
              : "—",
        });
        break;
      case "joint_attention":
        metrics = t("metrics.joint_attention", {
          followed: n(m.followed),
          valid: n(m.valid),
          variant: tLoose(`variant.${m.variant ?? "on_screen"}`),
        });
        break;
      case "imitation":
        metrics = t("metrics.imitation", {
          copied: n(m.copied),
          valid: n(m.valid),
          attempted: n(m.attempted),
        });
        break;
      case "gaze_preference":
        metrics = t("metrics.gaze_preference", {
          geometric: n(m.geometric_pct),
          tracked: n(m.tracked_pct),
        });
        break;
      case "free_play":
        metrics = t("metrics.free_play", {
          episodes: n(m.episodes),
          arm: n(m.arm_episodes),
          rocking: n(m.rocking_episodes),
          seconds: n(m.seconds),
          vocal: n(m.vocal_seconds),
        });
        break;
    }
  }

  const q = task.quality;
  const quality = [
    q.face_pct != null && t("qualityParts.face", { pct: n(Math.round(q.face_pct * 100)) }),
    q.pose_pct != null && t("qualityParts.pose", { pct: n(Math.round(q.pose_pct * 100)) }),
    q.calibration && t("qualityParts.calibration", { value: t(`calibration.${q.calibration}`) }),
    q.valid_trials != null && t("qualityParts.trials", { count: n(q.valid_trials) }),
    meta?.quality?.mean_luma != null &&
      t("qualityParts.light", { value: n(Math.round(meta.quality.mean_luma)) }),
    meta?.quality?.noise_db != null &&
      t("qualityParts.noise", { value: n(Math.round(meta.quality.noise_db)) }),
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-1 rounded-md border border-border-1 p-3 print:break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <b>{text.game(task.task)}</b>
        <span
          className={cx(
            "rounded-pill px-2.5 text-caption font-semibold",
            task.status === "ok" && "bg-leaf-50 text-leaf-ink",
            task.status === "low" && "bg-amber-50 text-amber-ink",
            task.status === "inconclusive" && "bg-n-100 text-text-2",
          )}
        >
          {t(`taskStatus.${task.status}`)}
        </span>
      </div>
      {metrics && <p className="m-0 text-small">{metrics}</p>}
      {task.status === "inconclusive" && reason && (
        <p className="m-0 text-small">{t("excluded", { reason: tResults(`reasons.${reason}`) })}</p>
      )}
      {quality.length > 0 && <p className="m-0 text-caption text-text-2">{quality.join(" · ")}</p>}
    </div>
  );
}

function TrialTable({ report }: { report: Report }) {
  const t = useTranslations("report.clinician");
  const tLoose = t as unknown as Loose;
  const format = useFormatter();
  const text = useResultText(report);
  const seconds = (ms: number | null | undefined) =>
    ms == null
      ? "—"
      : t("seconds", { value: format.number(ms / 1000, { maximumFractionDigits: 1 }) });

  const rows = report.result.tasks.flatMap((task) =>
    (task.trials ?? []).map((trial, index) => {
      const game = text.game(task.task);
      switch (trial.kind) {
        case "rtn":
          return {
            game,
            trial: trial.trial,
            target: t("trial.rtnTarget"),
            response:
              (trial.latency_ms == null ? t("trial.noOrient") : t("trial.oriented")) +
              (trial.t0_estimated ? ` (${t("trial.estimated")})` : ""),
            latency: seconds(trial.latency_ms),
            valid: trial.valid,
            invalid: trial.invalid_reason,
          };
        case "joint_attention":
          return {
            game,
            trial: trial.trial,
            target: t("trial.jaTarget", { side: trial.side }),
            response:
              trial.first_look == null
                ? t("trial.noLook")
                : trial.followed
                  ? t("trial.followed")
                  : t("trial.lookedOther"),
            latency: seconds(trial.first_look_ms),
            valid: trial.valid,
            invalid: trial.invalid_reason,
          };
        case "imitation":
          return {
            game,
            trial: index + 1,
            target: t(`trial.action.${trial.action}`),
            response: trial.outcome ? t(`trial.outcome.${trial.outcome}`) : "—",
            latency: "—",
            valid: trial.valid,
            invalid: trial.invalid_reason,
          };
        default:
          return {
            game,
            trial: index + 1,
            target: t(`trial.movement.${trial.movement}`),
            response: t("trial.episode", {
              start: format.number(trial.start_ms / 1000, { maximumFractionDigits: 1 }),
              end: format.number(trial.end_ms / 1000, { maximumFractionDigits: 1 }),
            }),
            latency: "—",
            valid: true,
            invalid: null,
          };
      }
    }),
  );
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="m-0 text-small font-semibold text-text-2">{t("trials")}</h3>
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full min-w-[560px] border-collapse text-small print:min-w-0">
          <thead>
            <tr className="border-b-2 border-border-2 text-left text-caption text-text-2">
              <th className="py-1 pr-2 font-semibold">{t("cols.activity")}</th>
              <th className="py-1 pr-2 font-semibold">{t("cols.trial")}</th>
              <th className="py-1 pr-2 font-semibold">{t("cols.target")}</th>
              <th className="py-1 pr-2 font-semibold">{t("cols.result")}</th>
              <th className="py-1 pr-2 font-semibold">{t("cols.latency")}</th>
              <th className="py-1 font-semibold">{t("cols.valid")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.game}-${row.trial}-${row.target}`}
                className={cx(
                  "border-b border-border-1 align-top print:break-inside-avoid",
                  !row.valid && "text-text-3",
                )}
              >
                <td className="py-1 pr-2">{row.game}</td>
                <td className="py-1 pr-2">{format.number(row.trial)}</td>
                <td className="py-1 pr-2">{row.target}</td>
                <td className="py-1 pr-2">{row.response}</td>
                <td className="py-1 pr-2">{row.latency}</td>
                <td className="py-1">
                  {row.valid ? "✓" : tLoose(`trial.invalid.${row.invalid ?? "something_wrong"}`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
