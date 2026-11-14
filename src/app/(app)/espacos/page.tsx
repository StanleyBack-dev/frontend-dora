import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { buttonClasses, Card, EmptyState, PageHeader } from "@/design-system";
import { SpaceCard } from "@/features/spaces/components/SpaceCard";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { spacesService } from "@/server/services/spaces.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Espaços" };

export default async function SpacesPage() {
  const user = await getSessionUser();
  const manager = can(user, "SPACES_MANAGE");
  const spaces = await authed((token) => spacesService.list(token, manager));

  return (
    <>
      <PageHeader
        title="Espaços"
        description={
          manager
            ? "Os espaços do condomínio e as regras de reserva de cada um."
            : "Quadras, salão de festas e os outros espaços do condomínio. As reservas chegam aqui em breve."
        }
        actions={
          manager ? (
            <Link href="/espacos/novo" className={buttonClasses()}>
              <Plus aria-hidden className="mr-1.5 size-4" />
              Novo espaço
            </Link>
          ) : undefined
        }
      />
      {spaces.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MapPin className="size-5" />}
            title={
              manager
                ? "Cadastre o primeiro espaço"
                : "Nenhum espaço disponível ainda"
            }
            description={
              manager
                ? "Quadra, salão de festas, churrasqueira… Cada espaço tem o seu horário e as suas regras de reserva."
                : "Quando a administração cadastrar os espaços do condomínio, eles aparecem aqui."
            }
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
