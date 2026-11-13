import type { Metadata } from "next";
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
  return <UnitsManager units={units} editable />;
}
