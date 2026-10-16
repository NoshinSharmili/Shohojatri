"use client";

import { useEffect } from "react";

import { QueryView } from "@/components/app/query-view";
import { StateView } from "@/components/ui/state-view";
import { useRouter } from "@/lib/i18n/navigation";
import { useScreening } from "@/lib/screening/queries";
import { resumePath } from "@/lib/screening/rules";

/** `/screening/[id]`: sends the parent to wherever they left off (all progress is server-side,
 *  so this works after a reload or on another device). */
export function ScreeningResume({ screeningId }: { screeningId: number }) {
  const query = useScreening(screeningId);
  const router = useRouter();

  useEffect(() => {
    if (query.data) router.replace(resumePath(query.data));
  }, [query.data, router]);

  return <QueryView query={query}>{() => <StateView kind="loading" />}</QueryView>;
}
