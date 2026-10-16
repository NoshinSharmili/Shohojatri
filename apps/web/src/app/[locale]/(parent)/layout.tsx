import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { RequireRole } from "@/components/auth/gates";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="parent">
      <AppShell>{children}</AppShell>
    </RequireRole>
  );
}
