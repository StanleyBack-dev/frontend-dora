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
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Editar cotação" };

// The management edits a quote while the request is in quotes.
export default async function EditPurchaseQuotePage({
  params,
}: {
  params: Promise<{ id: string; quoteId: string }>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (!can(user, "PURCHASES_MANAGE")) return <AccessDenied />;
  const { id, quoteId } = await params;
  const request = await loadPurchaseRequest(id);
  if (!request) notFound();
  const quotes = await authed((token) =>
    purchaseQuotesService.list(token, request.id),
  );
  const quote = quotes.find((each) => each.id === quoteId);
  if (!quote) notFound();

  return (
    <>
      <BackLink
        href={`/compras/cotacoes/${request.id}`}
        label={request.title}
      />
      <PageHeader
        title={`Editar cotação · ${quote.supplierName}`}
        description={`${requestCode(request.number)} · ${request.title}. Deixe vazio o item que o fornecedor não tem.`}
      />
      {request.status === "QUOTING" ? (
        <QuoteForm
          request={request}
          quote={quote}
          suppliers={[]}
          takenSupplierIds={[]}
        />
      ) : (
        <Alert tone="info">
          As cotações só mudam enquanto a solicitação está em cotação.
        </Alert>
      )}
    </>
  );
}
