import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { RequireRole } from "@/components/auth/gates";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="teacher">
      <AppShell>{children}</AppShell>
    </RequireRole>
  );
}
