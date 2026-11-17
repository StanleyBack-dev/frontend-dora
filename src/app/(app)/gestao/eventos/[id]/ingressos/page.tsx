import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { EventTicketsBoard } from "@/features/events/components/EventTicketsBoard";
import { eventPeriod } from "@/features/events/model/event-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { loadEvent } from "@/server/loaders/load-event";
import { eventsService } from "@/server/services/events.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Ingressos e entradas" };

// An event's tickets and entries for its managers: everyone of the confirmed
// orders and who already came in through the gate.
export default async function EventTicketsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!can(user, "EVENTS_MANAGE")) return <AccessDenied />;
  const event = await loadEvent((await params).id);
  if (!event) notFound();
  const tickets = await authed((token) =>
    eventsService.tickets(token, event.id),
  );

  return (
    <>
      <Link
        href="/gestao/eventos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> Eventos
      </Link>
      <PageHeader
        title={event.title}
        description={`Ingressos e entradas · ${eventPeriod(event)}. Quem tem ingresso e quem já entrou pela portaria.`}
      />
      <EventTicketsBoard tickets={tickets} />
    </>
  );
}
