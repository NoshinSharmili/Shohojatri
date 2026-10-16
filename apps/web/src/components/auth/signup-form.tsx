"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Phone, School, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { AltLink, AuthScreen, FormAlert } from "@/components/auth/auth-screen";
import type { SignupRole } from "@/components/auth/role-choice";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";
import { Tabs } from "@/components/ui/tabs";
import { TextField } from "@/components/ui/text-field";
import { api, unwrap } from "@/lib/api/client";
import { useErrorMessage } from "@/lib/api/error-message";
import { showApiError } from "@/lib/api/form-errors";
import { normalizePhone, passwordIsAcceptable } from "@/lib/auth/rules";
import { homePathFor, useSetMe } from "@/lib/auth/session";
import { useRouter } from "@/lib/i18n/navigation";
import type { routing } from "@/lib/i18n/routing";

type Via = "phone" | "email";
type Locale = (typeof routing.locales)[number];

/** Sign up as parent or teacher (design Onboarding 03a/03b). Logs in on success. */
export function SignupForm({ role }: { role: SignupRole }) {
  const t = useTranslations("auth.signup");
  const tv = useTranslations("auth.validation");
  const errorMessage = useErrorMessage();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const setMe = useSetMe();
  const teacher = role === "teacher";

  const schema = useMemo(
    () =>
      z
        .object({
          name: z.string().trim().min(1, tv("required")),
          school: teacher ? z.string().trim().min(1, tv("required")) : z.string(),
          via: z.enum(["phone", "email"]),
          contact: z.string().trim(),
          password: z.string().refine(passwordIsAcceptable, tv("passwordRules")),
        })
        .superRefine(({ via, contact }, ctx) => {
          const ok =
            via === "email"
              ? z.email().safeParse(contact).success
              : normalizePhone(contact) !== null;
          if (!ok) ctx.addIssue({ code: "custom", path: ["contact"], message: tv(via) });
        }),
    [tv, teacher],
  );
  const form = useForm({
    resolver: zodResolver(schema),
    // Parents mostly have a phone; schools mostly use email (design default per role).
    defaultValues: {
      name: "",
      school: "",
      via: (teacher ? "email" : "phone") as Via,
      contact: "",
      password: "",
    },
  });
  const { errors, isSubmitting } = form.formState;
  const via = useWatch({ control: form.control, name: "via" });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await unwrap(
        api.POST("/api/v1/auth/signup", {
          body: {
            role,
            name: values.name,
            organisation: teacher ? values.school : null,
            email: values.via === "email" ? values.contact : null,
            phone: values.via === "phone" ? values.contact : null,
            password: values.password,
            preferred_locale: locale,
          },
        }),
      );
      setMe(user);
      router.replace(homePathFor(user));
    } catch (error) {
      showApiError(error, form.setError, errorMessage(error), {
        email: "contact",
        phone: "contact",
        organisation: "school",
      });
    }
  });

  return (
    <AuthScreen
      backHref="/signup"
      eyebrow={<RoleBadge role={role} label={t(teacher ? "roleTeacher" : "roleParent")} />}
      title={t("title")}
      subtitle={teacher ? undefined : t("subtitle")}
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col gap-5">
        <TextField
          label={t("name")}
          icon={User}
          placeholder={t(teacher ? "namePlaceholderTeacher" : "namePlaceholderParent")}
          autoComplete="name"
          error={errors.name?.message}
          {...form.register("name")}
        />
        {teacher && (
          <TextField
            label={t("school")}
            icon={School}
            placeholder={t("schoolPlaceholder")}
            autoComplete="organization"
            error={errors.school?.message}
            {...form.register("school")}
          />
        )}
        <div className="flex flex-col gap-2.5">
          <Tabs
            label={t("contactVia")}
            idPrefix="signup-contact"
            value={via}
            onChange={(next) => {
              form.setValue("via", next);
              form.resetField("contact");
            }}
            items={[
              { id: "phone", label: t("phone"), icon: Phone },
              { id: "email", label: t("email"), icon: Mail },
            ]}
          />
          <div
            role="tabpanel"
            id={`signup-contact-panel-${via}`}
            aria-labelledby={`signup-contact-tab-${via}`}
          >
            {via === "phone" ? (
              <TextField
                key="phone"
                label={t("phoneLabel")}
                type="tel"
                icon={Phone}
                placeholder={t("phonePlaceholder")}
                autoComplete="tel-national"
                error={errors.contact?.message}
                {...form.register("contact")}
              />
            ) : (
              <TextField
                key="email"
                label={t("emailLabel")}
                type="email"
                icon={Mail}
                placeholder={t("emailPlaceholder")}
                autoComplete="email"
                error={errors.contact?.message}
                {...form.register("contact")}
              />
            )}
          </div>
        </div>
        <TextField
          label={t("password")}
          type="password"
          icon={Lock}
          hint={t("passwordHint")}
          autoComplete="new-password"
          error={errors.password?.message}
          {...form.register("password")}
        />
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <FormAlert message={errors.root?.message} />
          <Button type="submit" size="lg" block loading={isSubmitting}>
            {t("submit")}
          </Button>
          <AltLink question={t("haveAccount")} label={t("login")} href="/login" />
        </div>
      </form>
    </AuthScreen>
  );
}
