"use client";

import type { ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";

export type ChoiceOption<T extends string> = {
  value: T;
  title: string;
  /** One line under the title. */
  hint?: string;
  icon?: ReactNode;
};

// A choice between a few options shown as cards (radio buttons underneath,
// so the keyboard and screen readers work as with any radio group). The
// fields of the chosen option go right below it, in the form.
export function ChoiceCards<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  className,
}: {
  /** The radio group's name (unique in the form). */
  name: string;
  /** Read by screen readers; visible when given. */
  legend?: string;
  options: ChoiceOption<T>[];
  value: T | "";
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <fieldset className={className}>
      {legend && (
        <legend className="mb-2 text-sm font-semibold text-fg">{legend}</legend>
      )}
      <div
        className={cn(
          "grid gap-3",
          options.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
        )}
      >
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                checked
                  ? "border-accent bg-accent-soft"
                  : "border-border hover:border-border-strong",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                className="sr-only"
                checked={checked}
                onChange={() => onChange(option.value)}
              />
              {option.icon && (
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 shrink-0 [&>svg]:size-5",
                    checked ? "text-accent" : "text-soft",
                  )}
                >
                  {option.icon}
                </span>
              )}
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-fg">
                  {option.title}
                </span>
                {option.hint && (
                  <span className="block text-xs text-muted">
                    {option.hint}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
