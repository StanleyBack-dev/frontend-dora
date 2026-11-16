import { Ticket } from "lucide-react";
import { Card, CardBody } from "@/design-system";
import { priceLabel } from "@/features/events/model/ticket-kinds";
import { ageRange } from "@/features/events/model/ticketing-form";
import type { CondominiumEvent } from "@/shared/contracts/events";
import { formatDateTime } from "@/shared/lib/format";

// How to get in: the ticket types with prices and ages (paid event) or the
// free registration, and the places still free.
export function EventTicketsCard({
  event,
  onSale = false,
  action,
}: {
  event: CondominiumEvent;
  /** Takes orders now (published, before its sales close). */
  onSale?: boolean;
  /** The order button, when the event takes orders. */
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Ticket aria-hidden className="size-4 text-brand-ink" />
          <h2 className="text-sm font-semibold text-fg">
            {event.ticketed ? "Ingressos" : "Inscrição gratuita"}
          </h2>
          <span className="ml-auto text-xs text-muted">
            {event.placesLeft === 0
              ? "Esgotado"
              : `${event.placesLeft} ${event.placesLeft === 1 ? "vaga" : "vagas"}`}
            {event.externalGuestLimit > 0 && event.placesLeft > 0
              ? ` · ${event.outsidePlacesLeft} para convidados de fora`
              : ""}
          </span>
        </div>
        {event.ticketed ? (
          <ul className="divide-y divide-border rounded-lg border border-border text-sm">
            {event.ticketTypes.map((type) => {
              const range = ageRange(type.minAge, type.maxAge);
              return (
                <li
                  key={type.id}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <span>
                    <span className="font-medium text-fg">{type.name}</span>
                    {range && (
                      <span className="block text-xs text-soft">{range}</span>
                    )}
                  </span>
                  <span className="font-semibold whitespace-nowrap text-fg">
                    {priceLabel(type.priceMode, type.priceCents)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">
            Informe quem vai (nomes e idades) para garantir as vagas.
          </p>
        )}
        {event.ticketed && (
          <p className="text-xs text-soft">
            Meia, grátis e outros descontos podem pedir documento: a idade de
            quem não tem a data de nascimento no app, ou a condição (estudante,
            PcD, professor).
          </p>
        )}
        {onSale && (
          <p className="text-xs text-soft">
            {event.ticketed ? "Vendas" : "Inscrições"} até{" "}
            {formatDateTime(event.salesClosesAt)}
            {event.salesClose === "AT_END" ? " (fim do evento)" : ""}.
          </p>
        )}
        {event.unitTicketLimit && (
          <p className="text-xs text-soft">
            Até {event.unitTicketLimit} por unidade.
          </p>
        )}
        {action}
      </CardBody>
    </Card>
  );
}
