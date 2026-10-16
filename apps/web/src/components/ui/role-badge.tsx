import { HeartHandshake, School, ShieldCheck, Stethoscope, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Role } from "@/lib/auth/session";
import { cx } from "@/lib/cx";

const ROLES: Record<Role, { icon: LucideIcon; className: string }> = {
  parent: { icon: HeartHandshake, className: "bg-role-parent-bg text-role-parent" },
  teacher: { icon: School, className: "bg-role-teacher-bg text-role-teacher" },
  specialist: { icon: Stethoscope, className: "bg-role-specialist-bg text-role-specialist" },
  // Not in the design's RoleBadge (admins never appear next to child data); neutral styling.
  admin: { icon: ShieldCheck, className: "bg-n-100 text-text-2" },
};

/** Author/user role pill (design handoff `RoleBadge`): icon + label, never colour alone. */
export function RoleBadge({ role, label }: { role: Role; label?: string }) {
  const t = useTranslations("common.roles");
  const { icon: Icon, className } = ROLES[role];
  return (
    <span
      className={cx(
        "inline-flex h-7 items-center gap-1.25 whitespace-nowrap rounded-pill pr-2.5 pl-2 text-caption font-semibold leading-none",
        className,
      )}
    >
      <Icon aria-hidden className="size-3.75" strokeWidth={2.25} />
      {label ?? t(role)}
    </span>
  );
}
