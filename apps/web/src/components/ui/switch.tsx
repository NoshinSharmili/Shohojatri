import { cx } from "@/lib/cx";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name; the visible label usually sits next to the switch. */
  label: string;
  disabled?: boolean;
};

/** On/off toggle (design `Sw`): a button with role="switch", so it reads as one. */
export function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-8 w-13 shrink-0 cursor-pointer items-center rounded-pill p-[3px]",
        "transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-45",
        checked ? "bg-navy" : "bg-n-300",
      )}
    >
      <span
        aria-hidden
        className={cx(
          "size-6.5 rounded-full bg-white shadow-xs transition-transform duration-200 ease-out motion-reduce:transition-none",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}
