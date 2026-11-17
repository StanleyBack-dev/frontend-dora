import type { Metadata } from "next";
import { PageHeader } from "@/design-system";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { EventsList } from "@/features/events/components/EventsList";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { eventsService } from "@/server/services/events.service";
import {
  firstParam,
  oneOf,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Eventos" };

const PERIODS = ["proximos", "passados"] as const;

// The condominium's events for the residents: upcoming (next first) or
// past. Drafts and the event management live in Gestão → Eventos.
export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium?.modules.includes("EVENTS")) {
    return <ModuleUnavailable name="Eventos" />;
  }
  const period =
    oneOf(firstParam(await searchParams, "quando"), PERIODS) ?? "proximos";
  const events = await authed((token) =>
    eventsService.list(token, period === "passados" ? "PAST" : "UPCOMING"),
  );

  return (
    <>
      <PageHeader
        title="Eventos"
        description={`Os eventos do ${user.condominium.name}: festas, encontros e tudo o que acontece por aqui.`}
      />
      <EventsList
        events={events.filter((event) => event.status !== "DRAFT")}
        period={period}
        basePath="/eventos"
        emptyHint="Quando a administração publicar um evento, ele aparece aqui e você recebe um aviso."
      />
    </>
  );
}
