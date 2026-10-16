"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Stethoscope, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AltLink, AuthScreen, FormAlert } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { api, unwrap } from "@/lib/api/client";
import { useErrorMessage } from "@/lib/api/error-message";
import { showApiError } from "@/lib/api/form-errors";
import { homePathFor, safeNextPath, useSaveLocale, useSetMe } from "@/lib/auth/session";
import { useRouter } from "@/lib/i18n/navigation";
import type { routing } from "@/lib/i18n/routing";

type Locale = (typeof routing.locales)[number];

/** Log in (design Onboarding 04a). `next` is where to return after login. */
export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("auth.login");
  const tv = useTranslations("auth.validation");
  const errorMessage = useErrorMessage();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const setMe = useSetMe();
  const saveLocale = useSaveLocale();

  const schema = useMemo(
    () =>
      z.object({
        identifier: z.string().trim().min(1, tv("required")),
        password: z.string().min(1, tv("required")),
      }),
    [tv],
  );
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await unwrap(api.POST("/api/v1/auth/login", { body: values }));
      setMe(user);
      // The language used to log in becomes the remembered one (CLAUDE.md §6).
      saveLocale(locale);
      const nextPath = user.must_change_password ? null : safeNextPath(next);
      router.replace(nextPath ?? homePathFor(user));
    } catch (error) {
      showApiError(error, form.setError, errorMessage(error));
    }
  });

  return (
    <AuthScreen title={t("title")} subtitle={t("subtitle")}>
      <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col gap-5">
        <TextField
          label={t("identifier")}
          icon={User}
          placeholder={t("identifierPlaceholder")}
          autoComplete="username"
          inputMode="email"
          error={errors.identifier?.message}
          {...form.register("identifier")}
        />
        <div className="flex flex-col gap-1">
          <TextField
            label={t("password")}
            type="password"
            icon={Lock}
            autoComplete="current-password"
            error={errors.password?.message}
            {...form.register("password")}
          />
          <details className="self-end text-right">
            <summary className="inline-flex min-h-12 cursor-pointer items-center px-2 font-semibold text-text-link">
              {t("forgot")}
            </summary>
            <p className="m-0 max-w-[36ch] text-small text-text-2">{t("forgotHelp")}</p>
          </details>
        </div>
        <Card tone="calm" className="flex gap-2.5 p-3.5 text-[15px] text-teal-ink">
          <Stethoscope aria-hidden className="mt-1 size-5 shrink-0" />
          <span>{t("specialistNote")}</span>
        </Card>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <FormAlert message={errors.root?.message} />
          <Button type="submit" size="lg" block loading={isSubmitting}>
            {t("submit")}
          </Button>
          <AltLink question={t("newHere")} label={t("createAccount")} href="/signup" />
        </div>
      </form>
    </AuthScreen>
  );
}
