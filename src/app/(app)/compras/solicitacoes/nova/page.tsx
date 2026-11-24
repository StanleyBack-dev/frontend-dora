import type { Metadata } from "next";
import { BackLink, PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { PurchaseRequestForm } from "@/features/purchases/components/PurchaseRequestForm";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { catalogService } from "@/server/services/catalog.service";
import { spacesService } from "@/server/services/spaces.service";
import { canAny } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Nova solicitação de compra" };

/** Asks for a purchase: what is needed, categories, where and when, items. */
export default async function NewPurchaseRequestPage() {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (!canAny(user, "PURCHASES_MANAGE", "PURCHASES_REQUEST")) {
    return <AccessDenied />;
  }
  const [products, brands, spaces] = await Promise.all([
    authed((token) => catalogService.productOptions(token)),
    authed((token) => catalogService.brandOptions(token)),
    authed((token) => spacesService.list(token)),
  ]);

  return (
    <>
      <BackLink href="/compras/solicitacoes" label="Solicitações de compra" />
      <PageHeader
        title="Nova solicitação de compra"
        description="Diga o que precisa ser comprado ou contratado. A gestão é avisada e faz as cotações."
      />
      <PurchaseRequestForm
        spaces={spaces.map((space) => ({ id: space.id, name: space.name }))}
        products={products}
        brands={brands}
      />
    </>
  );
}
