"use client";

import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { RoleBadge } from "@/components/ui/role-badge";
import { type Role, useMe } from "@/lib/auth/session";

/** Placeholder home per role until B3/B4 fill it (children, access requests, screening). */
export function RoleHome({ role }: { role: Exclude<Role, "admin"> }) {
  const t = useTranslations("homes");
  // Rendered inside RequireRole, so the user is loaded.
  const me = useMe().data;
  if (!me) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <RoleBadge role={role} />
        {me.verified && (
          <span className="inline-flex items-center gap-1 text-small font-semibold text-leaf-ink">
            <BadgeCheck aria-hidden className="size-4.5" />
            {t("verified")}
          </span>
        )}
      </div>
      <div>
        <h1 className="m-0 font-display text-h1 font-bold text-text-1">
          {t("welcome", { name: me.name })}
        </h1>
        {me.organisation && <p className="mt-1 mb-0 text-body text-text-2">{me.organisation}</p>}
      </div>
      <Card tone="calm">
        <p className="m-0 text-body text-teal-ink">{t(`${role}.next`)}</p>
      </Card>
    </div>
  );
}
