"use client";

import { CircleCheck, Clock, DoorOpen, RotateCcw } from "lucide-react";
import { Badge, Button, cn } from "@/design-system";
import type { GateEntry } from "@/features/gate/model/gate-agenda";
import { formatTime } from "@/shared/lib/datetime";

// One person at the gate (a booking guest or an event ticket): who it is,
// how to check it (document, code…) and the entry action. Who already came
// in is muted, so the eye goes to who is still waiting.
export function GateEntryRow({
  entry,
  busy,
  disabled,
  onCheckIn,
  onUndo,
}: {
  entry: GateEntry;
  busy: boolean;
  disabled: boolean;
  onCheckIn: () => void;
  onUndo: () => void;
}) {
  const inside = Boolean(entry.checkedInAt);
  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5",
        inside && "bg-surface-muted/60",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-2.5 shrink-0 rounded-full",
          inside
            ? "bg-success"
            : entry.window === "OPEN"
              ? "bg-brand"
              : "bg-border-strong",
        )}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold",
            inside ? "text-muted" : "text-fg",
          )}
        >
          <span className="truncate">{entry.name}</span>
          {entry.tags.map((tag) => (
            <Badge key={tag} tone="neutral">
              {tag}
            </Badge>
          ))}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {entry.details.join(" · ")}
        </p>
      </div>
      <EntryAction
        entry={entry}
        busy={busy}
        disabled={disabled}
        onCheckIn={onCheckIn}
        onUndo={onUndo}
      />
    </li>
  );
}

function EntryAction({
  entry,
  busy,
  disabled,
  onCheckIn,
  onUndo,
}: {
  entry: GateEntry;
  busy: boolean;
  disabled: boolean;
  onCheckIn: () => void;
  onUndo: () => void;
}) {
  if (entry.checkedInAt) {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="success">
          <CircleCheck aria-hidden className="mr-1 size-3.5" />
          Entrou às {formatTime(entry.checkedInAt)}
        </Badge>
        <button
          type="button"
          onClick={onUndo}
          disabled={disabled}
          title="Desfazer a entrada"
          aria-label={`Desfazer a entrada de ${entry.name}`}
          className="grid size-9 place-items-center rounded-md text-soft transition-colors hover:bg-surface-sunken hover:text-fg disabled:opacity-50"
        >
          <RotateCcw aria-hidden className="size-4" />
        </button>
      </div>
    );
  }
  if (entry.window === "OPEN") {
    return (
      <Button
        onClick={onCheckIn}
        loading={busy}
        disabled={disabled}
        icon={<DoorOpen className="size-4" />}
      >
        Liberar entrada
      </Button>
    );
  }
  if (entry.window === "TOO_EARLY") {
    return (
      <Badge tone="neutral">
        <Clock aria-hidden className="mr-1 size-3.5" />A partir das{" "}
        {formatTime(entry.opensAt)}
      </Badge>
    );
  }
  return (
    <Badge tone="neutral">
      {entry.window === "CANCELLED" ? "Cancelado" : "Encerrado"}
    </Badge>
  );
}
