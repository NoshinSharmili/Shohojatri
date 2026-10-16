import { OfflinePage } from "@/components/pwa/offline-page";
import { pageMetadata } from "@/lib/i18n/metadata";

export const generateMetadata = pageMetadata("offline");

/** What the service worker shows when a page can't load without internet (src/sw/sw.ts). */
export default function Offline() {
  return <OfflinePage />;
}
