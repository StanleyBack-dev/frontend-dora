import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, PackageCheck, Scale } from "lucide-react";
import {
  Alert,
  BackLink,
  buttonClasses,
  cn,
  CollapsibleSection,
  PageHeader,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { ApprovalPanel } from "@/features/purchases/components/ApprovalPanel";
import { ApprovalQuoteMap } from "@/features/purchases/components/ApprovalQuoteMap";
import { ReceiptPdfButton } from "@/features/signature/components/ReceiptPdfButton";
import { PurchaseRequestDetails } from "@/features/purchases/components/PurchaseRequestDetails";
import {
  itemsCount,
  requestCode,
  isApprovedOrLater,
} from "@/features/purchases/model/request-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { loadPurchaseRequest } from "@/server/loaders/load-purchase-request";
import { purchaseApprovalsService } from "@/server/services/purchase-approvals.service";
import { purchaseQuotesService } from "@/server/services/purchase-quotes.service";
import { can, canAny } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Aprovação" };

/**
 * A purchase's approval page, apart from its quotes: the decision (waiting,
 * with "Aprovar", "Devolver" and "Reprovar" for whoever approves; or how it
 * was decided) beside the chosen quote, the decisions so far, and, folded,
 * the comparison map and what was asked. The management lands here after
 * choosing a quote and follows it; only the approvers decide.
 */
export default async function PurchaseApprovalPage({
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
  const canApprove = can(user, "PURCHASES_APPROVE");
  const canManage = can(user, "PURCHASES_MANAGE");
  const request = await loadPurchaseRequest((await params).id);
  if (!request) notFound();
  const [quotes, approvals, settings] = await Promise.all([
    authed((token) => purchaseQuotesService.list(token, request.id)),
    authed((token) => purchaseApprovalsService.history(token, request.id)),
    authed((token) => purchaseApprovalsService.settings(token)),
  ]);
  const hasApproval =
    request.status === "AWAITING_APPROVAL" ||
    isApprovedOrLater(request.status) ||
    request.status === "REJECTED" ||
    approvals.length > 0;

  return (
    <>
      <BackLink
        href={canApprove ? "/compras/aprovacoes" : "/compras/cotacoes"}
        label={canApprove ? "Aprovações" : "Cotações"}
      />
      <PageHeader
        title={request.title}
        description={`${requestCode(request.number)} · ${itemsCount(request.items.length)} · pedida por ${request.requestedByName}`}
      />
      <div className="space-y-4">
        {hasApproval ? (
          <ApprovalPanel
            request={request}
            quotes={quotes}
            approvals={approvals}
            settings={settings}
            canApprove={canApprove}
          />
        ) : (
          <Alert tone="info">
            Esta compra ainda não tem cotação escolhida: a aprovação começa
            quando a gestão escolher uma.
          </Alert>
        )}

        <div className="grid gap-2 sm:flex sm:justify-end">
          <ReceiptPdfButton
            path={`/purchases/requests/${request.id}/summary`}
            fallbackName={`resumo-da-compra-${requestCode(request.number)}.pdf`}
            label="Resumo da compra (PDF)"
            variant="brand"
            className="justify-center"
          />
          {isApprovedOrLater(request.status) && (
            <Link
              href={`/compras/pedidos/${request.id}`}
              className={cn(buttonClasses("secondary"), "justify-center")}
            >
              <PackageCheck aria-hidden className="size-4" />
              {canManage && request.status === "APPROVED"
                ? "Fazer o pedido"
                : "Ver o pedido"}
            </Link>
          )}
          {canManage && request.status !== "CANCELLED" && (
            <Link
              href={`/compras/cotacoes/${request.id}`}
              className={cn(buttonClasses("secondary"), "justify-center")}
            >
              <Scale aria-hidden className="size-4" />
              Ver as cotações
            </Link>
          )}
        </div>

        {quotes.length > 0 && (
          <ApprovalQuoteMap request={request} quotes={quotes} />
        )}

        <CollapsibleSection
          icon={<ClipboardList className="size-4" />}
          title="Dados da solicitação"
          description="O que foi pedido: itens, quantidades, marcas e prazo."
          defaultOpen={false}
        >
          <PurchaseRequestDetails request={request} />
        </CollapsibleSection>
      </div>
    </>
  );
}
