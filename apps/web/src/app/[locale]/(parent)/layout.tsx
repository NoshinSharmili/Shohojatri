import { type ReactNode, Suspense } from "react";

import { AppShell } from "@/components/app/app-shell";
import { RequireRole } from "@/components/auth/gates";
import { DemoParam } from "@/lib/screening/demo";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="parent">
      {/* Reads ?demo=1 / ?demo=0 (CLAUDE.md §10); search params need a Suspense boundary. */}
      <Suspense>
        <DemoParam />
      </Suspense>
      {/* Wide for the care team's two columns; single-column pages narrow themselves. */}
      <AppShell wide>{children}</AppShell>
    </RequireRole>
  );
}
