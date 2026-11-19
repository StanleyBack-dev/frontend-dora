"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge, cn } from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { RecordAuditButton } from "@/features/audit/components/RecordAudit";
import { AUDIENCE_LABELS } from "@/features/broadcasts/model/broadcast-labels";
import type { Broadcast } from "@/shared/contracts/broadcasts";
import { formatShortDay, formatTime } from "@/shared/lib/datetime";

// A sent broadcast in the history: its first lines, and the whole text when
// opened right there ("Ler comunicado completo"). The toggle only shows when
// the text is actually cut (it depends on the text and the screen width).
export function BroadcastHistoryItem({ item }: { item: Broadcast }) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const bodyId = `broadcast-body-${item.id}`;

  // Measures whether the closed text is cut, again when the width changes.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || expanded) return;
    const measure = () => setClamped(body.scrollHeight > body.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    return () => observer.disconnect();
  }, [expanded, item.body]);

  return (
    <li className="space-y-1.5 py-3 text-sm">
      {/* Phones: the title alone on top, the audience and history on one
      line below it. From sm up, all on one line. */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
        <span className="min-w-0 font-semibold break-words text-fg sm:flex-1">
          {item.title}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone="brand">
            {item.audience === "GRUPO" && item.targetGroup
              ? GROUP_LABELS[item.targetGroup]
              : AUDIENCE_LABELS[item.audience]}
          </Badge>
          <RecordAuditButton
            entity="broadcast"
            id={item.id}
            label={item.title}
            createdAt={item.createdAt}
          />
        </div>
      </div>
      <p
        ref={bodyRef}
        id={bodyId}
        className={cn(
          "break-words whitespace-pre-line text-muted",
          !expanded && "line-clamp-3",
          expanded && "rounded-lg bg-surface-muted px-3 py-2.5 text-fg",
        )}
      >
        {item.body}
      </p>
      {(clamped || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={bodyId}
          className="inline-flex min-h-8 items-center gap-1 rounded-md text-xs font-semibold text-brand-ink hover:underline"
        >
          {expanded ? "Mostrar menos" : "Ler comunicado completo"}
          <ChevronDown
            aria-hidden
            className={cn(
              "size-3.5 transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </button>
      )}
      <p className="text-xs text-soft">
        {formatShortDay(item.createdAt)}, {formatTime(item.createdAt)} ·{" "}
        {item.recipients} {item.recipients === 1 ? "pessoa" : "pessoas"}
        {item.sendEmail ? " · com e-mail" : ""}
        {item.authorName ? ` · ${item.authorName}` : ""}
      </p>
    </li>
  );
}
