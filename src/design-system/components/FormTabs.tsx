"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/design-system/components/Button";
import { cn } from "@/design-system/utils/cn";

export type FormTab = {
  id: string;
  /** Short: it sits in the tab strip. */
  label: string;
  icon?: ReactNode;
  /** One line of help, at the top of the tab. */
  description?: ReactNode;
  /** Something to fix in this tab (a red dot). */
  invalid?: boolean;
  content: ReactNode;
};

/**
 * A long form split in tabs inside one card: the tab strip in the dark
 * header (the chrome colors), the active tab's fields below and "Anterior" /
 * "Próxima" at its foot. Every tab stays mounted (hidden), so nothing typed
 * is lost when switching.
 */
export function FormTabs({
  label,
  tabs,
  value,
  onChange,
}: {
  /** What the tabs are (for screen readers). */
  label: string;
  tabs: FormTab[];
  /** The active tab's id. */
  value: string;
  onChange: (id: string) => void;
}) {
  const baseId = useId();
  const index = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === value),
  );
  const previous = tabs[index - 1];
  const next = tabs[index + 1];
  const strip = useRef<HTMLDivElement>(null);

  /**
   * On a phone the strip is wider than the screen: keep the active tab in
   * sight (scrolling the strip only, never the page).
   */
  useEffect(() => {
    const list = strip.current;
    const active = list?.children[index] as HTMLElement | undefined;
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({
      left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [index]);

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card">
      <div
        ref={strip}
        role="tablist"
        aria-label={label}
        className="relative flex gap-1 overflow-x-auto rounded-t-[calc(1rem-1px)] bg-chrome p-2"
      >
        {tabs.map((tab, position) => {
          const active = position === index;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={active}
              aria-controls={`${baseId}-panel-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors sm:px-4",
                active
                  ? "bg-brand text-brand-fg shadow-sm"
                  : "text-chrome-muted hover:bg-chrome-hover hover:text-chrome-fg",
              )}
            >
              {tab.icon && (
                <span
                  aria-hidden
                  className={cn(
                    "[&>svg]:size-4",
                    active ? "text-brand-fg" : "text-chrome-subtle",
                  )}
                >
                  {tab.icon}
                </span>
              )}
              {tab.label}
              {tab.invalid && (
                <span
                  aria-label="Tem algo a corrigir"
                  className="size-2 rounded-full bg-danger ring-2 ring-surface"
                />
              )}
            </button>
          );
        })}
      </div>

      {tabs.map((tab, position) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={position !== index}
          className="space-y-5 px-4 py-5 sm:px-6 sm:py-6"
        >
          {tab.description && (
            <p className="text-sm text-muted">{tab.description}</p>
          )}
          {tab.content}
        </div>
      ))}

      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 sm:px-6">
        {previous ? (
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeft className="size-4" />}
            onClick={() => onChange(previous.id)}
            aria-label={`Voltar para ${previous.label}`}
          >
            {/* On a phone only the arrow: the next tab's name needs the room. */}
            <span className="hidden sm:inline">{previous.label}</span>
          </Button>
        ) : (
          <span />
        )}
        <span className="shrink-0 whitespace-nowrap text-xs text-soft">
          {index + 1} de {tabs.length}
        </span>
        {next ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChange(next.id)}
          >
            {next.label}
            <ChevronRight aria-hidden className="ml-1 size-4" />
          </Button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
