"use client";

import type { LucideIcon } from "lucide-react";
import { type KeyboardEvent, useRef } from "react";

import { cx } from "@/lib/cx";

export type TabItem<T extends string> = { id: T; label: string; icon?: LucideIcon };

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Accessible name of the tab list. */
  label: string;
  /** id prefix: tab `${idPrefix}-tab-${id}` controls panel `${idPrefix}-panel-${id}`. */
  idPrefix: string;
};

/** Pill tabs (design handoff `Tabs`, variant "pill"). Arrow keys move between tabs. */
export function Tabs<T extends string>({ items, value, onChange, label, idPrefix }: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + items.length) % items.length;
    onChange(items[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex gap-0.5 self-start rounded-pill bg-n-100 p-1"
    >
      {items.map(({ id, label: tabLabel, icon: Icon }, index) => {
        const active = id === value;
        return (
          <button
            key={id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${id}`}
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cx(
              "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-pill px-4 py-1 text-[15px] font-semibold",
              "transition-[color,background-color,box-shadow] duration-200",
              active ? "bg-white text-navy shadow-sm" : "text-text-2 hover:text-navy",
            )}
          >
            {Icon && <Icon aria-hidden className="size-4.5" />}
            {tabLabel}
          </button>
        );
      })}
    </div>
  );
}
