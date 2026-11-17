import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Alert, PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { EventForm } from "@/features/events/components/EventForm";
import { isEventOpen } from "@/features/events/model/event-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { loadCondominiumPix } from "@/server/loaders/load-condominium-pix";
import { loadEvent } from "@/server/loaders/load-event";
import { requestTime } from "@/server/request-time";
import { spacesService } from "@/server/services/spaces.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Editar evento" };

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!can(user, "EVENTS_MANAGE")) return <AccessDenied />;
  const event = await loadEvent((await params).id);
  if (!event) notFound();
  const open = isEventOpen(event, (await requestTime()).getTime());
  const [spaces, condominiumPix] = open
    ? await Promise.all([
        authed((token) => spacesService.list(token, true)),
        loadCondominiumPix(user),
      ])
    : [[], undefined];

  return (
    <>
      <Link
        href={`/gestao/eventos/${event.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> {event.title}
      </Link>
      <PageHeader
        title="Editar evento"
        description={
          event.status === "PUBLISHED"
            ? "Publicado: as mudanças aparecem para os moradores na hora."
            : "Rascunho: só a administração vê."
        }
      />
      {open ? (
        <EventForm
          event={event}
          condominiumPix={condominiumPix}
          spaces={spaces.map((space) => ({
            id: space.id,
            name: space.name,
            capacity: space.capacity,
          }))}
        />
      ) : (
        <Alert tone="info">
          Este evento já terminou ou foi cancelado e não pode mais mudar.
        </Alert>
      )}
    </>
  );
}
