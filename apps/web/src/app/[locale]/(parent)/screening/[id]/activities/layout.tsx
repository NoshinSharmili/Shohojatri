import type { ReactNode } from "react";

import { CaptureProvider } from "@/components/activities/capture-provider";

/** One camera session for every activity route; leaving them turns the camera off. */
export default function ActivitiesLayout({ children }: { children: ReactNode }) {
  return <CaptureProvider>{children}</CaptureProvider>;
}
