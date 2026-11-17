"use client";

import { useMemo, useState } from "react";
import { CircleCheck, Search, Users } from "lucide-react";
import { Badge, Card, EmptyState, StatCard, cn } from "@/design-system";
import { formatSlot } from "@/features/bookings/model/booking-labels";
import type { GateGuest } from "@/shared/contracts/bookings";
import { formatTime } from "@/shared/lib/datetime";
import { formatDocument } from "@/shared/lib/identity-document";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

type Group = {
  bookingId: string;
  spaceName: string;
  startsAt: string;
  endsAt: string;
  hostName: string;
  unitLabel: string | null;
  guests: GateGuest[];
};

// The guests of a day's bookings for the managers, read-only: by booking
// (space, time, who invited), with a search and who already came in.
export function BookingGuestsBoard({ guests }: { guests: GateGuest[] }) {
  const [search, setSearch] = useState("");

  const groups = useMemo(() => {
    const term = normalize(search);
    const map = new Map<string, Group>();
    for (const guest of guests) {
      const haystack = normalize(
        `${guest.name} ${guest.document ?? ""} ${guest.hostName} ${guest.unitLabel ?? ""} ${guest.spaceName}`,
      );
      if (term && !haystack.includes(term)) continue;
      const group = map.get(guest.bookingId) ?? {
        bookingId: guest.bookingId,
        spaceName: guest.spaceName,
        startsAt: guest.startsAt,
        endsAt: guest.endsAt,
        hostName: guest.hostName,
        unitLabel: guest.unitLabel,
        guests: [],
      };
      group.guests.push(guest);
      map.set(guest.bookingId, group);
    }
    return [...map.values()];
  }, [guests, search]);

  const inside = guests.filter((guest) => guest.checkedInAt).length;
  const bookings = new Set(guests.map((guest) => guest.bookingId)).size;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Convidados"
          value={String(guests.length)}
          icon={<Users />}
        />
        <StatCard
          label="Já entraram"
          value={String(inside)}
          icon={<CircleCheck />}
          tone="success"
        />
        <StatCard label="Reservas" value={String(bookings)} icon={<Users />} />
      </div>

      <label className="relative block sm:w-72">
        <span className="sr-only">Buscar convidado</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-soft"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nome, documento, unidade…"
          className="h-10 w-full rounded-lg border border-border bg-surface pr-3 pl-9 text-sm text-fg placeholder:text-soft focus:border-brand focus:outline-none"
        />
      </label>

      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="size-5" />}
            title={search ? "Ninguém encontrado" : "Nenhum convidado neste dia"}
            description={
              search
                ? "Tente outro nome, documento ou unidade."
                : "Os convidados das reservas do dia aparecem aqui."
            }
          />
        </Card>
      ) : (
        groups.map((group) => (
          <Card key={group.bookingId}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
              <p className="font-semibold text-fg">
                {group.spaceName}
                <span className="ml-2 text-sm font-normal text-muted tabular-nums">
                  {formatSlot(group.startsAt, group.endsAt)}
                </span>
              </p>
              <p className="text-sm text-muted">
                {group.hostName}
                {group.unitLabel ? ` · ${group.unitLabel}` : ""}
              </p>
            </div>
            <ul className="divide-y divide-border">
              {group.guests.map((guest) => (
                <li
                  key={guest.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate font-medium",
                        guest.checkedInAt ? "text-muted" : "text-fg",
                      )}
                    >
                      {guest.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {formatDocument(guest.documentType, guest.document) ||
                        "Sem documento"}
                    </p>
                  </div>
                  {guest.checkedInAt ? (
                    <Badge tone="success">
                      <CircleCheck aria-hidden className="mr-1 size-3.5" />
                      Entrou às {formatTime(guest.checkedInAt)}
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Não entrou</Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))
      )}
    </div>
  );
}
