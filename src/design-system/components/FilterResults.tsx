"use client";

import type { ReactNode } from "react";
import { useFilterTransition } from "@/design-system/components/FilterScope";
import { Spinner } from "@/design-system/components/Spinner";
import { cn } from "@/design-system/utils/cn";

// The results of a filtered list (inside a FilterScope): while a filter's
// page loads, they fade and a "Filtrando…" spinner sits over them, so the
// person sees that the list is on its way.
export function FilterResults({ children }: { children: ReactNode }) {
  const pending = useFilterTransition()?.pending ?? false;
  return (
    <div className="relative" aria-busy={pending}>
      <div
        className={cn(
          "transition-opacity",
          pending && "pointer-events-none opacity-40",
        )}
      >
        {children}
      </div>
      {pending && (
        <div
          role="status"
          className="absolute inset-x-0 top-0 flex justify-center pt-16"
        >
          <span className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-fg shadow-pop">
            <Spinner size="sm" />
            Filtrando…
          </span>
        </div>
      )}
    </div>
  );
}
