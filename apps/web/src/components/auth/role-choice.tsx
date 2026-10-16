"use client";

import { ArrowRight, HeartHandshake, School, Stethoscope } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AltLink, AuthScreen } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/ui/choice-card";
import { Link, useRouter } from "@/lib/i18n/navigation";

export type SignupRole = "parent" | "teacher";

/** Choose role before signing up (design Onboarding 02). Specialists are sent to login. */
export function RoleChoice() {
  const t = useTranslations("auth.role");
  const router = useRouter();
  const [role, setRole] = useState<SignupRole>("parent");

  return (
    <AuthScreen backHref="/" title={t("title")} subtitle={t("subtitle")}>
      <form
        className="flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          router.push(`/signup?role=${role}`);
        }}
      >
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="sr-only">{t("title")}</legend>
          <ChoiceCard
            name="role"
            value="parent"
            icon={HeartHandshake}
            label={t("parent")}
            description={t("parentDescription")}
            selected={role === "parent"}
            onSelect={() => setRole("parent")}
          />
          <ChoiceCard
            name="role"
            value="teacher"
            icon={School}
            label={t("teacher")}
            description={t("teacherDescription")}
            selected={role === "teacher"}
            onSelect={() => setRole("teacher")}
          />
        </fieldset>

        <div className="mt-7 flex items-start gap-3 border-t border-border-1 px-1 pt-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-role-specialist-bg text-role-specialist">
            <Stethoscope aria-hidden className="size-5.5" />
          </span>
          <p className="m-0 text-[15px] text-text-2">
            <strong className="font-semibold text-text-1">{t("specialistQuestion")}</strong>{" "}
            {t("specialistAnswer")}
            <br />
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center gap-1 font-semibold text-text-link hover:underline"
            >
              {t("specialistLink")}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Button type="submit" size="lg" block iconRight={ArrowRight}>
            {t("continue")}
          </Button>
          <AltLink question={t("haveAccount")} label={t("login")} href="/login" />
        </div>
      </form>
    </AuthScreen>
  );
}
