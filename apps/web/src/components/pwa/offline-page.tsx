"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { StateView } from "@/components/ui/state-view";

/** Offline fallback (served from the service worker's cache): try the page again. */
export function OfflinePage() {
  const t = useTranslations("offline");
  const tCommon = useTranslations("common");
  return (
    <main className="mx-auto flex min-h-[80dvh] max-w-(--reading-max) flex-col justify-center px-4">
      <StateView
        kind="error"
        title={t("title")}
        message={t("message")}
        action={<Button onClick={() => window.location.reload()}>{tCommon("retry")}</Button>}
      />
    </main>
  );
}
