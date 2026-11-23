import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ClipboardList } from "lucide-react";
import {
  BackLink,
  buttonClasses,
  cn,
  CollapsibleSection,
  PageHeader,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { CancelledOrdersSection } from "@/features/purchases/components/CancelledOrdersSection";
import { OrderDeliveries } from "@/features/purchases/components/OrderDeliveries";
import { OrderPayments } from "@/features/purchases/components/OrderPayments";
import { OrderSummaryCard } from "@/features/purchases/components/OrderSummaryCard";
import { PlaceOrderCard } from "@/features/purchases/components/PlaceOrderCard";
import { PurchaseRequestDetails } from "@/features/purchases/components/PurchaseRequestDetails";
import { SupplierRatingCard } from "@/features/purchases/components/SupplierRatingCard";
import { orderCode } from "@/features/purchases/model/order-labels";
import {
  itemsCount,
  requestCode,
} from "@/features/purchases/model/request-labels";
import { getSessionUser } from "@/server/auth/current-user";
import { loadPurchaseOrder } from "@/server/loaders/load-purchase-order";
import { canAny } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Pedido" };

/**
 * A purchase's order page, from the order to the payment: placing it (an
 * approved purchase), the order placed (PDF, send to the supplier, cancel),
 * the deliveries (the management and the gate), the payment installment by
 * installment and, once completed, the supplier's rating; folded, what was
 * asked. The gate sees no values; it comes from Recebimentos.
 */
export default async function PurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (
    !canAny(user, "PURCHASES_MANAGE", "PURCHASES_APPROVE", "PURCHASES_REQUEST")
  ) {
    return <AccessDenied />;
  }
  const view = await loadPurchaseOrder((await params).id);
  if (!view) notFound();
  const { request, order, lines, plan, canManage, canSeeMoney } = view;

  return (
    <>
      <BackLink
        href={canSeeMoney ? "/compras/pedidos" : "/compras/recebimentos"}
        label={canSeeMoney ? "Pedidos" : "Recebimentos"}
      />
      <PageHeader
        title={request.title}
        description={`${requestCode(request.number)}${order ? ` · ${orderCode(order.number)}` : ""} · ${itemsCount(request.items.length)} · pedida por ${request.requestedByName}`}
      />
      <div className="space-y-4">
        {order ? (
          <>
            <OrderSummaryCard
              request={request}
              order={order}
              canSeeMoney={canSeeMoney}
              canManage={canManage}
            />
            <OrderDeliveries
              request={request}
              order={order}
              lines={lines}
              viewerId={user.id}
              canManage={canManage}
            />
            {canSeeMoney && order.installments.length > 0 && (
              <OrderPayments
                requestId={request.id}
                order={order}
                canManage={canManage}
              />
            )}
            {canSeeMoney && request.status === "COMPLETED" && (
              <SupplierRatingCard
                requestId={request.id}
                supplierName={order.supplierName}
                rating={order.rating}
                canManage={canManage}
              />
            )}
          </>
        ) : (
          <PlaceOrderCard
            requestId={request.id}
            plan={plan}
            canManage={canManage}
          />
        )}

        <CancelledOrdersSection
          orders={view.cancelledOrders}
          defaultOpen={!order}
        />

        {canSeeMoney && (
          <div className="grid gap-2 sm:flex sm:justify-end">
            <Link
              href={`/compras/aprovacoes/${request.id}`}
              className={cn(buttonClasses("secondary"), "justify-center")}
            >
              <BadgeCheck aria-hidden className="size-4" />
              Ver a aprovação
            </Link>
          </div>
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
