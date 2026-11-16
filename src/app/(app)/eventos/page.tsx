import type { Metadata } from "next";
import Link from "next/link";
import { PartyPopper, Plus } from "lucide-react";
import {
  buttonClasses,
  Card,
  EmptyState,
  PageHeader,
  SegmentedNav,
} from "@/design-system";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { EventCard } from "@/features/events/components/EventCard";
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

// The condominium's events: upcoming (next first) or past. Managers also see
// their drafts and create new events.
export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium?.modules.includes("EVENTS")) {
    return <ModuleUnavailable name="Eventos" />;
  }
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
        description={`Os eventos do ${user.condominium.name}: festas, encontros e tudo o que acontece por aqui.`}
        actions={
          manager ? (
            <Link href="/eventos/novo" className={buttonClasses("brand")}>
              <Plus aria-hidden className="mr-1.5 size-4" />
              Novo evento
            </Link>
          ) : undefined
        }
      />
      <SegmentedNav
        label="Período"
        className="mb-4"
        items={[
          {
            label: "Próximos",
            href: "/eventos",
            active: period === "proximos",
          },
          {
            label: "Passados",
            href: "/eventos?quando=passados",
            active: period === "passados",
          },
        ]}
      />
      {events.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PartyPopper className="size-5" />}
            title={
              period === "passados"
                ? "Nenhum evento passado"
                : "Nenhum evento marcado"
            }
            description={
              period === "passados"
                ? "Os eventos que já aconteceram aparecem aqui."
                : manager
                  ? "Crie um evento: ele fica como rascunho até você publicar."
                  : "Quando a administração publicar um evento, ele aparece aqui e você recebe um aviso."
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </>
  );
}
