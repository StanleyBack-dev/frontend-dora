import type { Metadata } from "next";
import { CalendarDays, CircleCheck, MapPin, Ticket } from "lucide-react";
import { Alert, Badge } from "@/design-system";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { InviteCode } from "@/features/bookings/components/InviteCode";
import { inviteQrSvg } from "@/features/bookings/model/invite-qr";
import { eventPeriod } from "@/features/events/model/event-labels";
import { requestOrigin } from "@/server/http/request-origin";
import { eventsService } from "@/server/services/events.service";

const SHARE_TITLE = "Ingresso · Dora";
const SHARE_DESCRIPTION = "Mostre este ingresso na portaria do condomínio.";

export const metadata: Metadata = {
  title: "Ingresso",
  robots: { index: false },
  // Shared over WhatsApp: its own preview, without personal data.
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Dora",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
};

// A person's event ticket: for whom, which event, where, when, and the QR
// the gate reads. No account needed; the code is the key (the API limits
// how many a connection opens). Only tickets of confirmed orders exist.
export default async function EventTicketPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const ticket = /^[A-Za-z0-9-]{4,20}$/.test(code)
    ? await eventsService.ticketPass(code)
    : null;

  if (!ticket) {
    return (
      <AuthLayout>
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-extrabold text-fg">
            Ingresso não encontrado
          </h1>
          <p className="text-sm text-muted">
            Confira o link que você recebeu ou peça um novo a quem comprou o
            ingresso.
          </p>
        </div>
      </AuthLayout>
    );
  }

  const valid = ticket.status === "VALID";
  const qrSvg = await inviteQrSvg(
    `${await requestOrigin()}/ingresso/${ticket.code}`,
  );
  return (
    <AuthLayout>
      <div className="space-y-5">
        <div className="text-center">
          <p className="text-xs font-bold tracking-[0.14em] text-brand-ink uppercase">
            Ingresso
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-fg">
            {ticket.name}
          </h1>
          {ticket.buyerFirstName && (
            <p className="mt-1 text-sm text-muted">
              pedido de {ticket.buyerFirstName}
            </p>
          )}
          <div className="mt-3 flex justify-center">
            {ticket.checkedIn ? (
              <Badge tone="success">Entrada registrada</Badge>
            ) : valid ? (
              <Badge tone="brand">Válido</Badge>
            ) : ticket.status === "CANCELLED" ? (
              <Badge tone="danger">Evento cancelado</Badge>
            ) : (
              <Badge tone="neutral">Encerrado</Badge>
            )}
          </div>
        </div>

        <InviteCode
          code={ticket.code}
          qrSvg={qrSvg}
          muted={!valid || ticket.checkedIn}
          label="Código do ingresso"
          qrLabel="QR code do ingresso"
        />

        <dl className="divide-y divide-border rounded-xl border border-border text-sm">
          <div className="flex items-start gap-3 px-4 py-3">
            <Ticket aria-hidden className="mt-0.5 size-4 shrink-0 text-soft" />
            <div>
              <dt className="sr-only">Evento</dt>
              <dd className="font-medium text-fg">{ticket.eventTitle}</dd>
              {ticket.ticketName && (
                <dd className="text-muted">{ticket.ticketName}</dd>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 px-4 py-3">
            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-soft" />
            <div>
              <dt className="sr-only">Onde</dt>
              <dd className="font-medium text-fg">{ticket.placeName}</dd>
              <dd className="text-muted">{ticket.condominiumName}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 px-4 py-3">
            <CalendarDays
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-soft"
            />
            <div>
              <dt className="sr-only">Quando</dt>
              <dd className="font-medium text-fg first-letter:uppercase">
                {eventPeriod(ticket)}
              </dd>
            </div>
          </div>
        </dl>

        {ticket.checkedIn ? (
          <Alert tone="success">
            <CircleCheck aria-hidden className="mr-1 inline size-4" />A portaria
            já registrou a sua entrada.
          </Alert>
        ) : valid ? (
          <p className="text-center text-sm text-muted">
            Na portaria, mostre este QR ou diga o código. A entrada é liberada a
            partir de 3 horas antes do evento, uma vez por ingresso.
          </p>
        ) : (
          <Alert tone={ticket.status === "CANCELLED" ? "danger" : "info"}>
            {ticket.status === "CANCELLED"
              ? "O evento foi cancelado: este ingresso não vale mais."
              : "O evento já terminou: este ingresso não vale mais."}
          </Alert>
        )}
      </div>
    </AuthLayout>
  );
}
