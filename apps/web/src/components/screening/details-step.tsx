"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Calendar, Hourglass, Info, Smile, UserPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { QueryView } from "@/components/app/query-view";
import { FormAlert } from "@/components/auth/auth-screen";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChipOption } from "@/components/ui/chip-option";
import { ChoiceCard } from "@/components/ui/choice-card";
import { Sheet } from "@/components/ui/sheet";
import { TextField } from "@/components/ui/text-field";
import { ApiRequestError } from "@/lib/api/client";
import { useErrorMessage } from "@/lib/api/error-message";
import { showApiError } from "@/lib/api/form-errors";
import {
  type ChildSummary,
  useChildren,
  useCreateChild,
  useFormatAge,
} from "@/lib/children/queries";
import { ageInMonths, todayInBangladesh } from "@/lib/dates";
import { Link, useRouter } from "@/lib/i18n/navigation";
import {
  useChildScreenings,
  useCreateScreening,
  useDeleteScreening,
} from "@/lib/screening/queries";
import {
  type AgeFit,
  ageFit,
  AGE_RANGE,
  INFORMANTS,
  type ScreeningSummary,
} from "@/lib/screening/rules";

import { FlowPage } from "./flow-page";

const NEW_CHILD = "new";
const SEXES = ["female", "male", "unsaid"] as const;
const FORM_ID = "screening-details";

/** Step 1: who the screening is for (an existing child or a new one) and who is answering. */
export function DetailsStep({ preselect }: { preselect: number | null }) {
  const t = useTranslations("screening.details");
  const children = useChildren();
  return (
    <QueryView query={children}>
      {(list) => (
        <DetailsForm
          childList={list}
          preselect={preselect}
          title={t("title")}
          subtitle={t("subtitle")}
        />
      )}
    </QueryView>
  );
}

function DetailsForm({
  childList,
  preselect,
  title,
  subtitle,
}: {
  childList: ChildSummary[];
  preselect: number | null;
  title: string;
  subtitle: string;
}) {
  const t = useTranslations("screening.details");
  const tChild = useTranslations("children.new");
  const tv = useTranslations("auth.validation");
  const tCommon = useTranslations("common");
  const locale = useLocale() === "en" ? "en" : "bn";
  const formatAge = useFormatAge();
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const createChild = useCreateChild();
  const createScreening = useCreateScreening();
  const today = todayInBangladesh();

  const schema = useMemo(
    () =>
      z
        .object({
          child: z.string().min(1, t("childRequired")),
          name: z.string().trim(),
          dob: z.string(),
          sex: z.enum(SEXES),
          informant: z.enum(INFORMANTS, { error: t("informantRequired") }),
        })
        .superRefine((values, ctx) => {
          if (values.child !== NEW_CHILD) return;
          if (!values.name)
            ctx.addIssue({ code: "custom", path: ["name"], message: tv("required") });
          if (!values.dob) ctx.addIssue({ code: "custom", path: ["dob"], message: tv("required") });
        }),
    [t, tv],
  );

  const initialChild =
    preselect !== null && childList.some((c) => c.id === preselect)
      ? String(preselect)
      : childList.length === 0
        ? NEW_CHILD
        : childList.length === 1
          ? String(childList[0].id)
          : "";
  const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { child: initialChild, name: "", dob: "", sex: "unsaid" },
  });
  const { errors, isSubmitting } = form.formState;
  const [childChoice, dob, sex, informant] = useWatch({
    control: form.control,
    name: ["child", "dob", "sex", "informant"],
  });

  const existing = childList.find((c) => String(c.id) === childChoice) ?? null;
  const months = existing ? existing.age_months : dob ? ageInMonths(dob, today) : null;
  const fit = months === null ? null : ageFit(months);
  const openScreening = useOpenScreening(existing?.id ?? null);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      let childId = existing?.id;
      if (childId === undefined) {
        const child = await createChild.mutateAsync({
          name: values.name,
          dob: values.dob,
          sex: values.sex === "unsaid" ? null : values.sex,
        });
        childId = child.id;
        // A retry after a failure below must not add the child twice.
        form.setValue("child", String(child.id));
      }
      const screening = await createScreening.mutateAsync({
        child_id: childId,
        locale,
        informant: values.informant,
      });
      router.push(`/screening/${screening.id}/consent`);
    } catch (error) {
      const openId = openScreeningId(error);
      if (openId !== null) return router.push(`/screening/${openId}`);
      showApiError(error, form.setError, errorMessage(error));
    }
  });

  return (
    <FlowPage
      back={{ href: "/home", label: tCommon("back") }}
      step="details"
      title={title}
      subtitle={subtitle}
      footer={
        !openScreening && (
          <Button
            type="submit"
            form={FORM_ID}
            size="lg"
            block
            iconRight={ArrowRight}
            loading={isSubmitting}
            disabled={fit === "blocked"}
          >
            {t("submit")}
          </Button>
        )
      }
    >
      <form id={FORM_ID} noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
        {childList.length > 0 && (
          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2.5 p-0 text-[15px] font-semibold text-text-1">
              {t("whoFor")}
            </legend>
            {childList.map((child) => (
              <ChoiceCard
                key={child.id}
                name="child"
                value={String(child.id)}
                label={child.name}
                description={formatAge(child.age_months)}
                selected={childChoice === String(child.id)}
                onSelect={(value) => form.setValue("child", value, { shouldValidate: true })}
              />
            ))}
            <ChoiceCard
              name="child"
              value={NEW_CHILD}
              label={t("anotherChild")}
              description={t("anotherChildHint")}
              icon={UserPlus}
              selected={childChoice === NEW_CHILD}
              onSelect={(value) => form.setValue("child", value, { shouldValidate: true })}
            />
            {errors.child?.message && (
              <p className="m-0 text-small text-danger">{errors.child.message}</p>
            )}
          </fieldset>
        )}

        {childChoice === NEW_CHILD && (
          <div className="flex flex-col gap-5">
            <TextField
              label={tChild("name")}
              icon={Smile}
              hint={tChild("nameHint")}
              placeholder={tChild("namePlaceholder")}
              autoComplete="off"
              error={errors.name?.message}
              {...form.register("name")}
            />
            <TextField
              label={tChild("dob")}
              type="date"
              icon={Calendar}
              max={today}
              hint={months !== null ? t("ageHint", { age: formatAge(months) }) : undefined}
              error={errors.dob?.message}
              {...form.register("dob")}
            />
            <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
              <legend className="mb-2 p-0 text-[15px] font-semibold text-text-1">
                {tChild("sex")}{" "}
                <span className="text-small font-normal text-text-3">{tCommon("optional")}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {SEXES.map((option) => (
                  <ChipOption
                    key={option}
                    label={tChild(option)}
                    value={option}
                    selected={sex === option}
                    {...form.register("sex")}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {fit && fit !== "ok" && months !== null && <AgeNotice fit={fit} months={months} />}

        {openScreening && existing ? (
          <OpenScreeningCard childName={existing.name} screening={openScreening} />
        ) : (
          fit !== "blocked" && (
            <fieldset className="m-0 flex flex-col border-0 p-0">
              <legend className="p-0 text-[15px] font-semibold text-text-1">
                {t("informant")}
              </legend>
              <p className="mt-0.5 mb-2.5 text-small text-text-2">{t("informantHint")}</p>
              <div className="flex flex-wrap gap-2">
                {INFORMANTS.map((option) => (
                  <ChipOption
                    key={option}
                    label={t(`informants.${option}`)}
                    value={option}
                    selected={informant === option}
                    {...form.register("informant")}
                  />
                ))}
              </div>
              {errors.informant?.message && (
                <p className="mt-2 mb-0 text-small text-danger">{errors.informant.message}</p>
              )}
            </fieldset>
          )
        )}
        <FormAlert message={errors.root?.message} />
      </form>
    </FlowPage>
  );
}

/** The child's unfinished screening, if any: one at a time per child. */
function useOpenScreening(childId: number | null): ScreeningSummary | null {
  const screenings = useChildScreenings(childId);
  return screenings.data?.find((s) => s.status === "in_progress") ?? null;
}

function openScreeningId(error: unknown): number | null {
  if (!(error instanceof ApiRequestError) || error.code !== "screening_in_progress") return null;
  const id = error.body?.error.detail?.screening_id;
  return typeof id === "number" ? id : null;
}

function AgeNotice({ fit, months }: { fit: Exclude<AgeFit, "ok">; months: number }) {
  const t = useTranslations("screening.details");
  if (fit === "blocked") {
    return (
      <Card tone="warm" role="alert" className="flex flex-col gap-1.5">
        <p className="m-0 font-display text-h3 font-bold text-text-1">{t("ageBlockedTitle")}</p>
        <p className="m-0 text-body text-text-1">
          {months < AGE_RANGE.min ? t("ageBlockedYoung") : t("ageBlockedOld")}
        </p>
      </Card>
    );
  }
  return (
    <Card tone="sky" className="flex gap-3 p-4">
      <Info aria-hidden className="mt-1 size-5 shrink-0 text-navy" />
      <p className="m-0 text-[15px] leading-[1.6] text-text-1">
        {fit === "younger" ? t("ageYounger") : t("ageOlder")}
      </p>
    </Card>
  );
}

function OpenScreeningCard({
  childName,
  screening,
}: {
  childName: string;
  screening: ScreeningSummary;
}) {
  const t = useTranslations("screening.details");
  const errorMessage = useErrorMessage();
  const deleteScreening = useDeleteScreening();
  const [confirming, setConfirming] = useState(false);

  return (
    <Card tone="warm" className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Hourglass aria-hidden className="mt-1 size-5 shrink-0 text-amber-ink" />
        <div>
          <p className="m-0 font-semibold text-text-1">{t("openTitle", { name: childName })}</p>
          <p className="m-0 text-[15px] text-text-2">
            {t("openBody", { answered: screening.answered, total: screening.total })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/screening/${screening.id}`} className={buttonClasses()}>
          {t("openContinue")}
        </Link>
        <Button variant="ghost" onClick={() => setConfirming(true)}>
          {t("openRestart")}
        </Button>
      </div>
      <Sheet
        open={confirming}
        title={t("restartTitle")}
        onClose={() => setConfirming(false)}
        closeLabel={t("close")}
        footer={
          <>
            <Button
              variant="danger"
              block
              loading={deleteScreening.isPending}
              onClick={() =>
                deleteScreening.mutate(screening.id, { onSuccess: () => setConfirming(false) })
              }
            >
              {t("restartConfirm")}
            </Button>
            <Button variant="ghost" block onClick={() => setConfirming(false)}>
              {t("restartCancel")}
            </Button>
          </>
        }
      >
        <p className="m-0 text-body text-text-2">{t("restartBody")}</p>
        {deleteScreening.isError && <FormAlert message={errorMessage(deleteScreening.error)} />}
      </Sheet>
    </Card>
  );
}
