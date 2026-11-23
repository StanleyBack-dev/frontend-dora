"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button, ConfirmModal, FileLink } from "@/design-system";
import { purchaseOrdersClient } from "@/features/purchases/api/purchase-orders.client";
import {
  formatQuantity,
  formatRequestDay,
} from "@/features/purchases/model/request-labels";
import type { PurchaseReceipt } from "@/shared/contracts/purchase-orders";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import { errorMessage } from "@/shared/lib/api-client";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

/**
 * What removing a delivery does: what came in it is missing again (with
 * its invoice, if any) and a received or completed purchase goes back to
 * waiting for the delivery (a completed one leaves "Concluídas" and its
 * rating is hidden until it completes again).
 */
function removeWarning(
  receipt: PurchaseReceipt,
  status: PurchaseRequest["status"],
): string {
  const invoice =
    receipt.invoiceNumber || receipt.fileUrl ? " com a nota fiscal" : "";
  const back =
    status === "COMPLETED"
      ? " A compra deixa de estar concluída e volta a aguardar a entrega; a avaliação do fornecedor fica oculta até concluir de novo."
      : status === "RECEIVED"
        ? " A compra volta a aguardar a entrega."
        : "";
  return `A entrega de ${formatRequestDay(receipt.receivedOn)} sai da compra${invoice} e o que veio nela volta a faltar.${back}`;
}

/**
 * The deliveries recorded for a purchase, the latest first: the day, who
 * received, what came of each item, the invoice (and its file) and the
 * note. The management, or whoever recorded one, removes it when recorded
 * by mistake (what came in it is missing again).
 */
export function ReceiptList({
  request,
  receipts,
  viewerId,
  canManage,
}: {
  request: PurchaseRequest;
  receipts: PurchaseReceipt[];
  viewerId: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [removing, setRemoving] = useState<PurchaseReceipt | null>(null);
  const [pending, setPending] = useState(false);
  const items = new Map(request.items.map((item) => [item.id, item]));

  if (receipts.length === 0) {
    return <p className="text-sm text-muted">Nada chegou ainda.</p>;
  }

  async function remove() {
    if (!removing) return;
    setPending(true);
    try {
      await purchaseOrdersClient.removeReceipt(request.id, removing.id);
      showSuccess("Entrega removida.");
      setRemoving(null);
      router.refresh();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível remover a entrega."));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <ul className="w-full space-y-2 text-left">
        {[...receipts].reverse().map((receipt) => (
          <li
            key={receipt.id}
            className="rounded-xl border border-border px-3 py-2.5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">
                  {formatRequestDay(receipt.receivedOn)}
                </p>
                <p className="text-xs text-muted">
                  Recebida por {receipt.receivedByName ?? "—"}
                </p>
              </div>
              {(canManage || receipt.receivedById === viewerId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger"
                  icon={<Trash2 className="size-4" />}
                  onClick={() => setRemoving(receipt)}
                >
                  Remover
                </Button>
              )}
            </div>
            <p className="mt-1 text-sm break-words text-fg">
              {receipt.items
                .map((line) => {
                  const item = items.get(line.requestItemId);
                  return item
                    ? `${item.productName}: ${formatQuantity(line.quantity, item.unit)}`
                    : null;
                })
                .filter(Boolean)
                .join(" · ")}
            </p>
            {(receipt.invoiceNumber || receipt.fileUrl) && (
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                <span>
                  NF
                  {receipt.invoiceNumber ? ` nº ${receipt.invoiceNumber}` : ""}
                  {receipt.invoiceCents !== null
                    ? ` · ${formatCents(receipt.invoiceCents)}`
                    : ""}
                  {receipt.invoiceDate
                    ? ` · ${formatRequestDay(receipt.invoiceDate)}`
                    : ""}
                </span>
                {receipt.fileUrl && (
                  <FileLink href={receipt.fileUrl} label="Ver a nota" />
                )}
              </p>
            )}
            {receipt.note && (
              <p className="mt-1 text-sm break-words text-fg">
                <span className="text-muted">Observação:</span> {receipt.note}
              </p>
            )}
          </li>
        ))}
      </ul>
      <ConfirmModal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remover entrega"
        confirmLabel="Remover"
        pending={pending}
        onConfirm={() => void remove()}
      >
        {removing && removeWarning(removing, request.status)}
      </ConfirmModal>
    </>
  );
}
