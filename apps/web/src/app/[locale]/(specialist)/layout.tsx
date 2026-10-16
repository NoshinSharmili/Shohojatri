import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { RequireRole } from "@/components/auth/gates";

export default function SpecialistLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="specialist">
      <AppShell>{children}</AppShell>
    </RequireRole>
  );
}
