"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Circle, CircleCheck, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { AuthScreen, FormAlert } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";
import { TextField } from "@/components/ui/text-field";
import { api, unwrap } from "@/lib/api/client";
import { useErrorMessage } from "@/lib/api/error-message";
import { showApiError } from "@/lib/api/form-errors";
import { passwordChecks, passwordIsAcceptable } from "@/lib/auth/rules";
import { homePathFor, useLogout, useMe, useSetMe } from "@/lib/auth/session";
import { cx } from "@/lib/cx";
import { useRouter } from "@/lib/i18n/navigation";

/** First login with a temporary password: set your own (design Onboarding 04b). */
export function SetPasswordForm() {
  const t = useTranslations("auth.setPassword");
  const tv = useTranslations("auth.validation");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const setMe = useSetMe();
  const logout = useLogout();
  // Rendered inside PendingPasswordOnly, so the user is loaded.
  const me = useMe().data;

  const schema = useMemo(
    () =>
      z
        .object({
          password: z.string().refine(passwordIsAcceptable, tv("passwordRules")),
          confirm: z.string(),
        })
        .refine((v) => v.password === v.confirm, { message: tv("mismatch"), path: ["confirm"] }),
    [tv],
  );
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });
  const { errors, isSubmitting } = form.formState;
  const [password, confirm] = useWatch({ control: form.control, name: ["password", "confirm"] });
  const checks = passwordChecks(password);
  const rules = [
    { key: "minLength", met: checks.minLength },
    { key: "digit", met: checks.digit },
    { key: "match", met: password.length > 0 && password === confirm },
  ] as const;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await unwrap(
        api.POST("/api/v1/auth/change-password", { body: { new_password: values.password } }),
      );
      setMe(user);
      router.replace(homePathFor(user));
    } catch (error) {
      showApiError(error, form.setError, errorMessage(error), { new_password: "password" });
    }
  });

  if (!me) return null;
  return (
    <AuthScreen
      eyebrow={
        <>
          <RoleBadge role={me.role} />
          <span className="font-semibold text-leaf-ink">{t("welcome", { name: me.name })}</span>
        </>
      }
      title={t("title")}
      subtitle={t("subtitle")}
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col gap-5">
        <TextField
          label={t("newPassword")}
          type="password"
          icon={Lock}
          autoComplete="new-password"
          error={errors.password?.message}
          {...form.register("password")}
        />
        <TextField
          label={t("confirm")}
          type="password"
          icon={Lock}
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...form.register("confirm")}
        />
        <ul aria-label={t("rulesLabel")} className="m-0 flex list-none flex-col gap-2 p-0">
          {rules.map(({ key, met }) => (
            <li
              key={key}
              className={cx(
                "flex items-center gap-2.5 text-[15px]",
                met ? "text-leaf-ink" : "text-text-2",
              )}
            >
              {met ? (
                <CircleCheck aria-hidden className="size-5" />
              ) : (
                <Circle aria-hidden className="size-5" />
              )}
              <span>{t(`rules.${key}`)}</span>
              <span className="sr-only">{met ? t("ruleMet") : t("ruleNotMet")}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <FormAlert message={errors.root?.message} />
          <Button type="submit" size="lg" block icon={Check} loading={isSubmitting}>
            {t("submit")}
          </Button>
          <Button variant="ghost" onClick={() => void logout()}>
            {t("notYou")}
          </Button>
        </div>
      </form>
    </AuthScreen>
  );
}
