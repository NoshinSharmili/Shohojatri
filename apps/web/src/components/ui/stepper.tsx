import { cx } from "@/lib/cx";

type StepperProps = {
  steps: string[];
  /** Zero-based index of the current step. */
  current: number;
  /** Localised "Step 2 of 4". */
  countLabel: string;
};

/** Segmented progress for a multi-step flow (design handoff `Stepper`, variant `segments`). */
export function Stepper({ steps, current, countLabel }: StepperProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-valuenow={current + 1}
      aria-valuetext={`${countLabel} · ${steps[current]}`}
      className="flex flex-col gap-2.5"
    >
      <div className="flex items-baseline justify-between gap-3 text-small text-text-2">
        <span className="font-semibold text-navy">{countLabel}</span>
        <span>{steps[current]}</span>
      </div>
      <div className="flex gap-1">
        {steps.map((step, index) => (
          <span
            key={step}
            className={cx(
              "h-1.5 flex-1 rounded-pill transition-colors duration-(--dur-slow)",
              index < current ? "bg-teal" : index === current ? "bg-navy" : "bg-n-200",
            )}
          />
        ))}
      </div>
    </div>
  );
}
