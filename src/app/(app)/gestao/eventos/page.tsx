import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonClasses, PageHeader } from "@/design-system";
import { EventsList } from "@/features/events/components/EventsList";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { eventsService } from "@/server/services/events.service";
import { can } from "@/shared/lib/access";
import {
  firstParam,
  oneOf,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Eventos" };

const PERIODS = ["proximos", "passados"] as const;

// The events in the management: drafts included, a new one, and each event
// opens with its actions and orders.
export default async function ManagedEventsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  const manager = can(user, "EVENTS_MANAGE");
  const period =
    oneOf(firstParam(await searchParams, "quando"), PERIODS) ?? "proximos";
  const events = await authed((token) =>
    eventsService.list(token, period === "passados" ? "PAST" : "UPCOMING"),
  );

  return (
    <>
      <PageHeader
        title="Eventos"
        description="Crie, publique e acompanhe os eventos do condomínio e os pedidos de ingressos."
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
      />
    </>
  );
}
