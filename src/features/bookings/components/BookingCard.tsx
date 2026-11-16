"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarX2, Repeat, Users, Wallet } from "lucide-react";
import { Badge, Button, Card, Modal } from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import { GuestsDrawer } from "@/features/bookings/components/GuestsDrawer";
import {
  BOOKING_STATUS,
  canCancelOwn,
  formatBookingPeriod,
} from "@/features/bookings/model/booking-labels";
import { SPACE_KINDS } from "@/features/spaces/model/space-labels";
import type { Booking } from "@/shared/contracts/bookings";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatDateTime } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

// One of the person's bookings, with what happened to it, the fee, the guest
// list and, while the deadline allows, the cancel buttons (this date or the
// remaining dates of a weekly booking).
export function BookingCard({
  booking,
  now,
}: {
  booking: Booking;
  now: number;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [confirmingSeries, setConfirmingSeries] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const { icon: Icon } = SPACE_KINDS[booking.spaceKind];
  const status = BOOKING_STATUS[booking.status];
  const cancellable = canCancelOwn(booking, now);
  const active = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const ongoing = active && new Date(booking.endsAt).getTime() > now;
  const period = formatBookingPeriod(booking);

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

  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand text-brand-fg">
        <Icon aria-hidden className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/reservas/nova/${booking.spaceId}`}
            className="font-bold text-fg hover:underline"
          >
            {booking.spaceName}
          </Link>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className="text-sm text-fg capitalize">{period}</p>
        {(booking.feeCents !== null || booking.seriesId) && (
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted">
            {booking.feeCents !== null && (
              <span className="inline-flex items-center gap-1">
                <Wallet aria-hidden className="size-3.5" />
                Taxa {formatCents(booking.feeCents)}
                {booking.feeBilledAt ? " · lançada na cobrança" : ""}
              </span>
            )}
            {booking.seriesId && (
              <span className="inline-flex items-center gap-1">
                <Repeat aria-hidden className="size-3.5" />
                Reserva semanal
              </span>
            )}
          </p>
        )}
        {booking.reason && (
          <p className="mt-1 text-[13px] text-muted">
            {booking.status === "REJECTED"
              ? "Motivo da recusa: "
              : booking.cancelledByManager
                ? "Cancelada pela administração: "
                : "Motivo: "}
            {booking.reason}
          </p>
        )}
        {active && !cancellable && new Date(booking.endsAt).getTime() > now && (
          <p className="mt-1 text-[12px] text-soft">
            O prazo para cancelar terminou em{" "}
            {formatDateTime(booking.cancelUntil)}.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
        {booking.guestsAllowed && active && (
          <Button
            size="sm"
            variant="secondary"
            icon={<Users className="size-4" />}
            onClick={() => setGuestsOpen(true)}
          >
            Convidados
          </Button>
        )}
        {cancellable && (
          <Button
            size="sm"
            variant="cancel"
            icon={<CalendarX2 className="size-4" />}
            onClick={() => setConfirming(true)}
          >
            Cancelar
          </Button>
        )}
        {booking.seriesId && ongoing && (
          <Button
            size="sm"
            variant="cancel"
            icon={<Repeat className="size-4" />}
            onClick={() => setConfirmingSeries(true)}
          >
            Cancelar semanal
          </Button>
        )}
      </div>

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
