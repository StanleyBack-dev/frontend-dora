import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { buttonClasses, Card, EmptyState, PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { SpaceCard } from "@/features/spaces/components/SpaceCard";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { spacesService } from "@/server/services/spaces.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Espaços" };

// The spaces of the condominium, for whoever manages them. Residents see
// what they need of each space when booking (Reservas).
export default async function SpacesPage() {
  const user = await getSessionUser();
  // Checked here, not only in the layout: Next renders the page alongside
  // the layout, so a layout check alone would still send its data.
  if (!can(user, "SPACES_MANAGE")) return <AccessDenied />;
  const spaces = await authed((token) => spacesService.list(token, true));

  return (
    <>
      <PageHeader
        title="Espaços"
        description="Os espaços do condomínio, com fotos, horário e as regras de reserva de cada um."
        actions={
          <Link href="/espacos/novo" className={buttonClasses()}>
            <Plus aria-hidden className="mr-1.5 size-4" />
            Novo espaço
          </Link>
        }
      />
      {spaces.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MapPin className="size-5" />}
            title="Cadastre o primeiro espaço"
            description="Quadra, salão de festas, churrasqueira… Cada espaço tem o seu horário e as suas regras de reserva."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}
    </>
  );
}
