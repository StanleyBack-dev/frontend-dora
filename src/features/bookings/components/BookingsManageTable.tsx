"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarX2, Check, Repeat, Users, Wallet, X } from "lucide-react";
import {
  Badge,
  Button,
  DataTable,
  Modal,
  TextArea,
  type DataTableColumn,
} from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import { GuestsDrawer } from "@/features/bookings/components/GuestsDrawer";
import {
  BOOKING_STATUS,
  formatBookingPeriod,
} from "@/features/bookings/model/booking-labels";
import type { Booking } from "@/shared/contracts/bookings";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

type Action = { kind: "approve" | "reject" | "cancel"; booking: Booking };

const TITLES: Record<Action["kind"], string> = {
  approve: "Aprovar reserva",
  reject: "Recusar reserva",
  cancel: "Cancelar reserva",
};

// Every booking of the condominium for managers: approve or reject the
// pending ones, cancel any active one (the booker is told, with the reason)
// and see or change its guest list.
export function BookingsManageTable({
  bookings,
  now,
}: {
  bookings: Booking[];
  now: number;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [guestsOf, setGuestsOf] = useState<Booking | null>(null);

  function open(kind: Action["kind"], booking: Booking) {
    setReason("");
    setAction({ kind, booking });
  }

  async function run() {
    if (!action) return;
    setPending(true);
    try {
      if (action.kind === "approve") {
        await bookingsClient.approve(action.booking.id);
        showSuccess("Reserva aprovada.", "O morador foi avisado.");
      } else if (action.kind === "reject") {
        await bookingsClient.reject(action.booking.id, reason);
        showSuccess("Reserva recusada.", "O morador foi avisado com o motivo.");
      } else {
        await bookingsClient.cancel(action.booking.id, reason.trim() || null);
        showSuccess("Reserva cancelada.", "O morador foi avisado.");
      }
      setAction(null);
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

  const columns: DataTableColumn<Booking>[] = [
    {
      key: "when",
      label: "Quando",
      mobile: "title",
      render: (booking) => (
        <span className="font-medium text-fg capitalize">
          {formatBookingPeriod(booking)}
        </span>
      ),
    },
    {
      key: "space",
      label: "Espaço",
      mobile: "subtitle",
      render: (booking) => (
        <span className="flex flex-col">
          <span>{booking.spaceName}</span>
          {(booking.feeCents !== null || booking.seriesId) && (
            <span className="flex flex-wrap gap-x-2 text-xs text-soft">
              {booking.feeCents !== null && (
                <span className="inline-flex items-center gap-1">
                  <Wallet aria-hidden className="size-3" />
                  {formatCents(booking.feeCents)}
                </span>
              )}
              {booking.seriesId && (
                <span className="inline-flex items-center gap-1">
                  <Repeat aria-hidden className="size-3" />
                  semanal
                </span>
              )}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "who",
      label: "Quem",
      render: (booking) => (
        <span className="flex flex-col">
          <span className="text-fg">{booking.userName}</span>
          {booking.unitLabel && (
            <span className="text-xs text-soft">{booking.unitLabel}</span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      label: "Situação",
      render: (booking) => (
        <span className="flex flex-col items-start gap-1">
          <Badge tone={BOOKING_STATUS[booking.status].tone}>
            {BOOKING_STATUS[booking.status].label}
          </Badge>
          {booking.notes && (
            <span className="text-xs text-soft">“{booking.notes}”</span>
          )}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      mobile: "detail",
      render: (booking) => {
        const active =
          booking.status === "PENDING" || booking.status === "CONFIRMED";
        const running = new Date(booking.endsAt).getTime() > now;
        if (!active) return null;
        return (
          <div className="flex flex-wrap justify-end gap-2">
            {booking.guestsAllowed && (
              <Button
                size="sm"
                variant="ghost"
                icon={<Users className="size-4" />}
                onClick={() => setGuestsOf(booking)}
              >
                Convidados
              </Button>
            )}
            {running && (
              <>
                {booking.status === "PENDING" &&
                  new Date(booking.startsAt).getTime() > now && (
                    <>
                      <Button
                        size="sm"
                        variant="brand"
                        icon={<Check className="size-4" />}
                        onClick={() => open("approve", booking)}
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<X className="size-4" />}
                        onClick={() => open("reject", booking)}
                      >
                        Recusar
                      </Button>
                    </>
                  )}
                {booking.status === "CONFIRMED" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<CalendarX2 className="size-4" />}
                    onClick={() => open("cancel", booking)}
                  >
                    Cancelar
                  </Button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  const needsReason = action?.kind === "reject";

  return (
    <>
      <DataTable rows={bookings} columns={columns} getId={(item) => item.id} />
      {guestsOf && (
        <GuestsDrawer
          open
          onClose={() => setGuestsOf(null)}
          booking={{
            id: guestsOf.id,
            spaceName: guestsOf.spaceName,
            period: formatBookingPeriod(guestsOf),
          }}
          editable={new Date(guestsOf.endsAt).getTime() > now}
        />
      )}
      <Modal
        open={action !== null}
        onClose={() => setAction(null)}
        title={action ? TITLES[action.kind] : ""}
        tone={action?.kind === "approve" ? "neutral" : "danger"}
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setAction(null)}
              disabled={pending}
            >
              Voltar
            </Button>
            <Button
              variant={action?.kind === "approve" ? "primary" : "danger"}
              onClick={run}
              loading={pending}
              disabled={needsReason && reason.trim().length < 3}
            >
              Confirmar
            </Button>
          </>
        }
      >
        {action && (
          <div className="space-y-3">
            <p>
              {action.booking.spaceName} ·{" "}
              <span className="capitalize">
                {formatBookingPeriod(action.booking)}
              </span>{" "}
              · {action.booking.userName}
            </p>
            {action.kind !== "approve" && (
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
        )}
      </Modal>
    </>
  );
}
