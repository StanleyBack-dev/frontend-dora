"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  CircleCheck,
  DoorOpen,
  KeyRound,
  RotateCcw,
  Search,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Field,
  cn,
} from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import { QrScanButton } from "@/features/bookings/components/QrScanButton";
import { formatSlot } from "@/features/bookings/model/booking-labels";
import type { GateGuest } from "@/shared/contracts/bookings";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatTime } from "@/shared/lib/datetime";
import { formatDocument } from "@/shared/lib/identity-document";
import { formatPhone } from "@/shared/lib/masks";
import { useToast } from "@/shared/toast/useToast";

const REFRESH_MS = 60_000;

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

// The gate's console: the day's guests by booking, the invite code typed
// (or read from the QR) at the gate, and the entry tapped from the list. The
// list refreshes every minute so new guests show up on their own. Another
// list on the page (event tickets) can take the codes that are its own.
export function GateConsole({
  initial,
  takeCode,
}: {
  initial: GateGuest[];
  /**
   * A typed or scanned code another list handles (an event ticket): its
   * check-in (true: done), or null when the code is an invite.
   */
  takeCode?: (code: string) => Promise<boolean> | null;
}) {
  const { showError, showSuccess } = useToast();
  const [guests, setGuests] = useState(initial);
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setGuests(await bookingsClient.gateGuests());
    } catch {
      // Keeps the list it has; the next round tries again.
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const replace = (updated: GateGuest) =>
    setGuests((list) =>
      list.map((guest) => (guest.id === updated.id ? updated : guest)),
    );

  async function checkIn(target: { guestId?: string; code?: string }) {
    const taken = target.code ? takeCode?.(target.code) : null;
    if (taken) {
      setBusy("code");
      if (await taken) setCode("");
      setBusy(null);
      return;
    }
    setBusy(target.guestId ?? "code");
    try {
      const guest = await bookingsClient.checkIn(target);
      replace(guest);
      if (target.code) {
        setCode("");
        // A guest of another day: bring the list up to date.
        if (!guests.some((item) => item.id === guest.id)) void refresh();
      }
      showSuccess(
        `Entrada liberada: ${guest.name}`,
        `${guest.spaceName} · convidado de ${guest.hostName}`,
      );
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível liberar a entrada.",
      );
    }
    setBusy(null);
  }

  async function undo(guest: GateGuest) {
    setBusy(guest.id);
    try {
      replace(await bookingsClient.undoCheckIn(guest.id));
      showSuccess(`Entrada desfeita: ${guest.name}`);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível desfazer.",
      );
    }
    setBusy(null);
  }

  function submitCode(event: FormEvent) {
    event.preventDefault();
    if (code.trim()) void checkIn({ code: code.trim() });
  }

  const groups = useMemo(() => {
    const term = normalize(search);
    const map = new Map<string, Group>();
    for (const guest of guests) {
      const haystack = normalize(
        `${guest.name} ${guest.document ?? ""} ${guest.hostName} ${guest.unitLabel ?? ""} ${guest.code}`,
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

  return (
    <div className="space-y-5">
      <Card>
        <CardBody>
          <form
            onSubmit={submitCode}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="min-w-0 flex-1">
              <Field
                label={
                  takeCode
                    ? "Código do convite ou ingresso"
                    : "Código do convite"
                }
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                placeholder="Ex.: ABCD EFGH"
                maxLength={14}
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
              />
            </div>
            <Button
              type="submit"
              loading={busy === "code"}
              disabled={code.replace(/[\s-]/g, "").length < 8}
              icon={<KeyRound className="size-4" />}
            >
              Liberar entrada
            </Button>
            <QrScanButton
              disabled={busy !== null}
              onCode={(scanned) => void checkIn({ code: scanned })}
            />
          </form>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {guests.length} convidado{guests.length === 1 ? "" : "s"} hoje ·{" "}
          {inside} já entr{inside === 1 ? "ou" : "aram"}
        </p>
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
      </div>

      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="size-5" />}
            title={search ? "Ninguém encontrado" : "Nenhum convidado hoje"}
            description={
              search
                ? "Tente outro nome, documento ou unidade."
                : "Os convidados das reservas do dia aparecem aqui."
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
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
                  <GuestRow
                    key={guest.id}
                    guest={guest}
                    busy={busy}
                    onCheckIn={() => checkIn({ guestId: guest.id })}
                    onUndo={() => undo(guest)}
                  />
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/** One guest with their documents and the entry action. */
function GuestRow({
  guest,
  busy,
  onCheckIn,
  onUndo,
}: {
  guest: GateGuest;
  /** What is being saved now ("code" or a guest id). */
  busy: string | null;
  onCheckIn: () => void;
  onUndo: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
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
          {[
            formatDocument(guest.documentType, guest.document),
            guest.phone ? formatPhone(guest.phone) : null,
            `Código ${guest.code}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <GuestAction
        guest={guest}
        busy={busy === guest.id}
        disabled={busy !== null}
        onCheckIn={onCheckIn}
        onUndo={onUndo}
      />
    </li>
  );
}

function GuestAction({
  guest,
  busy,
  disabled,
  onCheckIn,
  onUndo,
}: {
  guest: GateGuest;
  busy: boolean;
  disabled: boolean;
  onCheckIn: () => void;
  onUndo: () => void;
}) {
  if (guest.checkedInAt) {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="success">
          <CircleCheck aria-hidden className="mr-1 size-3.5" />
          Entrou às {formatTime(guest.checkedInAt)}
        </Badge>
        <button
          type="button"
          onClick={onUndo}
          disabled={disabled}
          title="Desfazer a entrada"
          aria-label={`Desfazer a entrada de ${guest.name}`}
          className="grid size-8 place-items-center rounded-md text-soft transition-colors hover:bg-surface-muted hover:text-fg disabled:opacity-50"
        >
          <RotateCcw aria-hidden className="size-4" />
        </button>
      </div>
    );
  }
  if (guest.checkInWindow === "OPEN") {
    return (
      <Button
        size="sm"
        onClick={onCheckIn}
        loading={busy}
        disabled={disabled}
        icon={<DoorOpen className="size-4" />}
      >
        Liberar entrada
      </Button>
    );
  }
  if (guest.checkInWindow === "TOO_EARLY") {
    const opens = new Date(new Date(guest.startsAt).getTime() - 3 * 3_600_000);
    return (
      <Badge tone="neutral">
        Entrada a partir das {formatTime(opens.toISOString())}
      </Badge>
    );
  }
  return (
    <Badge tone="neutral">
      {guest.checkInWindow === "CANCELLED" ? "Reserva cancelada" : "Encerrada"}
    </Badge>
  );
}
