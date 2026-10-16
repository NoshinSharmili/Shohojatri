"use client";

import {
  Eye,
  History,
  Lightbulb,
  MessageCircle,
  NotebookPen,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Undo2,
  UserMinus,
  UserPlus,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { type Messages, useFormatter, useTranslations } from "next-intl";

import type { ActivityEntry } from "@/lib/care-team/queries";

type ActionKey = Exclude<keyof Messages["activity"], "you" | "times" | "resources">;
type ResourceKey = keyof Messages["activity"]["resources"];

const ICONS: Record<ActionKey, LucideIcon> = {
  read: Eye,
  write: NotebookPen,
  use: MessageCircle,
  suggest: Lightbulb,
  request: UserPlus,
  approve: ShieldCheck,
  decline: UserX,
  cancel: Undo2,
  revoke: UserMinus,
  update: Settings2,
  regenerate: RefreshCw,
  other: History,
};

function isAction(action: string): action is ActionKey {
  return action in ICONS;
}

/** "Who viewed or changed what" (COMPANION_SPEC §3.2), newest first. */
export function ActivityFeed({
  entries,
  myId,
  childName,
}: {
  entries: ActivityEntry[];
  myId: number;
  childName: string;
}) {
  const t = useTranslations("activity");
  const tCareTeam = useTranslations("careTeam");
  const format = useFormatter();

  if (entries.length === 0) {
    return (
      <p className="m-0 text-small text-text-2">
        {tCareTeam("activityEmpty", { name: childName })}
      </p>
    );
  }

  return (
    <ul className="m-0 list-none p-0">
      {entries.map((entry, index) => {
        const action = isAction(entry.action) ? entry.action : "other";
        const Icon = ICONS[action];
        const resource = (
          t.has(`resources.${entry.resource as ResourceKey}`) ? entry.resource : "other"
        ) as ResourceKey;
        const text = t(action, {
          actor: entry.actor.id === myId ? t("you") : entry.actor.name,
          subject: entry.subject_name ?? "",
          what: t(`resources.${resource}`),
        });
        const when = format.dateTime(new Date(entry.at), {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        });
        return (
          <li
            key={`${entry.at}-${index}`}
            className="flex items-start gap-2.5 border-b border-border-1 py-2.5 text-[15px] leading-[1.55] text-text-1 last:border-b-0"
          >
            <Icon aria-hidden className="mt-0.75 size-4 shrink-0 text-text-3" />
            <div>
              {text}
              <span className="block text-caption text-text-3">
                {entry.count > 1 ? `${when} · ${t("times", { count: entry.count })}` : when}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
