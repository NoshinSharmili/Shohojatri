import { PencilLine } from "lucide-react";

import { ChoiceCard } from "./choice-card";
import { TextAreaField } from "./text-field";

export const OTHER = "other";

export type ChoiceOption = { value: string; label: string; description?: string };

type OtherProps = {
  label: string;
  fieldLabel: string;
  placeholder?: string;
  text: string;
  onTextChange: (text: string) => void;
  maxLength?: number;
};

type ChoiceGroupProps = {
  name: string;
  /** Id of the element that names the group (usually the question). */
  labelledBy: string;
  options: ChoiceOption[];
  value: string | null;
  onChange: (value: string) => void;
  /** Adds "Other (write)", which opens a text box when picked. */
  other?: OtherProps;
  disabled?: boolean;
};

/** Single-choice answer cards, optionally with "Other (write)" (design handoff `ChoiceGroup`). */
export function ChoiceGroup({
  name,
  labelledBy,
  options,
  value,
  onChange,
  other,
  disabled,
}: ChoiceGroupProps) {
  const otherOn = other !== undefined && value === OTHER;
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-col gap-2.5">
      {options.map((option) => (
        <ChoiceCard
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          description={option.description}
          selected={value === option.value}
          disabled={disabled}
          onSelect={onChange}
        />
      ))}
      {other && (
        <ChoiceCard
          name={name}
          value={OTHER}
          label={other.label}
          icon={PencilLine}
          selected={otherOn}
          disabled={disabled}
          onSelect={onChange}
        />
      )}
      {otherOn && (
        <div className="-mt-1 animate-[sj-rise_var(--dur-slow)_var(--ease-out)] rounded-b-lg bg-navy-50 px-4 pt-3.5 pb-4 motion-reduce:animate-none">
          <TextAreaField
            label={other.fieldLabel}
            placeholder={other.placeholder}
            value={other.text}
            onChange={(event) => other.onTextChange(event.target.value)}
            maxLength={other.maxLength}
            disabled={disabled}
            rows={3}
            // The field appears because the parent just chose to write.
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
