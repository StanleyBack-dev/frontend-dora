import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, BackLink, PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { PurchaseRequestForm } from "@/features/purchases/components/PurchaseRequestForm";
import {
  isDetailsEditableRequest,
  requestCode,
} from "@/features/purchases/model/request-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { loadPurchaseRequest } from "@/server/loaders/load-purchase-request";
import { catalogService } from "@/server/services/catalog.service";
import { spacesService } from "@/server/services/spaces.service";
import { canAny } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Editar solicitação de compra" };

/** Edits a request while it waits for quotes (the API checks who may). */
export default async function EditPurchaseRequestPage({
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
  const request = await loadPurchaseRequest((await params).id);
  if (!request) notFound();
  const editable = isDetailsEditableRequest(request);
  const [products, brands, spaces] = editable
    ? await Promise.all([
        authed((token) => catalogService.productOptions(token)),
        authed((token) => catalogService.brandOptions(token)),
        authed((token) => spacesService.list(token)),
      ])
    : [[], [], []];

  return (
    <>
      <BackLink href="/compras/solicitacoes" label="Solicitações de compra" />
      <PageHeader
        title={`Editar solicitação ${requestCode(request.number)}`}
        description={
          request.status === "QUOTING"
            ? "Em cotação: só a prioridade, o local e a data podem mudar."
            : "Enquanto aguarda cotação, a solicitação pode mudar."
        }
      />
      {editable ? (
        <PurchaseRequestForm
          request={request}
          spaces={spaces.map((space) => ({ id: space.id, name: space.name }))}
          products={products}
          brands={brands}
        />
      ) : (
        <Alert tone="info">
          Esta solicitação já tem uma cotação escolhida ou foi encerrada: não
          pode mais mudar.
        </Alert>
      )}
    </>
  );
}
