import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buttonClasses,
  cn,
  LinkPending,
  LinkPendingSwap,
  SegmentedNav,
} from "@/design-system";

// The top of the bookings management: how to see them (week, month or list)
// and, in the calendar, which week or month, with arrows and a button back to
// the current one ("Esta semana" / "Este mês", only when away from it). Each
// link shows a spinner while the new period loads.
export function BookingsCalendarNav({
  views,
  period,
}: {
  views: { label: string; href: string; active: boolean }[];
  /** The calendar's period (absent in the list). */
  period?: {
    label: string;
    prevLabel: string;
    nextLabel: string;
    prevHref: string;
    nextHref: string;
    /** "Esta semana" / "Este mês". */
    currentLabel: string;
    /** Absent when the current period is the one shown. */
    currentHref?: string;
  };
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SegmentedNav label="Visualização" items={views} />
      {period && (
        <div className="flex items-center gap-2">
          <Link
            href={period.prevHref}
            aria-label={period.prevLabel}
            title={period.prevLabel}
            className={buttonClasses("secondary", "icon")}
          >
            <LinkPendingSwap>
              <ChevronLeft aria-hidden className="size-4" />
            </LinkPendingSwap>
          </Link>
          <Link
            href={period.nextHref}
            aria-label={period.nextLabel}
            title={period.nextLabel}
            className={buttonClasses("secondary", "icon")}
          >
            <LinkPendingSwap>
              <ChevronRight aria-hidden className="size-4" />
            </LinkPendingSwap>
          </Link>
          <h2 className="ml-1 min-w-0 truncate text-sm font-bold text-fg capitalize sm:text-base">
            {period.label}
          </h2>
          {period.currentHref && (
            <Link
              href={period.currentHref}
              className={cn(
                buttonClasses("secondary", "sm"),
                "ml-auto shrink-0",
              )}
            >
              {period.currentLabel}
              <LinkPending />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
