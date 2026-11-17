import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ReceiptText, Ticket } from "lucide-react";
import { Badge, buttonClasses, PageHeader } from "@/design-system";
import { EventCard } from "@/features/events/components/EventCard";
import {
  EventsList,
  placesStats,
} from "@/features/events/components/EventsList";
import { ordersIn } from "@/features/events/model/order-filters";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { eventsService } from "@/server/services/events.service";
import { spacesService } from "@/server/services/spaces.service";
import { photosBySpace } from "@/features/spaces/model/space-photos";
import { can } from "@/shared/lib/access";
import {
  firstParam,
  oneOf,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Eventos" };

const PERIODS = ["proximos", "passados"] as const;

// The events in the management, the one page of the module: drafts
// included and a new one; each card opens the event, its tickets
// (Ingressos) and its orders (Pedidos, with how many wait for review).
export default async function ManagedEventsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  const manager = can(user, "EVENTS_MANAGE");
  const reviewer = can(user, "PAYMENTS_MANAGE");
  const period =
    oneOf(firstParam(await searchParams, "quando"), PERIODS) ?? "proximos";
  const [events, orders, spaces] = await authed((token) =>
    Promise.all([
      eventsService.list(token, period === "passados" ? "PAST" : "UPCOMING"),
      reviewer
        ? eventsService.ordersQueue(token, null, "AWAITING_REVIEW")
        : Promise.resolve([]),
      spacesService.list(token, can(user, "SPACES_MANAGE")),
    ]),
  );
  // What waits for review, by event.
  const waiting = ordersIn(orders, "conferir");
  const toCheck = (eventId: string) =>
    waiting.filter((order) => order.eventId === eventId).length;

  return (
    <>
      <PageHeader
        title="Eventos"
        description={
          waiting.length > 0
            ? `${waiting.length} ${waiting.length === 1 ? "pedido espera" : "pedidos esperam"} a conferência do comprovante ou dos documentos: abra os Pedidos do evento.`
            : "Crie e publique os eventos do condomínio; em cada um, os ingressos e os pedidos."
        }
        actions={
          manager ? (
            <Link
              href="/gestao/eventos/novo"
              className={buttonClasses("brand")}
            >
              <Plus aria-hidden className="mr-1.5 size-4" />
              Novo evento
            </Link>
          ) : undefined
        }
      />
      <EventsList
        events={events}
        period={period}
        basePath="/gestao/eventos"
        emptyHint="Crie um evento: ele fica como rascunho até você publicar."
        spacePhotos={photosBySpace(spaces)}
        card={(event, photos) => {
          const published = event.status !== "DRAFT";
          const pending = toCheck(event.id);
          return (
            <EventCard
              event={event}
              href={`/gestao/eventos/${event.id}`}
              cta="Ver evento"
              stats={placesStats(event)}
              photos={photos}
              badge={
                pending > 0 ? (
                  <Badge tone="warning">Para conferir</Badge>
                ) : undefined
              }
              actions={[
                ...(published && manager
                  ? [
                      {
                        href: `/gestao/eventos/${event.id}/ingressos`,
                        label: "Ingressos",
                        icon: <Ticket aria-hidden />,
                      },
                    ]
                  : []),
                ...(published && reviewer
                  ? [
                      {
                        href: `/gestao/eventos/${event.id}/pedidos`,
                        label: "Pedidos",
                        icon: <ReceiptText aria-hidden />,
                        count: pending,
                      },
                    ]
                  : []),
              ]}
            />
          );
        }}
      />
    </>
  );
}
