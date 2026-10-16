"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";

type SheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Localised label of the close button. */
  closeLabel: string;
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * Bottom sheet on phones, centred dialog on wider screens (design handoff `Sheet`).
 * Built on <dialog>.showModal(), so focus trapping, Escape and the inert background are native.
 */
export function Sheet({ open, title, onClose, closeLabel, footer, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the backdrop lands on the <dialog> itself, not its content.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={[
        "m-0 mt-auto w-full max-w-none rounded-t-sheet border-0 bg-white p-0 text-text-1 shadow-lg",
        "md:m-auto md:max-w-[480px] md:rounded-xl",
        "backdrop:bg-surface-overlay",
      ].join(" ")}
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-start gap-3 px-5 pt-5 pb-2">
          <h2 id={titleId} className="m-0 flex-1 font-display text-h3 font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="-mt-1.5 -mr-2 flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-2 hover:bg-n-100"
          >
            <X aria-hidden className="size-5.5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5">{children}</div>
        {footer && (
          <div className="flex flex-col gap-2 border-t border-border-1 px-5 py-4">{footer}</div>
        )}
      </div>
    </dialog>
  );
}
