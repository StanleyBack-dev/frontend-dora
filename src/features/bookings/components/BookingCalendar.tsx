"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, Lock, ShieldCheck } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  Spinner,
  TextArea,
  cn,
} from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import {
  datesBetween,
  formatSlot,
  noonOf,
} from "@/features/bookings/model/booking-labels";
import type {
  AvailabilitySlot,
  SpaceAvailability,
} from "@/shared/contracts/bookings";
import { ApiClientError } from "@/shared/lib/api-client";
import { dateParts, formatLongDay } from "@/shared/lib/datetime";
import { useToast } from "@/shared/toast/useToast";

type Props = {
  space: {
    id: string;
    name: string;
    usageRules: string | null;
    requiresApproval: boolean;
  };
  initial: SpaceAvailability;
  /** BOOKINGS_CREATE: may book (otherwise the grid is read-only). */
  canBook: boolean;
};

const SLOT_STYLES: Record<AvailabilitySlot["state"], string> = {
  FREE: "border-border bg-surface text-fg hover:border-brand hover:bg-brand-soft",
  MINE: "border-brand bg-brand text-brand-fg",
  TAKEN: "border-border bg-surface-muted text-soft",
  BLOCKED: "border-dashed border-border bg-surface-muted text-soft",
  UNAVAILABLE: "border-border bg-surface-muted/60 text-soft/70",
};

const SLOT_HINT: Record<AvailabilitySlot["state"], string> = {
  FREE: "Livre",
  MINE: "Sua reserva",
  TAKEN: "Reservado",
  BLOCKED: "Bloqueado",
  UNAVAILABLE: "Indisponível",
};

// The booking calendar of a space: pick a day, then a free slot. Taken and
// blocked slots stay visible so people understand the day at a glance.
export function BookingCalendar({ space, initial, canBook }: Props) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [availability, setAvailability] = useState(initial);
  const [loadingDate, setLoadingDate] = useState<string | null>(null);
  const [chosen, setChosen] = useState<AvailabilitySlot | null>(null);
  const [notes, setNotes] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);

  const dates = datesBetween(availability.firstDate, availability.lastDate);

  async function load(date: string) {
    setLoadingDate(date);
    try {
      setAvailability(await bookingsClient.availability(space.id, date));
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível carregar os horários.",
      );
    }
    setLoadingDate(null);
  }

  function choose(slot: AvailabilitySlot) {
    setChosen(slot);
    setNotes("");
    setAccepted(!space.usageRules);
  }

  async function book() {
    if (!chosen) return;
    setPending(true);
    try {
      const booking = await bookingsClient.create({
        spaceId: space.id,
        startsAt: chosen.startsAt,
        notes: notes.trim() || null,
      });
      showSuccess(
        booking.status === "PENDING"
          ? "Reserva enviada para aprovação."
          : "Reserva confirmada!",
        booking.status === "PENDING"
          ? "Você recebe um aviso quando a administração decidir."
          : "O convite para a agenda do celular chega no seu e-mail.",
      );
      setChosen(null);
      await load(availability.date);
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível reservar.",
      );
      // Someone else may have taken it: show the day as it is now.
      await load(availability.date);
      setChosen(null);
    }
    setPending(false);
  }

  const free = availability.slots.filter((slot) => slot.state === "FREE");

  return (
    <Card>
      <CardHeader
        title="Reservar"
        description={
          space.requiresApproval
            ? "Escolha o dia e o horário. A reserva passa pela aprovação da administração."
            : "Escolha o dia e o horário. A reserva é confirmada na hora."
        }
        action={<CalendarCheck aria-hidden className="size-5 text-soft" />}
      />
      <CardBody className="space-y-5 pt-0">
        {/* Days of the booking window. */}
        <div
          role="tablist"
          aria-label="Dias"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        >
          {dates.map((date) => {
            const parts = dateParts(noonOf(date));
            const active = date === availability.date;
            return (
              <button
                key={date}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={loadingDate !== null}
                onClick={() => load(date)}
                className={cn(
                  "flex w-14 shrink-0 flex-col items-center rounded-2xl border py-2 transition-colors",
                  active
                    ? "border-fg bg-fg text-surface"
                    : "border-border bg-surface text-fg hover:border-fg",
                )}
              >
                <span className="text-[10px] font-bold tracking-wide uppercase opacity-70">
                  {parts.weekday}
                </span>
                <span className="text-lg leading-tight font-extrabold">
                  {parts.day}
                </span>
                <span className="text-[10px] uppercase opacity-70">
                  {parts.month}
                </span>
              </button>
            );
          })}
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg capitalize">
            {formatLongDay(noonOf(availability.date))}
            {loadingDate && <Spinner size="sm" label="Carregando horários" />}
          </p>
          {availability.slots.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
              O espaço não abre neste dia.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {availability.slots.map((slot) => {
                  const clickable = slot.state === "FREE" && canBook;
                  return (
                    <button
                      key={slot.startsAt}
                      type="button"
                      disabled={!clickable}
                      onClick={() => choose(slot)}
                      title={slot.label ?? undefined}
                      className={cn(
                        "flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-colors disabled:cursor-default",
                        SLOT_STYLES[slot.state],
                      )}
                    >
                      <span className="text-sm font-bold">
                        {formatSlot(slot.startsAt, slot.endsAt)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium opacity-80">
                        {slot.state === "BLOCKED" && (
                          <Lock aria-hidden className="size-3" />
                        )}
                        {slot.state === "MINE" &&
                        slot.bookingStatus === "PENDING"
                          ? "Sua · aguardando"
                          : SLOT_HINT[slot.state]}
                      </span>
                      {slot.label && slot.state !== "FREE" && (
                        <span className="mt-0.5 line-clamp-1 text-[11px] opacity-80">
                          {slot.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {free.length === 0 && (
                <p className="mt-3 text-sm text-muted">
                  Nenhum horário livre neste dia. Tente outro dia.
                </p>
              )}
            </>
          )}
        </div>

        {!canBook && (
          <Alert tone="info">
            Você pode ver os horários, mas não tem permissão para reservar. Fale
            com a administração do condomínio.
          </Alert>
        )}
        <p className="text-xs text-soft">
          Suas reservas ficam em{" "}
          <Link href="/reservas" className="font-semibold text-brand-ink">
            Reservas
          </Link>
          , onde você também cancela.
        </p>
      </CardBody>

      <Modal
        open={chosen !== null}
        onClose={() => setChosen(null)}
        title="Confirmar reserva"
        busy={pending}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setChosen(null)}
              disabled={pending}
            >
              Voltar
            </Button>
            <Button
              variant="brand"
              onClick={book}
              loading={pending}
              disabled={!accepted}
            >
              {space.requiresApproval ? "Enviar para aprovação" : "Reservar"}
            </Button>
          </>
        }
      >
        {chosen && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-brand-soft p-4">
              <p className="text-xs font-bold tracking-wide text-muted uppercase">
                {space.name}
              </p>
              <p className="text-lg font-bold text-fg capitalize">
                {formatLongDay(chosen.startsAt)}
              </p>
              <p className="text-fg">
                {formatSlot(chosen.startsAt, chosen.endsAt)}
              </p>
            </div>
            {space.requiresApproval && (
              <Alert tone="info">
                <ShieldCheck aria-hidden className="mr-1 inline size-4" />
                Este espaço exige aprovação: o horário fica guardado para você
                enquanto a administração decide.
              </Alert>
            )}
            {space.usageRules && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-fg">Regras de uso</p>
                <p className="max-h-40 overflow-y-auto rounded-xl border border-border p-3 text-sm whitespace-pre-line text-muted">
                  {space.usageRules}
                </p>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-fg">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]"
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                  />
                  Li e concordo com as regras de uso.
                </label>
              </div>
            )}
            <TextArea
              label="Observação"
              rows={2}
              maxLength={300}
              placeholder="Opcional. Ex.: aniversário, 15 convidados."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        )}
      </Modal>
    </Card>
  );
}
