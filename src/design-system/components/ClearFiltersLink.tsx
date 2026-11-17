"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { buttonClasses } from "@/design-system/components/Button";
import { useFilterTransition } from "@/design-system/components/FilterScope";
import { cn } from "@/design-system/utils/cn";
import { startNavigation } from "@/shared/lib/navigation-progress";

// "Limpar filtros" of a form that applies itself: back to the page without
// filters in the page's FilterScope transition, so the results show that
// they are loading (as when a filter is picked). Still a real link (opens
// in a new tab, works without JavaScript).
export function ClearFiltersLink({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  const router = useRouter();
  const scope = useFilterTransition();
  const [, ownStart] = useTransition();
  const start = scope?.start ?? ownStart;

  return (
    <a
      href={href}
      onClick={(event) => {
        // A plain click navigates here; ctrl/⌘/middle clicks stay links.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button)
          return;
        event.preventDefault();
        startNavigation();
        start(() => router.push(href));
      }}
      className={cn(buttonClasses("secondary"), className)}
    >
      <X className="size-4" /> Limpar filtros
    </a>
  );
}
