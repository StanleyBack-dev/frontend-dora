import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/design-system";
import { SpaceCard } from "@/features/spaces/components/SpaceCard";
import { authed } from "@/server/auth/current-user";
import { spacesService } from "@/server/services/spaces.service";

export const metadata: Metadata = { title: "Nova reserva" };

// Step 1 of a booking: the spaces open for booking (active ones only).
export default async function NewBookingPage() {
  const spaces = await authed((token) => spacesService.list(token, false));

  return (
    <>
      <Link
        href="/reservas"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> Reservas
      </Link>
      <PageHeader
        title="Nova reserva"
        description="Escolha o espaço que você quer reservar."
      />
      {spaces.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MapPin className="size-5" />}
            title="Nenhum espaço disponível para reserva"
            description="Quando a administração cadastrar os espaços do condomínio, eles aparecem aqui."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {spaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              href={`/reservas/nova/${space.id}`}
              cta="Reservar"
            />
          ))}
        </div>
      )}
    </>
  );
}
