"use client";

import { FileText, Pill, Settings2, UserMinus } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import { FormAlert } from "@/components/auth/auth-screen";
import { PersonHeading, personDetails } from "@/components/care-team/join-request";
import { type Options, ScopeOptions } from "@/components/care-team/scope-options";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { RoleBadge } from "@/components/ui/role-badge";
import { Sheet } from "@/components/ui/sheet";
import { useErrorMessage } from "@/lib/api/error-message";
import { type Grant, useRevokeGrant, useUpdateGrant } from "@/lib/care-team/queries";

const ROW = "flex items-center gap-3.5 border-b border-border-1 px-4 py-3.5 last:border-b-0";

/** The parent and everyone they approved, with what each can see (design `CareTeamList`). */
export function CareTeamList({
  parentName,
  childName,
  grants,
}: {
  parentName: string;
  childName: string;
  grants: Grant[];
}) {
  const t = useTranslations("careTeam");
  return (
    <div className="flex flex-col gap-3">
      <ul className="m-0 list-none overflow-hidden rounded-lg border border-[rgba(0,60,120,.06)] bg-white p-0 shadow-sm">
        <li className={ROW}>
          <Avatar name={parentName} size={48} />
          <div className="min-w-0 flex-1">
            <b className="flex flex-wrap items-center gap-2 text-body font-semibold text-text-1">
              {t("you", { name: parentName })}
              <RoleBadge role="parent" />
            </b>
            <span className="text-small text-text-2">{t("owner")}</span>
          </div>
        </li>
        {grants.map((grant) => (
          <MemberRow key={grant.id} grant={grant} />
        ))}
      </ul>
      {grants.length === 0 && (
        <p className="m-0 text-small text-text-2">{t("emptyMembers", { name: childName })}</p>
      )}
    </div>
  );
}

function MemberRow({ grant }: { grant: Grant }) {
  const t = useTranslations("careTeam");
  const format = useFormatter();
  const [sheet, setSheet] = useState<"edit" | "remove" | null>(null);
  const { member } = grant;
  const details = personDetails(member, (number) => t("registration", { number }));
  const joined = t("joined", {
    date: format.dateTime(new Date(grant.granted_at), { dateStyle: "medium" }),
  });

  return (
    <li className={ROW}>
      <Avatar name={member.name} size={48} />
      <div className="min-w-0 flex-1">
        <PersonHeading person={member} />
        <span className="block text-small text-text-2">{[...details, joined].join(" · ")}</span>
        <span className="mt-1.5 flex flex-wrap gap-1.5">
          {grant.share_medications && <Tag icon={Pill} label={t("tags.medications")} />}
          {grant.share_documents && <Tag icon={FileText} label={t("tags.documents")} />}
        </span>
      </div>
      <IconButton
        icon={Settings2}
        label={t("edit", { name: member.name })}
        onClick={() => setSheet("edit")}
      />
      <IconButton
        icon={UserMinus}
        label={t("remove")}
        className="text-danger"
        onClick={() => setSheet("remove")}
      />
      {sheet === "edit" && <EditSheet grant={grant} onClose={() => setSheet(null)} />}
      {sheet === "remove" && <RemoveSheet grant={grant} onClose={() => setSheet(null)} />}
    </li>
  );
}

function Tag({ icon: Icon, label }: { icon: typeof Pill; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-navy-50 px-2.5 py-px text-caption font-semibold text-navy">
      <Icon aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}

function EditSheet({ grant, onClose }: { grant: Grant; onClose: () => void }) {
  const t = useTranslations("careTeam");
  const errorMessage = useErrorMessage();
  const update = useUpdateGrant();
  const [options, setOptions] = useState<Options>({
    share_medications: grant.share_medications,
    share_documents: grant.share_documents,
  });
  const role = grant.member.role === "teacher" ? "teacher" : "specialist";

  return (
    <Sheet
      open
      title={t("edit", { name: grant.member.name })}
      onClose={onClose}
      closeLabel={t("cancel")}
      footer={
        <>
          <Button
            block
            loading={update.isPending}
            onClick={() => update.mutate({ id: grant.id, options }, { onSuccess: onClose })}
          >
            {t("save")}
          </Button>
          <Button block variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 rounded-lg bg-n-50 p-3">
        <ScopeOptions role={role} value={options} onChange={setOptions} />
        <FormAlert message={update.error ? errorMessage(update.error) : undefined} />
      </div>
    </Sheet>
  );
}

function RemoveSheet({ grant, onClose }: { grant: Grant; onClose: () => void }) {
  const t = useTranslations("careTeam");
  const errorMessage = useErrorMessage();
  const revoke = useRevokeGrant();

  return (
    <Sheet
      open
      title={t("removeTitle", { name: grant.member.name })}
      onClose={onClose}
      closeLabel={t("cancel")}
      footer={
        <>
          <Button
            block
            variant="danger"
            icon={UserMinus}
            loading={revoke.isPending}
            onClick={() => revoke.mutate(grant.id, { onSuccess: onClose })}
          >
            {t("removeConfirm")}
          </Button>
          <Button block variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="m-0 text-body text-text-2">{t("removeBody")}</p>
        <FormAlert message={revoke.error ? errorMessage(revoke.error) : undefined} />
      </div>
    </Sheet>
  );
}
