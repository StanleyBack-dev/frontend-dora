import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";
import {
  Alert,
  BackLink,
  CollapsibleSection,
  PageHeader,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { PurchaseRequestDetails } from "@/features/purchases/components/PurchaseRequestDetails";
import { QuotesPanel } from "@/features/purchases/components/QuotesPanel";
import {
  itemsCount,
  requestCode,
} from "@/features/purchases/model/request-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { loadPurchaseRequest } from "@/server/loaders/load-purchase-request";
import { purchaseQuotesService } from "@/server/services/purchase-quotes.service";
import { can, canAny } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Cotação" };

/**
 * A request's quote page: what was asked (folded, to check the items while
 * quoting) and the quotes with the comparison map (screen, PDF, sharing).
 * Adding, editing, choosing and reopening are the management's; the
 * approvers read. The approval has a page of its own (/compras/aprovacoes).
 */
export default async function RequestQuotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (!canAny(user, "PURCHASES_MANAGE", "PURCHASES_APPROVE")) {
    return <AccessDenied />;
  }
  const canManage = can(user, "PURCHASES_MANAGE");
  const request = await loadPurchaseRequest((await params).id);
  if (!request) notFound();
  const cancelled = request.status === "CANCELLED";
  const quotes = cancelled
    ? []
    : await authed((token) => purchaseQuotesService.list(token, request.id));

  return (
    <>
      <BackLink href="/compras/cotacoes" label="Cotações" />
      <PageHeader
        title={request.title}
        description={`${requestCode(request.number)} · ${itemsCount(request.items.length)} · pedida por ${request.requestedByName}`}
      />
      <div className="space-y-4">
        <CollapsibleSection
          icon={<ClipboardList className="size-4" />}
          title="Dados da solicitação"
          description="O que foi pedido: itens, quantidades, marcas e prazo."
          defaultOpen={false}
        >
          <PurchaseRequestDetails request={request} />
        </CollapsibleSection>
        {cancelled ? (
          <Alert tone="warning">
            Esta solicitação foi cancelada: não tem mais cotações.
          </Alert>
        ) : (
          <QuotesPanel
            request={request}
            quotes={quotes}
            canManage={canManage}
          />
        )}
      </div>
    </>
  );
}
