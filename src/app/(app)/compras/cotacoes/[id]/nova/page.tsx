import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, BackLink, PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { QuoteForm } from "@/features/purchases/components/QuoteForm";
import { requestCode } from "@/features/purchases/model/request-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { loadPurchaseRequest } from "@/server/loaders/load-purchase-request";
import { purchaseQuotesService } from "@/server/services/purchase-quotes.service";
import { suppliersService } from "@/server/services/suppliers.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Nova cotação" };

/**
 * The management records a supplier's quote for a request, while it waits
 * for or is in quotes.
 */
export default async function NewPurchaseQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (!can(user, "PURCHASES_MANAGE")) return <AccessDenied />;
  const request = await loadPurchaseRequest((await params).id);
  if (!request) notFound();
  const open = request.status === "OPEN" || request.status === "QUOTING";
  const [quotes, suppliers] = open
    ? await Promise.all([
        authed((token) => purchaseQuotesService.list(token, request.id)),
        authed((token) => suppliersService.supplierOptions(token)),
      ])
    : [[], []];

  return (
    <>
      <BackLink
        href={`/compras/cotacoes/${request.id}`}
        label={request.title}
      />
      <PageHeader
        title="Nova cotação"
        description={`${requestCode(request.number)} · ${request.title}. Deixe vazio o item que o fornecedor não tem.`}
      />
      {open ? (
        <QuoteForm
          request={request}
          suppliers={suppliers}
          takenSupplierIds={quotes.map((quote) => quote.supplierId)}
        />
      ) : (
        <Alert tone="info">Esta solicitação não recebe mais cotações.</Alert>
      )}
    </>
  );
}
