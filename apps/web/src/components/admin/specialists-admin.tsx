"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  CircleCheck,
  CirclePause,
  Hourglass,
  KeyRound,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { TemporaryPasswordReveal } from "@/components/admin/temporary-password-reveal";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StateView } from "@/components/ui/state-view";
import { api, unwrap } from "@/lib/api/client";
import { useErrorMessage } from "@/lib/api/error-message";
import type { components } from "@/lib/api/schema";
import { formatPhone } from "@/lib/auth/rules";
import { cx } from "@/lib/cx";
import { Link } from "@/lib/i18n/navigation";

type Specialist = components["schemas"]["SpecialistOut"];

export const SPECIALISTS_KEY = ["admin", "specialists"] as const;

/** Admin home: onboarded specialists, deactivate/reactivate, re-issue a temporary password. */
export function SpecialistsAdmin() {
  const t = useTranslations("admin.specialists");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const specialists = useQuery({
    queryKey: SPECIALISTS_KEY,
    queryFn: () => unwrap(api.GET("/api/v1/admin/specialists")),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 font-display text-h1 font-bold text-text-1">{t("title")}</h1>
          <p className="mt-1 mb-0 text-body text-text-2">{t("subtitle")}</p>
        </div>
        <Link href="/admin/specialists/new" className={buttonClasses()}>
          <Plus aria-hidden className="size-5" />
          {t("add")}
        </Link>
      </div>

      {specialists.isPending ? (
        <StateView kind="loading" title={tCommon("loading")} />
      ) : specialists.isError ? (
        <StateView
          kind="error"
          message={errorMessage(specialists.error)}
          action={
            <Button variant="secondary" onClick={() => void specialists.refetch()}>
              {tCommon("retry")}
            </Button>
          }
        />
      ) : specialists.data.length === 0 ? (
        <StateView kind="empty" title={t("emptyTitle")} message={t("emptyMessage")} />
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
          {specialists.data.map((specialist) => (
            <li key={specialist.id}>
              <SpecialistCard specialist={specialist} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SpecialistCard({ specialist }: { specialist: Specialist }) {
  const t = useTranslations("admin.specialists");
  const locale = useLocale();
  const format = useFormatter();
  const errorMessage = useErrorMessage();
  const queryClient = useQueryClient();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const setActive = useMutation({
    mutationFn: (isActive: boolean) =>
      unwrap(
        api.PATCH("/api/v1/admin/specialists/{user_id}", {
          params: { path: { user_id: specialist.id } },
          body: { is_active: isActive },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SPECIALISTS_KEY }),
  });
  const resetPassword = useMutation({
    mutationFn: () =>
      unwrap(
        api.POST("/api/v1/admin/users/{user_id}/temporary-password", {
          params: { path: { user_id: specialist.id } },
        }),
      ),
    onSuccess: () => {
      setConfirmingReset(false);
      void queryClient.invalidateQueries({ queryKey: SPECIALISTS_KEY });
    },
  });
  const error = setActive.error ?? resetPassword.error;

  return (
    <Card className={cx("flex h-full flex-col gap-3", !specialist.is_active && "bg-n-50")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="m-0 flex items-center gap-1.5 font-display text-h3 font-bold text-text-1">
            {specialist.name}
            {specialist.verified && (
              <BadgeCheck aria-label={t("verified")} className="size-5 shrink-0 text-leaf-ink" />
            )}
          </p>
          <p className="m-0 text-small text-text-2">{specialist.specialty}</p>
        </div>
        <StatusChip specialist={specialist} />
      </div>

      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-small">
        <dt className="text-text-3">{t("registration")}</dt>
        <dd className="m-0 text-text-1" lang="en">
          {specialist.registration_no}
        </dd>
        {specialist.organisation && (
          <>
            <dt className="text-text-3">{t("organisation")}</dt>
            <dd className="m-0 text-text-1">{specialist.organisation}</dd>
          </>
        )}
        <dt className="text-text-3">{t("contact")}</dt>
        <dd className="m-0 flex min-w-0 flex-col text-text-1">
          {specialist.email && <span className="break-all">{specialist.email}</span>}
          {specialist.phone && <span>{formatPhone(specialist.phone, locale)}</span>}
        </dd>
        <dt className="text-text-3">{t("added")}</dt>
        <dd className="m-0 text-text-1">
          {format.dateTime(new Date(specialist.created_at), { dateStyle: "medium" })}
        </dd>
      </dl>

      {resetPassword.data && (
        <TemporaryPasswordReveal
          name={specialist.name}
          password={resetPassword.data.temporary_password}
        />
      )}
      {error && (
        <p role="alert" className="m-0 text-small text-danger">
          {errorMessage(error)}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {confirmingReset ? (
          <>
            <p className="m-0 w-full text-small text-text-2">
              {t("resetConfirm", { name: specialist.name })}
            </p>
            <Button
              size="sm"
              icon={KeyRound}
              loading={resetPassword.isPending}
              onClick={() => resetPassword.mutate()}
            >
              {t("resetYes")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmingReset(false)}>
              {t("cancel")}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              size="sm"
              loading={setActive.isPending}
              onClick={() => setActive.mutate(!specialist.is_active)}
            >
              {specialist.is_active ? t("deactivate") : t("reactivate")}
            </Button>
            {specialist.is_active && (
              <Button
                variant="ghost"
                size="sm"
                icon={KeyRound}
                onClick={() => setConfirmingReset(true)}
              >
                {t("reset")}
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

function StatusChip({ specialist }: { specialist: Specialist }) {
  const t = useTranslations("admin.specialists.status");
  const [key, Icon, className]: [string, LucideIcon, string] = !specialist.is_active
    ? ["inactive", CirclePause, "bg-n-100 text-text-2"]
    : specialist.must_change_password
      ? ["pending", Hourglass, "bg-amber-50 text-amber-ink"]
      : ["active", CircleCheck, "bg-leaf-50 text-leaf-ink"];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-caption font-semibold whitespace-nowrap",
        className,
      )}
    >
      <Icon aria-hidden className="size-4" />
      {t(key as "active")}
    </span>
  );
}
