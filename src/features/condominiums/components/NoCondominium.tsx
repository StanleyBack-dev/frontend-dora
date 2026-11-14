import Link from "next/link";
import { Building2 } from "lucide-react";
import { buttonClasses, Card, EmptyState } from "@/design-system";
import type { SessionUser } from "@/shared/contracts/api";

// Pages that belong to one condominium, opened with none chosen.
export function NoCondominium({
  user,
}: {
  user: Pick<SessionUser, "platformAdmin" | "condominiums">;
}) {
  const description = user.platformAdmin
    ? "Esta área é de um condomínio. Entre em um pelo console de condomínios."
    : user.condominiums.length > 0
      ? "Escolha o condomínio no topo do menu para continuar."
      : "Você ainda não tem acesso a um condomínio.";
  return (
    <Card>
      <EmptyState
        icon={<Building2 className="size-5" />}
        title="Nenhum condomínio aberto"
        description={description}
        action={
          user.platformAdmin ? (
            <Link href="/admin/condominios" className={buttonClasses()}>
              Ver condomínios
            </Link>
          ) : undefined
        }
      />
    </Card>
  );
}
