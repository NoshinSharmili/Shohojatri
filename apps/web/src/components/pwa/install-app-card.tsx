"use client";

import { Download, Share, Smartphone, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { promptInstall, useInstallOption } from "@/lib/pwa/install";
import { useDismissed } from "@/lib/pwa/storage";

const DISMISSED = "sj-install-dismissed";

/** "Install app" on the parent home: Chrome's install dialog on Android, or the Share →
 *  Add to Home Screen steps on iPhone. Hidden once installed or dismissed. */
export function InstallAppCard() {
  const t = useTranslations("pwa.install");
  const option = useInstallOption();
  const [dismissed, dismiss] = useDismissed(DISMISSED);
  if (!option || dismissed) return null;

  return (
    <Card tone="calm" className="flex items-start gap-3 py-4 pr-2 pl-4">
      <Smartphone aria-hidden className="mt-1 size-6 shrink-0 text-teal-deep" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="m-0 font-display text-[18px] leading-[1.45] font-bold text-text-1">
          {t("title")}
        </p>
        {option === "prompt" ? (
          <>
            <p className="m-0 text-[15px] leading-[1.6] text-text-2">{t("body")}</p>
            <div>
              <Button
                size="sm"
                icon={Download}
                onClick={() => void promptInstall().then((installed) => installed && dismiss())}
              >
                {t("button")}
              </Button>
            </div>
          </>
        ) : (
          <p className="m-0 text-[15px] leading-[1.6] text-text-2">
            <Share aria-hidden className="mr-1 inline size-4.5 align-[-3px] text-blue-ink" />
            {t("iosSteps")}
          </p>
        )}
      </div>
      <IconButton icon={X} label={t("dismiss")} onClick={dismiss} />
    </Card>
  );
}
