"use client";

import { Check, Copy, KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/** One-time display of a temporary password. Only its hash is stored, so it can't be shown again. */
export function TemporaryPasswordReveal({ name, password }: { name: string; password: string }) {
  const t = useTranslations("admin.reveal");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (non-HTTPS, permissions); the password is still on screen.
    }
  }

  return (
    <Card tone="warm" className="flex flex-col gap-3" role="status">
      <p className="m-0 flex items-center gap-2 font-semibold text-amber-ink">
        <KeyRound aria-hidden className="size-5" />
        {t("title", { name })}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <code
          lang="en"
          className="rounded-sm bg-white px-3 py-2 font-mono text-[20px] font-semibold tracking-wider text-text-1 select-all"
        >
          {password}
        </code>
        <Button
          variant="secondary"
          size="sm"
          icon={copied ? Check : Copy}
          onClick={() => void copy()}
        >
          {copied ? t("copied") : t("copy")}
        </Button>
      </div>
      <p className="m-0 text-small text-text-2">{t("warning")}</p>
    </Card>
  );
}
