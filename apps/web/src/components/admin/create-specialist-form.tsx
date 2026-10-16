"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Building2, IdCard, Mail, Phone, Plus, Stethoscope, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SPECIALISTS_KEY } from "@/components/admin/specialists-admin";
import { TemporaryPasswordReveal } from "@/components/admin/temporary-password-reveal";
import { FormAlert } from "@/components/auth/auth-screen";
import { Button, buttonClasses } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { api, unwrap } from "@/lib/api/client";
import { useErrorMessage } from "@/lib/api/error-message";
import { showApiError } from "@/lib/api/form-errors";
import type { components } from "@/lib/api/schema";
import { normalizePhone } from "@/lib/auth/rules";
import { Link } from "@/lib/i18n/navigation";

type Created = components["schemas"]["CreatedSpecialist"];

/** Admin onboarding of a specialist (COMPANION_SPEC §3.1). Shows the temporary password once. */
export function CreateSpecialistForm() {
  const t = useTranslations("admin.create");
  const tv = useTranslations("auth.validation");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const queryClient = useQueryClient();
  const [created, setCreated] = useState<Created | null>(null);

  const schema = useMemo(
    () =>
      z
        .object({
          name: z.string().trim().min(1, tv("required")),
          specialty: z.string().trim().min(1, tv("required")),
          registration_no: z.string().trim().min(1, tv("required")),
          organisation: z.string().trim(),
          email: z.union([z.literal(""), z.email(tv("email"))]),
          phone: z
            .string()
            .trim()
            .refine((v) => !v || normalizePhone(v) !== null, tv("phone")),
        })
        .refine((v) => v.email || v.phone, { message: tv("contactRequired"), path: ["email"] }),
    [tv],
  );
  const empty = {
    name: "",
    specialty: "",
    registration_no: "",
    organisation: "",
    email: "",
    phone: "",
  };
  const form = useForm({ resolver: zodResolver(schema), defaultValues: empty });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await unwrap(
        api.POST("/api/v1/admin/specialists", {
          body: {
            ...values,
            organisation: values.organisation || null,
            email: values.email || null,
            phone: values.phone || null,
          },
        }),
      );
      setCreated(result);
      form.reset(empty);
      void queryClient.invalidateQueries({ queryKey: SPECIALISTS_KEY });
    } catch (error) {
      showApiError(error, form.setError, errorMessage(error));
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin"
        className="inline-flex min-h-12 items-center gap-2 self-start font-semibold text-text-link hover:underline"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t("back")}
      </Link>
      <div>
        <h1 className="m-0 font-display text-h1 font-bold text-text-1">{t("title")}</h1>
        <p className="mt-1 mb-0 text-body text-text-2">{t("subtitle")}</p>
      </div>

      {created ? (
        <div className="flex flex-col gap-4">
          <TemporaryPasswordReveal
            name={created.specialist.name}
            password={created.temporary_password}
          />
          <div className="flex flex-wrap gap-2">
            <Link href="/admin" className={buttonClasses()}>
              {t("done")}
            </Link>
            <Button variant="secondary" icon={Plus} onClick={() => setCreated(null)}>
              {t("addAnother")}
            </Button>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
          <TextField
            label={t("name")}
            icon={User}
            placeholder={t("namePlaceholder")}
            error={errors.name?.message}
            {...form.register("name")}
          />
          <TextField
            label={t("specialty")}
            icon={Stethoscope}
            placeholder={t("specialtyPlaceholder")}
            error={errors.specialty?.message}
            {...form.register("specialty")}
          />
          <TextField
            label={t("registration")}
            icon={IdCard}
            hint={t("registrationHint")}
            error={errors.registration_no?.message}
            {...form.register("registration_no")}
          />
          <TextField
            label={t("organisation")}
            optionalLabel={tCommon("optional")}
            icon={Building2}
            placeholder={t("organisationPlaceholder")}
            error={errors.organisation?.message}
            {...form.register("organisation")}
          />
          <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
            <legend className="mb-1 p-0 text-small text-text-2">{t("contactHint")}</legend>
            <TextField
              label={t("email")}
              type="email"
              icon={Mail}
              autoComplete="off"
              error={errors.email?.message}
              {...form.register("email")}
            />
            <TextField
              label={t("phone")}
              type="tel"
              icon={Phone}
              autoComplete="off"
              error={errors.phone?.message}
              {...form.register("phone")}
            />
          </fieldset>
          <FormAlert message={errors.root?.message} />
          <Button type="submit" size="lg" icon={Plus} loading={isSubmitting} className="self-start">
            {t("submit")}
          </Button>
        </form>
      )}
    </div>
  );
}
