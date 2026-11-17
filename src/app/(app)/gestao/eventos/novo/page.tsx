import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { EventForm } from "@/features/events/components/EventForm";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { loadCondominiumPix } from "@/server/loaders/load-condominium-pix";
import { spacesService } from "@/server/services/spaces.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Novo evento" };

export default async function NewEventPage() {
  const user = await getSessionUser();
  if (!can(user, "EVENTS_MANAGE")) return <AccessDenied />;
  const [spaces, condominiumPix] = await Promise.all([
    authed((token) => spacesService.list(token, true)),
    loadCondominiumPix(user),
  ]);

  return (
    <>
      <Link
        href="/gestao/eventos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> Eventos
      </Link>
      <PageHeader
        title="Novo evento"
        description="Fica como rascunho: só a administração vê até você publicar."
      />
      <EventForm
        event={null}
        condominiumPix={condominiumPix}
        spaces={spaces.map((space) => ({
          id: space.id,
          name: space.name,
          capacity: space.capacity,
        }))}
      />
    </>
  );
}
