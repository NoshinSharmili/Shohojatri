"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { RequireUser } from "@/components/auth/gates";
import { homePathFor } from "@/lib/auth/session";

/** Screening reports: the parent, and specialists on the child's care team (the API checks the
 *  grant). Teachers never see screening results (COMPANION_SPEC §3.2). */
export default function ReportsLayout({ children }: { children: ReactNode }) {
  return (
    <RequireUser
      redirectFor={(me) =>
        me.role === "parent" || me.role === "specialist" ? null : homePathFor(me)
      }
    >
      <AppShell wide>{children}</AppShell>
    </RequireUser>
  );
}
