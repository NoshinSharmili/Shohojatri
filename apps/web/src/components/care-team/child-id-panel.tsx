"use client";

import { Check, Copy, Download, QrCode, RefreshCw, Share2, type LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";

import { FormAlert } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useErrorMessage } from "@/lib/api/error-message";
import { useWebOrigin } from "@/lib/app/web-origin";
import { useRegenerateCode } from "@/lib/care-team/queries";
import { cx } from "@/lib/cx";

type Props = { childId: number; name: string; code: string };

/** The Child ID with copy / share / QR, and getting a new one (COMPANION_SPEC §2). Parent only. */
export function ChildIdPanel({ childId, name, code }: Props) {
  const t = useTranslations("childId");
  const locale = useLocale();
  const origin = useWebOrigin();
  const [copied, setCopied] = useState(false);
  const [sheet, setSheet] = useState<"qr" | "regenerate" | null>(null);
  const shareText = t("shareText", { name, code });

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard can be blocked (non-HTTPS, permissions); the code is on screen to copy by hand.
    }
  }

  async function share() {
    if (navigator.share) {
      // Rejects when the person closes the share sheet, which is not an error.
      await navigator.share({ text: shareText }).catch(() => undefined);
    } else {
      // Most parents share by WhatsApp; desktop browsers rarely have the share sheet.
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener");
    }
  }

  return (
    <section
      aria-label={t("label", { name })}
      className="flex flex-col items-center gap-3 rounded-leaf border border-navy-100 bg-[image:var(--sj-gradient-sky)] p-4.5 text-center"
    >
      <span className="text-small font-semibold text-text-2">{t("label", { name })}</span>
      <span
        lang="en"
        translate="no"
        className="font-display text-[34px] leading-tight font-extrabold tracking-[.08em] text-navy select-all"
      >
        {code}
      </span>
      <div className="grid w-full grid-cols-3 gap-2">
        <TileButton
          icon={copied ? Check : Copy}
          label={copied ? t("copied") : t("copy")}
          on={copied}
          onClick={() => void copy()}
        />
        <TileButton icon={Share2} label={t("share")} onClick={() => void share()} />
        <TileButton icon={QrCode} label={t("qr")} onClick={() => setSheet("qr")} />
      </div>
      <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => setSheet("regenerate")}>
        {t("regenerate")}
      </Button>

      <Sheet
        open={sheet === "qr"}
        title={t("qrTitle")}
        onClose={() => setSheet(null)}
        closeLabel={t("close")}
      >
        {sheet === "qr" && (
          <QrContent
            code={code}
            hint={t("qrHint")}
            downloadLabel={t("qrDownload")}
            url={`${origin}/${locale}/request-access?code=${code}`}
          />
        )}
      </Sheet>
      <RegenerateSheet
        open={sheet === "regenerate"}
        childId={childId}
        onClose={() => setSheet(null)}
      />
    </section>
  );
}

function TileButton({
  icon: Icon,
  label,
  on = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  on?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-live={on ? "polite" : undefined}
      className={cx(
        "flex min-h-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md border-[1.5px] text-[14px] font-semibold",
        "transition-colors duration-200",
        on
          ? "border-leaf bg-leaf-50 text-leaf-ink"
          : "border-border-1 bg-white text-navy hover:bg-navy-50",
      )}
    >
      <Icon aria-hidden className="size-5.5" />
      {label}
    </button>
  );
}

function QrContent({
  code,
  url,
  hint,
  downloadLabel,
}: {
  code: string;
  url: string;
  hint: string;
  downloadLabel: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  function download() {
    const link = document.createElement("a");
    link.href = canvas.current?.toDataURL("image/png") ?? "";
    link.download = `shohojatri-${code}.png`;
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-1">
      <div className="rounded-lg border border-border-1 bg-white p-3">
        {/* Opens the request box with the code filled in, on the scanner's own phone. */}
        <QRCodeCanvas ref={canvas} value={url} size={196} marginSize={1} />
      </div>
      <span
        lang="en"
        translate="no"
        className="font-display text-[26px] font-extrabold tracking-[.08em] text-navy"
      >
        {code}
      </span>
      <p className="m-0 text-center text-[15px] text-text-2">{hint}</p>
      <Button block icon={Download} onClick={download}>
        {downloadLabel}
      </Button>
    </div>
  );
}

function RegenerateSheet({
  open,
  childId,
  onClose,
}: {
  open: boolean;
  childId: number;
  onClose: () => void;
}) {
  const t = useTranslations("childId");
  const errorMessage = useErrorMessage();
  const regenerate = useRegenerateCode(childId);

  return (
    <Sheet
      open={open}
      title={t("regenerateTitle")}
      onClose={() => {
        regenerate.reset();
        onClose();
      }}
      closeLabel={t("close")}
      footer={
        <>
          <Button
            block
            icon={RefreshCw}
            loading={regenerate.isPending}
            onClick={() => regenerate.mutate(undefined, { onSuccess: onClose })}
          >
            {t("regenerateConfirm")}
          </Button>
          <Button block variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="m-0 text-body text-text-2">{t("regenerateBody")}</p>
        <FormAlert message={regenerate.error ? errorMessage(regenerate.error) : undefined} />
      </div>
    </Sheet>
  );
}
