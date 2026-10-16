"use client";

import { Check, Clock, Copy, Eye, Link2, Link2Off, MessageCircle, QrCode } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

import { FormAlert } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { ChipOption } from "@/components/ui/chip-option";
import { Sheet } from "@/components/ui/sheet";
import { useErrorMessage } from "@/lib/api/error-message";
import { useWebOrigin } from "@/lib/app/web-origin";
import { cx } from "@/lib/cx";
import {
  useCreateShare,
  useLatestShareLink,
  useRevokeShare,
  useShares,
} from "@/lib/screening/queries";
import { type Share, sharePath } from "@/lib/screening/results";

const EXPIRY_DAYS = [1, 7, 30] as const;

/** Absolute link to the public doctor report, in the parent's current language. */
export function useShareUrl() {
  const locale = useLocale();
  const origin = useWebOrigin();
  return (token: string) => `${origin}/${locale}${sharePath(token)}`;
}

/** Share the doctor report by link, WhatsApp or QR, and close links (design Results S1–S3,
 *  SCREENING_SPEC §7). Parent only. */
export function ShareSheet({
  screeningId,
  childName,
  open,
  onClose,
}: {
  screeningId: number;
  childName: string;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("share");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const shareUrl = useShareUrl();
  const [days, setDays] = useState<(typeof EXPIRY_DAYS)[number]>(30);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const create = useCreateShare(screeningId);
  const revoke = useRevokeShare(screeningId);
  const shares = useShares(screeningId);
  const link = useLatestShareLink(screeningId);
  const url = link ? shareUrl(link.token) : null;
  const date = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "medium" });

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: the link is selectable in the box.
    }
  }

  return (
    <Sheet open={open} title={t("title")} onClose={onClose} closeLabel={tCommon("close")}>
      <div className="flex flex-col gap-4">
        <p className="m-0">{t("intro")}</p>

        {link && url ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-md border border-border-2 bg-n-25 py-1.5 pr-1.5 pl-3">
              <Link2 aria-hidden className="size-4.5 shrink-0 text-teal-ink" />
              <input
                readOnly
                value={url}
                aria-label={t("linkLabel")}
                onFocus={(event) => event.currentTarget.select()}
                className="min-w-0 flex-1 bg-transparent text-small text-text-1 outline-none"
              />
              <Button size="sm" variant="secondary" icon={copied ? Check : Copy} onClick={copy}>
                {copied ? t("copied") : t("copy")}
              </Button>
            </div>
            <p className="m-0 flex items-center gap-2 text-small text-text-2">
              <Clock aria-hidden className="size-4 shrink-0" />
              {t("closesOn", { date: date(link.expires_at) })}
            </p>
            <p className="m-0 rounded-md bg-amber-50 px-3 py-2 text-small text-amber-ink">
              {t("onceNote")}
            </p>
            <div className="flex flex-wrap gap-2.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(t("whatsappText", { name: childName, url }))}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 flex-[1.4] items-center justify-center gap-2 rounded-pill bg-navy px-5 font-semibold text-white no-underline hover:bg-navy-deep"
              >
                <MessageCircle aria-hidden className="size-5" />
                {t("whatsapp")}
              </a>
              <Button
                variant="secondary"
                icon={QrCode}
                className="flex-1"
                aria-expanded={showQr}
                onClick={() => setShowQr((shown) => !shown)}
              >
                {t("showQr")}
              </Button>
            </div>
            {showQr && (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-lg border border-border-1 bg-white p-3">
                  <QRCodeSVG value={url} size={200} marginSize={1} fgColor="#003C78" />
                </div>
                <p className="m-0 text-small text-text-2">{t("qrHint", { name: childName })}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-2 p-0 font-semibold">{t("expiry")}</legend>
              <div className="flex flex-wrap gap-2">
                {EXPIRY_DAYS.map((value) => (
                  <ChipOption
                    key={value}
                    name="share-expiry"
                    value={value}
                    label={t("days", { days: value })}
                    selected={days === value}
                    checked={days === value}
                    onChange={() => setDays(value)}
                  />
                ))}
              </div>
            </fieldset>
            {create.isError && <FormAlert message={errorMessage(create.error)} />}
            <Button icon={Link2} loading={create.isPending} onClick={() => create.mutate(days)}>
              {t("create")}
            </Button>
          </div>
        )}

        {revoke.isSuccess && (
          <p role="status" className="m-0 rounded-md bg-leaf-50 px-3 py-2 text-small text-leaf-ink">
            {t("revokedToast")}
          </p>
        )}
        {revoke.isError && <FormAlert message={errorMessage(revoke.error)} />}

        {shares.data && shares.data.length > 0 && (
          <section aria-labelledby="share-links" className="flex flex-col gap-2">
            <h3 id="share-links" className="m-0 text-body font-semibold">
              {t("links")}
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {shares.data.map((share) => (
                <ShareRow
                  key={share.id}
                  share={share}
                  date={date}
                  closing={revoke.isPending && revoke.variables === share.id}
                  onRevoke={() => revoke.mutate(share.id)}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    </Sheet>
  );
}

function ShareRow({
  share,
  date,
  closing,
  onRevoke,
}: {
  share: Share;
  date: (iso: string) => string;
  closing: boolean;
  onRevoke: () => void;
}) {
  const t = useTranslations("share");
  const active = share.status === "active";
  return (
    <li
      className={cx(
        "flex flex-col gap-1 rounded-md border px-3 py-2.5",
        active ? "border-border-1 bg-white" : "border-transparent bg-n-50",
      )}
    >
      <span className="flex items-center gap-2 font-semibold">
        {active ? (
          <Link2 aria-hidden className="size-4 text-teal-ink" />
        ) : (
          <Link2Off aria-hidden className="size-4 text-text-3" />
        )}
        {active
          ? t("status.active", { date: date(share.expires_at) })
          : t(`status.${share.status}`)}
      </span>
      <span className="flex flex-wrap items-center gap-x-3 text-small text-text-2">
        <span>{t("linkMade", { date: date(share.created_at) })}</span>
        <span className="inline-flex items-center gap-1">
          <Eye aria-hidden className="size-4" />
          {t("views", { views: share.views })}
        </span>
      </span>
      {active && (
        <Button
          variant="ghost"
          size="sm"
          icon={Link2Off}
          loading={closing}
          onClick={onRevoke}
          className="self-start text-danger enabled:hover:bg-danger-bg"
        >
          {t("revoke")}
        </Button>
      )}
    </li>
  );
}
