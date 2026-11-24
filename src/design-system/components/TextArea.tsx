import { useId, type TextareaHTMLAttributes } from "react";
import {
  inputClasses,
  labelClasses,
  RequiredMark,
} from "@/design-system/components/Field";
import { cn } from "@/design-system/utils/cn";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  /** Visually hide the label (still read by screen readers). */
  hideLabel?: boolean;
  hint?: string;
  /** Shown in red under the field (replaces the hint). */
  error?: string;
};

export function TextArea({
  label,
  hideLabel = false,
  hint,
  error,
  className,
  id,
  rows = 4,
  ...props
}: TextAreaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = `${textareaId}-hint`;

  return (
    <div className={className}>
      <label
        htmlFor={textareaId}
        className={cn(labelClasses, hideLabel && "sr-only")}
      >
        {label}
        {props.required && <RequiredMark />}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error || hint ? hintId : undefined}
        className={cn(
          inputClasses,
          "h-auto resize-y py-2 leading-relaxed",
          error && "border-danger focus:border-danger focus:ring-danger/25",
        )}
        {...props}
      />
      {error ? (
        <p id={hintId} className="mt-1 text-[11px] font-medium text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="mt-1 text-[11px] text-soft">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
