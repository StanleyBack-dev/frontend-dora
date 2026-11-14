"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarX2 } from "lucide-react";
import { Badge, Button, Card, Modal } from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import {
  BOOKING_STATUS,
  canCancelOwn,
  formatBookingPeriod,
} from "@/features/bookings/model/booking-labels";
import { SPACE_KINDS } from "@/features/spaces/model/space-labels";
import type { Booking } from "@/shared/contracts/bookings";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatDateTime } from "@/shared/lib/datetime";
import { useToast } from "@/shared/toast/useToast";

// One of the person's bookings, with what happened to it and, while the
// deadline allows, the cancel button.
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
  const [pending, setPending] = useState(false);
  const { icon: Icon } = SPACE_KINDS[booking.spaceKind];
  const status = BOOKING_STATUS[booking.status];
  const cancellable = canCancelOwn(booking, now);
  const active = booking.status === "PENDING" || booking.status === "CONFIRMED";

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
        <p className="text-sm text-fg capitalize">
          {formatBookingPeriod(booking)}
        </p>
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
      {cancellable && (
        <Button
          size="sm"
          variant="secondary"
          icon={<CalendarX2 className="size-4" />}
          onClick={() => setConfirming(true)}
        >
          Cancelar
        </Button>
      )}

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
        <span className="capitalize">{formatBookingPeriod(booking)}</span> em{" "}
        {booking.spaceName}. O horário fica livre para outras pessoas.
      </Modal>
    </Card>
  );
}
