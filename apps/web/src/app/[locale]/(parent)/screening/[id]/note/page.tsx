import { NoteStep } from "@/components/screening/note-step";
import { pageMetadata } from "@/lib/i18n/metadata";

import { screeningIdFrom } from "@/lib/screening/screening-id";

export const generateMetadata = pageMetadata("screeningNote");

export default async function NotePage({ params }: PageProps<"/[locale]/screening/[id]/note">) {
  return <NoteStep screeningId={await screeningIdFrom(params)} />;
}
