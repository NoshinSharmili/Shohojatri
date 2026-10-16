import { QuestionStep } from "@/components/screening/question-step";
import { pageMetadata } from "@/lib/i18n/metadata";

import { screeningIdFrom } from "@/lib/screening/screening-id";

export const generateMetadata = pageMetadata("screeningQuestion");

export default async function QuestionPage({
  params,
}: PageProps<"/[locale]/screening/[id]/questions/[n]">) {
  const screeningId = await screeningIdFrom(params);
  // Out-of-range numbers are sent on to the right question by the step itself.
  const n = Number((await params).n);
  return <QuestionStep screeningId={screeningId} n={Number.isInteger(n) ? n : 0} />;
}
