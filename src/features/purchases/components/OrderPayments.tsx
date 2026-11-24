import Link from "next/link";
import { Wallet } from "lucide-react";
import { Badge, FileLink } from "@/design-system";
import { InstallmentActions } from "@/features/purchases/components/InstallmentActions";
import { SectionCard } from "@/features/purchases/components/SectionCard";
import {
  INSTALLMENT_BADGES,
  installmentName,
  installmentState,
  orderCode,
  paymentLabel,
} from "@/features/purchases/model/order-labels";
import { formatRequestDay } from "@/features/purchases/model/request-labels";
import type { PurchaseOrder } from "@/shared/contracts/purchase-orders";
import { localDay } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";

/**
 * The payment of an order, installment by installment: value, due day and
 * where each stands, with the management's actions. Every order's
 * installments together are in Compras > Pagamentos.
 */
export function OrderPayments({
  requestId,
  order,
  canManage,
}: {
  requestId: string;
  order: PurchaseOrder;
  canManage: boolean;
}) {
  const installments = order.installments;
  const sum = (paid: boolean) =>
    installments
      .filter((item) => Boolean(item.paidOn) === paid)
      .reduce((total, item) => total + item.amountCents, 0);
  const openCents = sum(false);

  return (
    <SectionCard
      icon={<Wallet />}
      title="Pagamento"
      description={`${paymentLabel(order, installments.length)} · pago ${formatCents(sum(true))}${openCents > 0 ? ` · em aberto ${formatCents(openCents)}` : ""}`}
      actions={
        <Link
          href="/compras/pagamentos"
          className="text-sm font-semibold text-brand-ink underline"
        >
          Todas as contas a pagar
        </Link>
      }
    >
      <ul className="divide-y divide-border rounded-xl border border-border">
        {installments.map((installment) => {
          const badge = INSTALLMENT_BADGES[installmentState(installment)];
          return (
            <li
              key={installment.id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-fg">
                  {installmentName(installment.number, installments.length)}
                  <span className="tabular-nums">
                    {formatCents(installment.amountCents)}
                  </span>
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                </p>
                <p className="text-xs text-muted">
                  Vence em {formatRequestDay(installment.dueOn)}
                  {installment.paidOn &&
                    ` · paga em ${formatRequestDay(installment.paidOn)}${installment.paidByName ? ` por ${installment.paidByName}` : ""}`}
                </p>
                {installment.note && (
                  <p className="text-xs break-words text-muted">
                    {installment.note}
                  </p>
                )}
                {installment.proofUrl && (
                  <FileLink
                    href={installment.proofUrl}
                    label="Ver o comprovante"
                  />
                )}
              </div>
              {canManage && (
                <InstallmentActions
                  requestId={requestId}
                  installment={installment}
                  count={installments.length}
                  orderedOn={localDay(order.orderedAt)}
                  context={`${orderCode(order.number)} · ${order.supplierName}`}
                />
              )}
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
