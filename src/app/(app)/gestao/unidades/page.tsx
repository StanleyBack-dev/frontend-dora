import type { Metadata } from "next";
import { PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { UnitsManager } from "@/features/condominiums/components/UnitsManager";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { condominiumsService } from "@/server/services/condominiums.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Unidades" };

export default async function UnitsPage() {
  const user = await getSessionUser();
  if (!can(user, "UNITS_MANAGE")) return <AccessDenied />;

  const units = await authed((token) => condominiumsService.units(token));
  return (
    <>
      <PageHeader
        title="Unidades"
        description="Os blocos e números (ou ruas, quadras e lotes) do condomínio."
      />
      <UnitsManager
        units={units}
        editable
        house={user.condominium?.addressFormat === "HOUSE"}
      />
    </>
  );
}
