"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, CalendarX2, Repeat, Users, Wallet } from "lucide-react";
import { Badge, Button, Card, cn, Modal } from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import { GuestsDrawer } from "@/features/bookings/components/GuestsDrawer";
import {
  BOOKING_STATUS,
  canCancelOwn,
  formatBookingPeriod,
} from "@/features/bookings/model/booking-labels";
import { SpacePhotoCarousel } from "@/features/spaces/components/SpacePhotoCarousel";
import { SPACE_KINDS } from "@/features/spaces/model/space-labels";
import type { Booking } from "@/shared/contracts/bookings";
import type { SpacePhoto } from "@/shared/contracts/spaces";
import { ApiClientError } from "@/shared/lib/api-client";
import { dateParts, formatDateTime } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

// One of the person's bookings, in the same shape as the Eventos and Espaços
// cards: its space's photos, the date, the space, when, the fee, what
// happened to it and, at the bottom, the guest list and (while the deadline
// allows) the cancel buttons (this date or the rest of a weekly booking).
export function BookingCard({
  booking,
  now,
  photos = [],
}: {
  booking: Booking;
  now: number;
  /** The photos of its space. */
  photos?: SpacePhoto[];
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [confirmingSeries, setConfirmingSeries] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const { label: kind } = SPACE_KINDS[booking.spaceKind];
  const status = BOOKING_STATUS[booking.status];
  const cancellable = canCancelOwn(booking, now);
  const active = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const ongoing = active && new Date(booking.endsAt).getTime() > now;
  const deadlinePassed = ongoing && !cancellable;
  const period = formatBookingPeriod(booking);
  const date = dateParts(booking.startsAt);

  async function cancelSeries() {
    if (!booking.seriesId) return;
    setPending(true);
    try {
      const result = await bookingsClient.cancelSeries(booking.seriesId);
      showSuccess(
        `${result.cancelled} data${result.cancelled === 1 ? " cancelada" : "s canceladas"}.`,
        result.kept > 0
          ? `${result.kept} já passaram do prazo para cancelar: fale com a administração.`
          : undefined,
      );
      setConfirmingSeries(false);
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível cancelar.",
      );
    }
    setPending(false);
  }

  async function cancel() {
    setPending(true);
    try {
      await bookingsClient.cancel(booking.id);
      showSuccess("Reserva cancelada.");
      setConfirming(false);
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível cancelar.",
      );
    }
    setPending(false);
  }

  const actions = [
    booking.guestsAllowed && active && (
      <Button
        key="guests"
        size="sm"
        variant="secondary"
        className="w-full"
        icon={<Users className="size-4" />}
        onClick={() => setGuestsOpen(true)}
      >
        Convidados
      </Button>
    ),
    cancellable && (
      <Button
        key="cancel"
        size="sm"
        variant="cancel"
        className="w-full"
        icon={<CalendarX2 className="size-4" />}
        onClick={() => setConfirming(true)}
      >
        Cancelar
      </Button>
    ),
    booking.seriesId && ongoing && (
      <Button
        key="series"
        size="sm"
        variant="cancel"
        className="w-full"
        icon={<Repeat className="size-4" />}
        onClick={() => setConfirmingSeries(true)}
      >
        Cancelar semanal
      </Button>
    ),
  ].filter(Boolean);

  return (
    <Card
      className={cn(
        "flex h-full flex-col gap-4 overflow-hidden p-5",
        !active && "opacity-75",
      )}
    >
      {photos.length > 0 && (
        <SpacePhotoCarousel
          photos={photos}
          name={booking.spaceName}
          className="-mx-5 -mt-5 aspect-[16/9]"
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <span className="grid w-14 shrink-0 place-items-center rounded-2xl bg-brand py-1.5 text-center text-brand-fg">
          <span className="text-[10px] font-semibold uppercase">
            {date.weekday}
          </span>
          <span className="text-2xl leading-none font-extrabold">
            {date.day}
          </span>
          <span className="text-[10px] font-semibold uppercase">
            {date.month}
          </span>
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          <Badge tone={status.tone}>{status.label}</Badge>
          {booking.seriesId && (
            <Badge tone="info">
              <Repeat aria-hidden className="mr-1 size-3" />
              Semanal
            </Badge>
          )}
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-wide text-soft uppercase">
          {kind}
        </p>
        <h2 className="truncate text-lg font-bold text-fg">
          <Link
            href={`/reservas/nova/${booking.spaceId}`}
            className="hover:underline"
          >
            {booking.spaceName}
          </Link>
        </h2>
        <ul className="mt-1.5 space-y-1 text-[13px] text-muted">
          <li className="flex items-start gap-2">
            <CalendarClock
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-soft"
            />
            <span className="capitalize">{period}</span>
          </li>
          {booking.feeCents !== null && (
            <li className="flex items-start gap-2">
              <Wallet
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-soft"
              />
              <span>
                Taxa {formatCents(booking.feeCents)}
                {booking.feeBilledAt ? " · lançada na cobrança" : ""}
              </span>
            </li>
          )}
        </ul>
        {booking.reason && (
          <p className="mt-2 text-[13px] text-muted">
            {booking.status === "REJECTED"
              ? "Motivo da recusa: "
              : booking.cancelledByManager
                ? "Cancelada pela administração: "
                : "Motivo: "}
            {booking.reason}
          </p>
        )}
        {deadlinePassed && (
          <p className="mt-2 text-[12px] text-soft">
            O prazo para cancelar terminou em{" "}
            {formatDateTime(booking.cancelUntil)}.
          </p>
        )}
      </div>
      {actions.length > 0 && (
        // The booking's buttons: equal buttons under a rule at the bottom of
        // the card, as in the event cards (a third one takes the whole row).
        <div
          className={cn(
            "-mx-5 mt-auto -mb-5 grid gap-2 border-t border-border bg-surface-muted/60 p-3",
            actions.length > 1 ? "grid-cols-2" : "grid-cols-1",
            actions.length === 3 && "[&>*:last-child]:col-span-2",
          )}
        >
          {actions}
        </div>
      )}

      {booking.guestsAllowed && (
        <GuestsDrawer
          open={guestsOpen}
          onClose={() => setGuestsOpen(false)}
          booking={{ id: booking.id, spaceName: booking.spaceName, period }}
          editable={ongoing}
        />
      )}

      <Modal
        open={confirmingSeries}
        onClose={() => setConfirmingSeries(false)}
        title="Cancelar reserva semanal"
        tone="danger"
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirmingSeries(false)}
              disabled={pending}
            >
              Voltar
            </Button>
            <Button variant="danger" onClick={cancelSeries} loading={pending}>
              Cancelar as próximas datas
            </Button>
          </>
        }
      >
        Todas as próximas datas desta reserva semanal em {booking.spaceName}{" "}
        serão canceladas (as que ainda estão no prazo). Os horários ficam livres
        para outras pessoas.
      </Modal>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Cancelar reserva"
        tone="danger"
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Voltar
            </Button>
            <Button variant="danger" onClick={cancel} loading={pending}>
              Cancelar reserva
            </Button>
          </>
        }
      >
        <span className="capitalize">{period}</span> em {booking.spaceName}. O
        horário fica livre para outras pessoas.
      </Modal>
    </Card>
  );
}
