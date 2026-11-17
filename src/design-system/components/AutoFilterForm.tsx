"use client";

import { useRef, useTransition, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFilterTransition } from "@/design-system/components/FilterScope";
import { startNavigation } from "@/shared/lib/navigation-progress";

/** How long a search waits for the typing to pause before applying. */
const TYPING_PAUSE_MS = 500;

/** Fields whose changes are typing (applied once it pauses). */
const TYPED = new Set(["text", "search", "email", "tel"]);

// A filter form that applies itself: a change navigates to the same page
// with the form's values in the address (empty ones left out, back to the
// first page), so the server lists the filtered data. A list or a date
// applies at once; a search once the typing pauses (or on Enter). While
// the new page loads, the page's FilterResults show that the list is
// loading. Typing in a FilterCombobox (no name) only narrows its options.
export function AutoFilterForm({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // The page's FilterScope (so its results show the loading), or our own.
  const scope = useFilterTransition();
  const [ownPending, ownStart] = useTransition();
  const pending = scope?.pending ?? ownPending;
  const startTransition = scope?.start ?? ownStart;
  const typing = useRef<ReturnType<typeof setTimeout> | null>(null);

  function apply(form: HTMLFormElement) {
    if (typing.current) clearTimeout(typing.current);
    typing.current = null;
    const query = new URLSearchParams();
    for (const [name, value] of new FormData(form)) {
      if (typeof value === "string" && value.trim() !== "") {
        query.append(name, value.trim());
      }
    }
    const search = query.toString();
    if (search === window.location.search.slice(1)) return;
    startNavigation();
    startTransition(() =>
      router.push(search ? `${pathname}?${search}` : pathname),
    );
  }

  return (
    <form
      aria-busy={pending}
      onChange={(event) => {
        const field = event.target;
        if (
          !(
            field instanceof HTMLInputElement ||
            field instanceof HTMLSelectElement
          ) ||
          !field.name
        ) {
          return;
        }
        const form = event.currentTarget;
        if (field instanceof HTMLInputElement && TYPED.has(field.type)) {
          if (typing.current) clearTimeout(typing.current);
          typing.current = setTimeout(() => apply(form), TYPING_PAUSE_MS);
          return;
        }
        apply(form);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        apply(event.currentTarget);
      }}
      className={className}
    >
      {children}
    </form>
  );
}
