"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageCheck, Truck } from "lucide-react";
import { Badge, Button } from "@/design-system";
import { OrderSection } from "@/features/purchases/components/OrderSection";
import { ReceiptDrawer } from "@/features/purchases/components/ReceiptDrawer";
import { ReceiptList } from "@/features/purchases/components/ReceiptList";
import {
  formatQuantity,
  itemSpec,
} from "@/features/purchases/model/request-labels";
import type {
  PurchaseOrder,
  PurchaseOrderLine,
} from "@/shared/contracts/purchase-orders";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import { localDay } from "@/shared/lib/datetime";

/**
 * The deliveries of an order: each item with what was ordered, what arrived
 * and what is still to come; the deliveries recorded; "Registrar entrega"
 * while something is pending (the management and the gate).
 */
export function OrderDeliveries({
  request,
  order,
  lines,
  viewerId,
  canManage,
}: {
  request: PurchaseRequest;
  order: PurchaseOrder;
  lines: PurchaseOrderLine[];
  viewerId: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const open = lines.filter((line) => line.pending > 0);

  return (
    <OrderSection
      icon={<Truck />}
      title="Entregas"
      description={
        open.length === 0
          ? "Tudo chegou."
          : order.receipts.length === 0
            ? "Nada chegou ainda. A entrega pode vir em partes."
            : `Falta chegar ${open.length === 1 ? "1 item" : `${open.length} itens`}.`
      }
      actions={
        open.length > 0 ? (
          <Button
            variant="primary"
            className="justify-center"
            icon={<PackageCheck className="size-4" />}
            onClick={() => setRecording(true)}
          >
            Registrar entrega
          </Button>
        ) : undefined
      }
    >
      <ul className="divide-y divide-border rounded-xl border border-border">
        {lines.map((line) => (
          <li
            key={line.requestItemId}
            className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium break-words text-fg">
                {line.productName}
              </p>
              <p className="text-xs break-words text-soft">{itemSpec(line)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted sm:justify-end">
              <span>Pedido {formatQuantity(line.quantity, line.unit)}</span>
              <span aria-hidden>·</span>
              <span>Chegou {formatQuantity(line.received, line.unit)}</span>
              {line.pending > 0 ? (
                <Badge tone="warning">
                  Falta {formatQuantity(line.pending, line.unit)}
                </Badge>
              ) : (
                <Badge tone="success">Completo</Badge>
              )}
            </div>
          </li>
        ))}
      </ul>

      {order.receipts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-fg">
            Entregas registradas ({order.receipts.length})
          </p>
          <ReceiptList
            request={request}
            receipts={order.receipts}
            viewerId={viewerId}
            canManage={canManage}
          />
        </div>
      )}

      {recording && (
        <ReceiptDrawer
          requestId={request.id}
          lines={open}
          orderedOn={localDay(order.orderedAt)}
          onClose={() => setRecording(false)}
          onDone={() => {
            setRecording(false);
            router.refresh();
          }}
        />
      )}
    </OrderSection>
  );
}
