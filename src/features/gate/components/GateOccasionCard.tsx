"use client";

import { CalendarCheck, ChevronDown, Ticket } from "lucide-react";
import { Badge, Card, cn, type Tone } from "@/design-system";
import { GateEntryRow } from "@/features/gate/components/GateEntryRow";
import {
  phaseLabel,
  type GateEntry,
  type GateOccasion,
  type OccasionPhase,
} from "@/features/gate/model/gate-agenda";

const PHASE_TONE: Record<OccasionPhase, Tone> = {
  NOW: "success",
  UPCOMING: "info",
  FINISHED: "neutral",
  CANCELLED: "danger",
};

// One booking or event of the day at the gate: a header that says what,
// when, the moment (entry open, from what time, ended) and how many came in;
// tapping it opens or closes the list of people.
export function GateOccasionCard({
  occasion,
  open,
  onToggle,
  busy,
  onCheckIn,
  onUndo,
}: {
  occasion: GateOccasion;
  open: boolean;
  onToggle: () => void;
  /** What is being saved now (an entry id or "code"). */
  busy: string | null;
  onCheckIn: (entry: GateEntry) => void;
  onUndo: (entry: GateEntry) => void;
}) {
  const percent =
    occasion.total > 0
      ? Math.round((occasion.inside / occasion.total) * 100)
      : 0;
  const listId = `gate-${occasion.key}`;
  const Icon = occasion.kind === "event" ? Ticket : CalendarCheck;

  return (
    <Card
      className={cn(
        "overflow-hidden",
        occasion.phase === "NOW" && "border-brand-border ring-1 ring-brand/20",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={listId}
        className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-muted sm:px-5"
      >
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl",
            occasion.phase === "NOW"
              ? "bg-brand text-brand-fg"
              : "bg-surface-sunken text-muted",
          )}
        >
          <Icon aria-hidden className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold tracking-wide text-soft uppercase">
              {occasion.kind === "event" ? "Evento" : "Reserva"}
            </span>
            <Badge tone={PHASE_TONE[occasion.phase]}>
              {phaseLabel(occasion)}
            </Badge>
          </span>
          <span className="mt-1 block truncate text-base font-bold text-fg">
            {occasion.title}
          </span>
          <span className="block truncate text-sm text-muted">
            <span className="font-medium text-fg tabular-nums">
              {occasion.slot}
            </span>{" "}
            · {occasion.subtitle}
          </span>
          <span className="mt-2.5 flex items-center gap-3">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
              <span
                className="block h-full rounded-full bg-success transition-[width] duration-500"
                style={{ width: `${percent}%` }}
              />
            </span>
            <span className="shrink-0 text-xs font-semibold text-muted tabular-nums">
              {occasion.inside} de {occasion.total} entraram
            </span>
          </span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "mt-1 size-5 shrink-0 text-soft transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <ul
          id={listId}
          className="divide-y divide-border border-t border-border"
        >
          {occasion.entries.map((entry) => (
            <GateEntryRow
              key={`${entry.kind}-${entry.id}`}
              entry={entry}
              busy={busy === entry.id}
              disabled={busy !== null}
              onCheckIn={() => onCheckIn(entry)}
              onUndo={() => onUndo(entry)}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}
