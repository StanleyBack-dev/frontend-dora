import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { BackLink, Card, EmptyState, PageHeader } from "@/design-system";
import { ModulesMatrix } from "@/features/platform/components/ModulesMatrix";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { canRunPlatform } from "@/shared/lib/access";
import { condominiumsService } from "@/server/services/condominiums.service";

export const metadata: Metadata = { title: "Módulos" };

// Which condominium contracted which module (Plataforma, Módulos), switched
// right here.
export default async function PlatformModulesPage() {
  // Next renders the page alongside its layout: it checks again.
  if (!canRunPlatform(await getSessionUser())) return <AccessDenied />;
  const condominiums = await authed((token) => condominiumsService.list(token));

  return (
    <>
      <BackLink href="/administracao" label="Administração" />
      <PageHeader
        title="Módulos"
        description="O que cada condomínio contratou. Desligar não apaga nada: só fecha o menu e as páginas do módulo."
      />
      <Card>
        {condominiums.length === 0 ? (
          <EmptyState
            icon={<Building2 className="size-5" />}
            title="Nenhum condomínio ainda"
            description="Cadastre um condomínio em Condomínios."
          />
        ) : (
          <ModulesMatrix condominiums={condominiums} />
        )}
      </Card>
    </>
  );
}
