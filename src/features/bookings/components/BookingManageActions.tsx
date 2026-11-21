"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarX2, Check, Users, X } from "lucide-react";
import { Button, cn, Modal, TextArea } from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import { GuestsDrawer } from "@/features/bookings/components/GuestsDrawer";
import { formatBookingPeriod } from "@/features/bookings/model/booking-labels";
import type { Booking } from "@/shared/contracts/bookings";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

type Kind = "approve" | "reject" | "cancel";

const TITLES: Record<Kind, string> = {
  approve: "Aprovar reserva",
  reject: "Recusar reserva",
  cancel: "Cancelar reserva",
};

/** A pending booking that still waits for the manager's decision. */
export const awaitsDecision = (booking: Booking, now: number) =>
  booking.status === "PENDING" && new Date(booking.startsAt).getTime() > now;

/** Whether the booking has any button for the manager. */
export function hasManageActions(booking: Booking, now: number) {
  const active = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const running = new Date(booking.endsAt).getTime() > now;
  return (
    active &&
    (booking.guestsAllowed ||
      awaitsDecision(booking, now) ||
      (running && booking.status === "CONFIRMED"))
  );
}

// The manager's buttons for one booking: the guest list, approve or reject
// a pending one, cancel a confirmed one (the booker is told, with the
// reason). "row" lines them up at the right; "grid" makes equal buttons in
// two columns (phones).
export function BookingManageActions({
  booking,
  now,
  layout = "row",
}: {
  booking: Booking;
  now: number;
  layout?: "row" | "grid";
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [kind, setKind] = useState<Kind | null>(null);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);

  if (!hasManageActions(booking, now)) return null;
  const running = new Date(booking.endsAt).getTime() > now;
  const deciding = awaitsDecision(booking, now);
  const period = formatBookingPeriod(booking);
  const needsReason = kind === "reject";

  function open(next: Kind) {
    setReason("");
    setKind(next);
  }

  async function run() {
    if (!kind) return;
    setPending(true);
    try {
      if (kind === "approve") {
        await bookingsClient.approve(booking.id);
        showSuccess("Reserva aprovada.", "O morador foi avisado.");
      } else if (kind === "reject") {
        await bookingsClient.reject(booking.id, reason);
        showSuccess("Reserva recusada.", "O morador foi avisado com o motivo.");
      } else {
        await bookingsClient.cancel(booking.id, reason.trim() || null);
        showSuccess("Reserva cancelada.", "O morador foi avisado.");
      }
      setKind(null);
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível concluir a ação.",
      );
    }
    setPending(false);
  }

  const buttons = [
    booking.guestsAllowed && (
      <Button
        key="guests"
        size="sm"
        variant="secondary"
        icon={<Users className="size-4" />}
        onClick={() => setGuestsOpen(true)}
      >
        Convidados
      </Button>
    ),
    deciding && (
      <Button
        key="approve"
        size="sm"
        variant="brand"
        icon={<Check className="size-4" />}
        onClick={() => open("approve")}
      >
        Aprovar
      </Button>
    ),
    deciding && (
      <Button
        key="reject"
        size="sm"
        variant="secondary"
        icon={<X className="size-4" />}
        onClick={() => open("reject")}
      >
        Recusar
      </Button>
    ),
    running && booking.status === "CONFIRMED" && (
      <Button
        key="cancel"
        size="sm"
        variant="cancel"
        icon={<CalendarX2 className="size-4" />}
        onClick={() => open("cancel")}
      >
        Cancelar
      </Button>
    ),
  ].filter(Boolean);

  return (
    <>
      <div
        className={cn(
          layout === "row"
            ? "flex flex-wrap justify-center gap-2 sm:justify-end"
            : "grid grid-cols-2 gap-2 [&>*]:w-full [&>*:last-child:nth-child(odd)]:col-span-2",
        )}
      >
        {buttons}
      </div>

      {booking.guestsAllowed && (
        <GuestsDrawer
          open={guestsOpen}
          onClose={() => setGuestsOpen(false)}
          booking={{ id: booking.id, spaceName: booking.spaceName, period }}
          editable={running}
        />
      )}
      <Modal
        open={kind !== null}
        onClose={() => setKind(null)}
        title={kind ? TITLES[kind] : ""}
        tone={kind === "approve" ? "neutral" : "danger"}
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setKind(null)}
              disabled={pending}
            >
              Voltar
            </Button>
            <Button
              variant={kind === "approve" ? "primary" : "danger"}
              onClick={run}
              loading={pending}
              disabled={needsReason && reason.trim().length < 3}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p>
            {booking.spaceName} · <span className="capitalize">{period}</span> ·{" "}
            {booking.userName}
          </p>
          {kind && kind !== "approve" && (
            <TextArea
              label={needsReason ? "Motivo da recusa" : "Motivo (opcional)"}
              required={needsReason}
              rows={3}
              maxLength={300}
              placeholder="O morador recebe esta mensagem."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          )}
        </div>
      </Modal>
    </>
  );
}
