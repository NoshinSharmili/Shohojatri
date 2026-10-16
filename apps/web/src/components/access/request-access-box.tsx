"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, IdCard, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormAlert } from "@/components/auth/auth-screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextAreaField, TextField } from "@/components/ui/text-field";
import { useSendRequest } from "@/lib/access/queries";
import { useErrorMessage } from "@/lib/api/error-message";
import { showApiError } from "@/lib/api/form-errors";

/** "Request access to a child" (COMPANION_SPEC §3.1). The confirmation is deliberately the same
 *  whether or not the ID exists, so it can't be used to look up children. */
export function RequestAccessBox({ initialCode = "" }: { initialCode?: string }) {
  const t = useTranslations("access");
  const tv = useTranslations("auth.validation");
  const tCommon = useTranslations("common");
  const errorMessage = useErrorMessage();
  const send = useSendRequest();
  const [sent, setSent] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        child_code: z.string().trim().min(1, tv("required")),
        message: z.string().trim().max(300),
      }),
    [tv],
  );
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { child_code: initialCode, message: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    setSent(false);
    try {
      await send.mutateAsync({ child_code: values.child_code, message: values.message || null });
      form.reset({ child_code: "", message: "" });
      setSent(true);
    } catch (error) {
      showApiError(error, form.setError, errorMessage(error));
    }
  });

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="m-0 font-display text-h3 font-bold text-text-1">{t("requestTitle")}</h2>
        <p className="mt-1 mb-0 text-small text-text-2">{t("requestHint")}</p>
      </div>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <TextField
          label={t("code")}
          icon={IdCard}
          placeholder={t("codePlaceholder")}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          lang="en"
          error={errors.child_code?.message}
          {...form.register("child_code")}
        />
        <TextAreaField
          label={t("message")}
          optionalLabel={tCommon("optional")}
          placeholder={t("messagePlaceholder")}
          maxLength={300}
          rows={2}
          error={errors.message?.message}
          {...form.register("message")}
        />
        <FormAlert message={errors.root?.message} />
        <Button type="submit" icon={Send} loading={isSubmitting} className="self-start">
          {t("submit")}
        </Button>
      </form>
      {sent && (
        <div role="status" className="flex gap-2.5 rounded-md bg-leaf-50 px-4 py-3 text-leaf-ink">
          <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" />
          <p className="m-0 text-[15px]">
            <b className="block font-semibold">{t("sentTitle")}</b>
            {t("sent")}
          </p>
        </div>
      )}
    </Card>
  );
}
