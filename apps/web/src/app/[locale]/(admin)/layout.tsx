import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { RequireRole } from "@/components/auth/gates";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="admin">
      <AppShell wide>{children}</AppShell>
    </RequireRole>
  );
}
