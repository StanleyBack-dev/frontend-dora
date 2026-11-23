"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/design-system/utils/cn";

// A step of a long form as its own card: a dark header (the chrome colors)
// with icon, title and one line of help, and the fields below. Open by
// default; the header folds it to keep the page short.
export function CollapsibleSection({
  icon,
  title,
  description,
  children,
  defaultOpen = true,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-card",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={bodyId}
        className={cn(
          "flex w-full items-center gap-3 rounded-t-[calc(1rem-1px)] bg-chrome px-4 py-3 text-left text-chrome-fg transition-colors hover:bg-chrome-raised sm:px-5",
          !open && "rounded-b-[calc(1rem-1px)]",
        )}
      >
        {icon && (
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-md bg-brand/15 text-brand [&>svg]:size-4"
          >
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{title}</span>
          {description && (
            <span className="block text-xs leading-snug text-chrome-muted">
              {description}
            </span>
          )}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-chrome-subtle transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        id={bodyId}
        hidden={!open}
        className="space-y-4 px-4 py-4 sm:px-5 sm:py-5"
      >
        {children}
      </div>
    </section>
  );
}
