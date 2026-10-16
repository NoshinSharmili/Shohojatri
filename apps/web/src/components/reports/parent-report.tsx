"use client";

import { Footprints, NotebookPen, Search, Star, type LucideIcon } from "lucide-react";
import { type Locale, useFormatter, useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { QueryView } from "@/components/app/query-view";
import {
  ConfidenceNote,
  FindingRows,
  NotDiagnosis,
  ResultGauge,
  StrengthList,
  useHeadline,
  useNextSteps,
} from "@/components/results/result-parts";
import { useResultText } from "@/components/results/use-result-text";
import { useMe } from "@/lib/auth/session";
import { useScreeningReport } from "@/lib/screening/queries";
import { type Report, resultPath } from "@/lib/screening/results";

import { ReportToolbar, ReportSheet, Wordmark, DemoStamp } from "./report-frame";
import { ParentReportQr } from "./report-qr";

/** `/screenings/[id]/report`: the parent's printable report, in the app's language
 *  (SCREENING_SPEC §7, design Parent Report). */
export function ParentReportPage({ screeningId }: { screeningId: number }) {
  const t = useTranslations("report");
  const query = useScreeningReport(screeningId, "parent");
  const isParent = useMe().data?.role === "parent";
  return (
    <QueryView query={query}>
      {(report) => (
        <>
          <ReportToolbar
            back={isParent ? { href: resultPath(screeningId), label: t("back") } : undefined}
          />
          <ParentReport report={report} canShare={isParent} />
        </>
      )}
    </QueryView>
  );
}

function ParentReport({ report, canShare }: { report: Report; canShare: boolean }) {
  const t = useTranslations("report");
  const tResults = useTranslations("results");
  const format = useFormatter();
  const lang = useLocale() as Locale;
  const text = useResultText(report);
  const { headline, meaning, support } = useHeadline(report);
  const steps = useNextSteps(report);

  return (
    <ReportSheet lang={lang}>
      <header className="flex items-center gap-4 border-b-2 border-navy pb-3">
        <Wordmark lang={lang} />
        <div className="ml-auto flex flex-col text-right">
          <b className="font-display text-[20px] leading-[1.4] text-navy">
            {t("parent.title", { name: text.name })}
          </b>
          <span className="text-caption text-text-2">{t("parent.copy")}</span>
        </div>
      </header>

      {report.is_demo && <DemoStamp />}

      <dl className="m-0 flex flex-wrap gap-x-6 gap-y-1 text-small text-text-2">
        <Fact label={t("parent.child")}>{text.name}</Fact>
        <Fact label={t("parent.age")}>{text.age}</Fact>
        <Fact label={t("parent.date")}>{text.date}</Fact>
        <Fact label={t("parent.reportNo")}>{report.report_no}</Fact>
      </dl>

      <section className="grid items-center gap-5 rounded-leaf border border-navy-100 bg-(image:--sj-gradient-sky) px-5 py-4 sm:grid-cols-[220px_1fr] print:grid-cols-[200px_1fr] print:break-inside-avoid">
        <div className="flex justify-center">
          <ResultGauge report={report} width={210} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-display text-[24px] leading-[1.45] font-bold text-balance text-text-1">
            {headline}
          </h1>
          <p className="m-0 text-pretty">{meaning}</p>
          {support && <p className="m-0 font-semibold text-leaf-ink">{support}</p>}
          {report.result.score != null && (
            <p className="m-0 text-small text-text-2">{tResults("scoreNote")}</p>
          )}
          <NotDiagnosis className="mt-1 text-[14.5px]" />
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-[1.2fr_1fr] print:grid-cols-[1.2fr_1fr]">
        <ReportSection icon={Search} title={tResults("sections.noticed")}>
          <FindingRows report={report} findings={report.result.top_concerns} />
        </ReportSection>
        {report.result.strengths.length > 0 && (
          <ReportSection icon={Star} title={tResults("sections.wentWell")}>
            <StrengthList report={report} />
          </ReportSection>
        )}
      </div>

      <ReportSection icon={Footprints} title={tResults("sections.next")}>
        <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 print:grid-cols-2">
          {steps.map((step, index) => (
            <li
              key={step}
              className="rounded-[16px] border border-border-1 px-3.5 py-2.5 leading-[1.6] print:break-inside-avoid"
            >
              <span className="mb-1 flex size-6.5 items-center justify-center rounded-full bg-navy-50 font-display text-small font-bold text-navy">
                {format.number(index + 1)}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </ReportSection>

      <div className="grid gap-5 sm:grid-cols-[1fr_250px] print:grid-cols-[1fr_250px] print:break-inside-avoid">
        <section className="rounded-[16px] border border-dashed border-border-2 px-4 py-3">
          <h2 className="m-0 flex items-center gap-2 font-display text-body font-bold text-navy">
            <NotebookPen aria-hidden className="size-4.5" />
            {t("parent.questions")}
          </h2>
          {[1, 2, 3, 4].map((line) => (
            <i key={line} aria-hidden className="block h-7.5 border-b border-border-1" />
          ))}
        </section>
        <div className="flex flex-col gap-3">
          <ConfidenceNote report={report} compact />
          {canShare && (
            <ParentReportQr screeningId={report.screening_id} title={t("parent.onlineTitle")} />
          )}
        </div>
      </div>

      <footer className="mt-auto flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-border-1 pt-2 text-caption text-text-3">
        <span>{t("parent.tagline")}</span>
        <span>{t("footer")}</span>
        <span>{t("generated", { date: text.date })}</span>
      </footer>
    </ReportSheet>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-1">
      <dt>{label}:</dt>
      <dd className="m-0 font-semibold text-text-1">{children}</dd>
    </div>
  );
}

function ReportSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="m-0 flex items-center gap-2 font-display text-[18px] font-bold text-navy print:break-after-avoid">
        <Icon aria-hidden className="size-4.5" />
        {title}
      </h2>
      {children}
    </section>
  );
}
