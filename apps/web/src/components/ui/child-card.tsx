import type { ReactNode } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

type ChildCardProps = {
  name: string;
  /** e.g. age · status. */
  meta: string;
  /** Top-right slot: a status chip, a Child ID pill. */
  badge?: ReactNode;
  /** Bottom row: links and actions. */
  children?: ReactNode;
};

/** A child on a home screen (design handoff `ChildCard`). */
export function ChildCard({ name, meta, badge, children }: ChildCardProps) {
  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex items-start gap-3.5">
        <Avatar name={name} size={52} />
        <div className="min-w-0 flex-1">
          <p className="m-0 font-display text-h3 font-bold text-text-1">{name}</p>
          <p className="m-0 text-small text-text-2">{meta}</p>
        </div>
        {badge}
      </div>
      {children}
    </Card>
  );
}
