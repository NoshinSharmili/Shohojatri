"use client";

import { Hourglass, Undo2, XCircle, type LucideIcon, CircleCheck, CircleSlash } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { QueryView } from "@/components/app/query-view";
import { ChildCode } from "@/components/children/child-code";
import { Button } from "@/components/ui/button";
import { useMyRequests, useWithdrawRequest, type OutgoingRequest } from "@/lib/access/queries";
import { cx } from "@/lib/cx";

type Status = OutgoingRequest["status"];

const STATUS: Record<Status, { icon: LucideIcon; className: string }> = {
  pending: { icon: Hourglass, className: "bg-amber-50 text-amber-ink" },
  approved: { icon: CircleCheck, className: "bg-leaf-50 text-leaf-ink" },
  declined: { icon: XCircle, className: "bg-n-100 text-text-2" },
  expired: { icon: CircleSlash, className: "bg-n-100 text-text-2" },
  cancelled: { icon: Undo2, className: "bg-n-100 text-text-2" },
};

/** A teacher's or specialist's requests that haven't become a child card. Shows the code they
 *  typed, never a child's name. */
export function MyRequests() {
  const t = useTranslations("access");
  const requests = useMyRequests();

  return (
    <QueryView query={requests}>
      {(list) => {
        // Approved requests are represented by the child's card.
        const open = list.filter((request) => request.status !== "approved");
        if (open.length === 0) return null;
        return (
          <section aria-labelledby="my-requests" className="flex flex-col gap-3">
            <h2 id="my-requests" className="m-0 font-display text-h3 font-bold text-text-1">
              {t("requestsTitle")}
            </h2>
            <ul className="m-0 list-none overflow-hidden rounded-lg border border-[rgba(0,60,120,.06)] bg-white p-0 shadow-sm">
              {open.map((request) => (
                <RequestRow key={request.id} request={request} />
              ))}
            </ul>
            <p className="m-0 text-small text-text-3">{t("expiresNote")}</p>
          </section>
        );
      }}
    </QueryView>
  );
}

function RequestRow({ request }: { request: OutgoingRequest }) {
  const t = useTranslations("access");
  const format = useFormatter();
  const withdraw = useWithdrawRequest();
  const { icon: Icon, className } = STATUS[request.status];

  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-border-1 px-4 py-3 last:border-b-0">
      <ChildCode code={request.child_code} />
      <span
        className={cx(
          "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-caption font-semibold",
          className,
        )}
      >
        <Icon aria-hidden className="size-3.5" />
        {t(`status.${request.status}`)}
      </span>
      <span className="flex-1 text-small text-text-2">
        {t("sentOn", {
          date: format.dateTime(new Date(request.created_at), { dateStyle: "medium" }),
        })}
      </span>
      {request.status === "pending" && (
        <Button
          variant="ghost"
          size="sm"
          loading={withdraw.isPending}
          onClick={() => withdraw.mutate(request.id)}
        >
          {t("withdraw")}
        </Button>
      )}
    </li>
  );
}
