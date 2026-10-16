"use client";

import { QrCode } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";

import { FormAlert } from "@/components/auth/auth-screen";
import { useShareUrl } from "@/components/results/share-sheet";
import { Button } from "@/components/ui/button";
import { useErrorMessage } from "@/lib/api/error-message";
import { useCreateShare, useLatestShareLink } from "@/lib/screening/queries";

type Link = { url: string; expiresAt: string };

/** QR code + link to the online doctor report (SCREENING_SPEC §7). */
export function ReportQr({ link, title, size = 84 }: { link: Link; title: string; size?: number }) {
  const t = useTranslations("report.clinician");
  const format = useFormatter();
  return (
    <div className="flex items-center gap-3 print:break-inside-avoid">
      <div className="shrink-0 rounded-md border border-border-1 bg-white p-1.5">
        <QRCodeSVG value={link.url} size={size} marginSize={0} fgColor="#003C78" />
      </div>
      <div className="flex min-w-0 flex-col text-small leading-[1.5] text-text-2">
        <b className="text-text-1">{title}</b>
        <span className="break-all">{link.url}</span>
        <span>
          {t("onlineUntil", {
            date: format.dateTime(new Date(link.expiresAt), { dateStyle: "long" }),
          })}
        </span>
      </div>
    </div>
  );
}

/** For the parent's printouts: the link made this session, or a button to make one. A link's
 *  token is shown only when it is made (the API stores a hash), so after a reload the parent
 *  makes a new one. Nothing prints when there is no link. */
export function ParentReportQr({ screeningId, title }: { screeningId: number; title: string }) {
  const t = useTranslations("report.qr");
  const errorMessage = useErrorMessage();
  const shareUrl = useShareUrl();
  const latest = useLatestShareLink(screeningId);
  const create = useCreateShare(screeningId);

  if (latest) {
    return (
      <ReportQr
        title={title}
        link={{ url: shareUrl(latest.token), expiresAt: latest.expires_at }}
      />
    );
  }
  return (
    <div className="flex flex-col items-start gap-1.5 rounded-md border border-dashed border-border-2 p-3 print:hidden">
      <Button
        size="sm"
        variant="secondary"
        icon={QrCode}
        loading={create.isPending}
        onClick={() => create.mutate(30)}
      >
        {t("add")}
      </Button>
      <span className="text-small text-text-2">{t("addHint")}</span>
      {create.isError && <FormAlert message={errorMessage(create.error)} />}
    </div>
  );
}
