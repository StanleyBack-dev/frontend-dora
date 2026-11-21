"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { buttonClasses } from "@/design-system/components/Button";
import { cn } from "@/design-system/utils/cn";

export type MoreAction = {
  label: string;
  icon: ReactNode;
  /** What it does (client pages)… */
  onSelect?: () => void;
  /** …or where it goes (also from server pages). */
  href?: string;
  /** A destructive action (discard, delete…). */
  danger?: boolean;
};

// The secondary actions of a page behind one button ("Mais ações"), so the
// main action stands alone (or a page's shortcuts). Opens a small menu
// below; Esc or a click outside closes it.
export function MoreActions({
  actions,
  label = "Mais ações",
  className,
}: {
  actions: MoreAction[];
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setOpen(false);
        return;
      }
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (actions.length === 0) return null;

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={cn(buttonClasses("secondary"), "w-full justify-center")}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal aria-hidden className="size-4" />
        {label}
        <ChevronDown
          aria-hidden
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 left-0 z-20 mt-1.5 min-w-52 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-card sm:left-auto"
        >
          {actions.map((action) => {
            const itemClass = cn(
              "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm hover:bg-surface-muted [&_svg]:size-4",
              action.danger ? "text-danger" : "text-fg",
            );
            return action.href ? (
              <Link
                key={action.label}
                href={action.href}
                role="menuitem"
                className={itemClass}
                onClick={() => setOpen(false)}
              >
                {action.icon}
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                role="menuitem"
                className={itemClass}
                onClick={() => {
                  setOpen(false);
                  action.onSelect?.();
                }}
              >
                {action.icon}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
