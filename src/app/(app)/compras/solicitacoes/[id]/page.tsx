import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink, PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { PurchaseRequestDesk } from "@/features/purchases/components/PurchaseRequestDesk";
import { PurchaseRequestDetails } from "@/features/purchases/components/PurchaseRequestDetails";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { catalogService } from "@/server/services/catalog.service";
import { loadPurchaseRequest } from "@/server/loaders/load-purchase-request";
import { spacesService } from "@/server/services/spaces.service";
import { can, canAny } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Solicitação de compra" };

// One purchase request: its details and items and, while it waits for
// quotes, editing and cancelling. The management sees any request; who
// only asks for purchases, their own (the API answers 404 otherwise).
export default async function PurchaseRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (!canAny(user, "PURCHASES_MANAGE", "PURCHASES_REQUEST")) {
    return <AccessDenied />;
  }
  const { id } = await params;
  const request = await loadPurchaseRequest(id);
  if (!request) notFound();
  const desk = can(user, "PURCHASES_MANAGE");
  const [products, brands, spaces] = await Promise.all([
    authed((token) => catalogService.productOptions(token)),
    authed((token) => catalogService.brandOptions(token)),
    authed((token) => spacesService.list(token)),
  ]);

  return (
    <>
      <BackLink
        href="/compras/solicitacoes"
        label={desk ? "Solicitações de compra" : "Minhas solicitações"}
      />
      <PageHeader title={request.title} />
      <PurchaseRequestDesk
        request={request}
        viewerId={user.id}
        spaces={spaces.map((space) => ({ id: space.id, name: space.name }))}
        products={products}
        brands={brands}
      >
        <PurchaseRequestDetails request={request} />
      </PurchaseRequestDesk>
    </>
  );
}
