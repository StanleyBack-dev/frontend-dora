import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { SpaceBlocksCard } from "@/features/bookings/components/SpaceBlocksCard";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { bookingsService } from "@/server/services/bookings.service";
import { spacesService } from "@/server/services/spaces.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Bloqueios" };

// Every space's blocks (maintenance, a condominium event…) in one place,
// for whoever manages bookings: add or remove them per space. Spaces with a
// block come first.
export default async function SpaceBlocksPage() {
  const user = await getSessionUser();
  if (!can(user, "BOOKINGS_MANAGE")) return <AccessDenied />;
  const [spaces, blocks] = await authed((token) =>
    Promise.all([
      spacesService.list(token, true),
      bookingsService.allBlocks(token),
    ]),
  );
  const blocked = new Set(blocks.map((block) => block.spaceId));
  const ordered = [...spaces].sort(
    (a, b) =>
      Number(blocked.has(b.id)) - Number(blocked.has(a.id)) ||
      a.name.localeCompare(b.name, "pt-BR"),
  );

  return (
    <>
      <PageHeader
        title="Bloqueios"
        description={`Períodos em que um espaço não aceita reservas: ${blocks.length} ${blocks.length === 1 ? "bloqueio atual ou futuro" : "bloqueios atuais ou futuros"}. Reservas no período só são canceladas depois que você confirmar.`}
      />
      {ordered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MapPin className="size-5" />}
            title="Nenhum espaço ainda"
            description="Cadastre os espaços em Espaços para poder bloqueá-los."
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {ordered.map((space) => (
            <SpaceBlocksCard
              key={space.id}
              spaceId={space.id}
              title={space.active ? space.name : `${space.name} (inativo)`}
              blocks={blocks.filter((block) => block.spaceId === space.id)}
              manager
            />
          ))}
        </div>
      )}
    </>
  );
}
