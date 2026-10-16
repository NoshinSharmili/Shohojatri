"use client";

import { BadgeCheck, Check } from "lucide-react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useState } from "react";

import { FormAlert } from "@/components/auth/auth-screen";
import { defaultOptions, ScopeOptions } from "@/components/care-team/scope-options";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";
import { useErrorMessage } from "@/lib/api/error-message";
import type { components } from "@/lib/api/schema";
import { type IncomingRequest, useDecideRequest } from "@/lib/care-team/queries";

type Person = components["schemas"]["Person"];

/** Name line for a teacher or specialist: who they are and where they work. */
export function PersonHeading({ person }: { person: Person }) {
  const t = useTranslations("careTeam");
  return (
    <b className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body font-semibold text-text-1">
      {person.name}
      <RoleBadge
        role={person.role}
        label={person.role === "specialist" ? (person.specialty ?? undefined) : undefined}
      />
      {person.verified && (
        <span className="inline-flex items-center gap-1 text-caption font-semibold text-leaf-ink">
          <BadgeCheck aria-hidden className="size-4" />
          {t("verified")}
        </span>
      )}
    </b>
  );
}

export function personDetails(person: Person, registration: (number: string) => string): string[] {
  return [
    person.organisation,
    person.registration_no && registration(person.registration_no),
  ].filter((part): part is string => Boolean(part));
}

/** A pending request: who's asking, their message, and the parent's scope choices
 *  (design `JoinRequest`). */
export function JoinRequest({ request }: { request: IncomingRequest }) {
  const t = useTranslations("careTeam");
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });
  const errorMessage = useErrorMessage();
  const decide = useDecideRequest();
  const { requester } = request;
  const [options, setOptions] = useState(() => defaultOptions(requester.role));
  const role = requester.role === "teacher" ? "teacher" : "specialist";
  const details = personDetails(requester, (number) => t("registration", { number }));

  return (
    <article className="flex flex-col gap-3 rounded-leaf bg-amber-50 px-4.5 py-4">
      <div className="flex items-start gap-3">
        <Avatar name={requester.name} size={48} />
        <div className="min-w-0 flex-1">
          <PersonHeading person={requester} />
          {details.length > 0 && (
            <p className="m-0 mt-0.5 text-small text-text-2">{details.join(" · ")}</p>
          )}
          <p className="m-0 text-small text-text-2">
            {t("requestedWith", {
              code: request.child_code,
              time: format.relativeTime(new Date(request.created_at), now),
            })}
          </p>
        </div>
      </div>
      {request.message && (
        <blockquote className="m-0 rounded-md bg-white/70 px-3.5 py-2.5 text-[15px] text-text-1">
          {request.message}
        </blockquote>
      )}
      <p className="m-0 text-[15px] font-semibold text-amber-ink">{t("canSee")}</p>
      <ScopeOptions role={role} value={options} onChange={setOptions} />
      <FormAlert message={decide.error ? errorMessage(decide.error) : undefined} />
      <div className="flex flex-wrap gap-2">
        <Button
          icon={Check}
          loading={decide.isPending && decide.variables?.approve}
          disabled={decide.isPending}
          onClick={() => decide.mutate({ id: request.id, approve: true, options })}
        >
          {t("approve")}
        </Button>
        <Button
          variant="ghost"
          loading={decide.isPending && !decide.variables?.approve}
          disabled={decide.isPending}
          onClick={() => decide.mutate({ id: request.id, approve: false })}
        >
          {t("decline")}
        </Button>
      </div>
    </article>
  );
}
