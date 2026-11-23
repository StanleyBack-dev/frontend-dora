"use client";

import Link from "next/link";
import { Eye, Truck } from "lucide-react";
import {
  Badge,
  buttonClasses,
  DataTable,
  EmptyState,
  IconLink,
  type DataTableColumn,
} from "@/design-system";
import { RowTitle } from "@/features/purchases/components/RowTitle";
import { RecordDeliveryButton } from "@/features/purchases/components/RecordDeliveryButton";
import {
  deliveryProgress,
  orderCode,
} from "@/features/purchases/model/order-labels";
import { fullTitleColumn } from "@/features/purchases/model/request-columns";
import {
  formatRequestDay,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_TONES,
  requestCode,
} from "@/features/purchases/model/request-labels";
import type { OrderBoardRow } from "@/shared/contracts/purchase-orders";
import { localDay } from "@/shared/lib/datetime";

const orderHref = (row: OrderBoardRow) => `/compras/pedidos/${row.request.id}`;

const waiting = (row: OrderBoardRow) => row.request.status === "ORDERED";

/**
 * The deliveries page (Compras > Recebimentos): each placed order with its
 * supplier, the expected day (late in red), how many items arrived and
 * "Registrar entrega" while something is missing; "Abrir" shows the order
 * page with the deliveries recorded. For the management, the approvers and
 * the gate (no values).
 */
export function DeliveryBoardTable({
  rows,
  filtered,
}: {
  rows: OrderBoardRow[];
  filtered: boolean;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<Truck className="size-5" />}
        title={
          filtered ? "Nenhum pedido encontrado" : "Nenhuma entrega aguardada"
        }
        description={
          filtered
            ? "Tente outra situação, categoria ou prioridade, ou limpe os filtros."
            : "Quando a gestão fizer um pedido ao fornecedor, ele aparece aqui para registrar a entrega."
        }
      />
    );
  }
  const today = localDay(new Date());

  const columns: DataTableColumn<OrderBoardRow>[] = [
    {
      key: "request",
      label: "Pedido",
      mobile: "title",
      render: (row) => (
        <RowTitle
          title={row.request.title}
          href={orderHref(row)}
          meta={
            <>
              {row.orderNumber !== null && orderCode(row.orderNumber)} ·{" "}
              {requestCode(row.request.number)}
            </>
          }
        />
      ),
      renderMobile: (row) => (
        <span className="font-medium text-fg">
          {row.orderNumber !== null && `${orderCode(row.orderNumber)} · `}
          {row.request.title}
        </span>
      ),
    },
    fullTitleColumn((row) => row.request.title),
    {
      key: "supplier",
      label: "Fornecedor",
      render: (row) => row.supplierName ?? "—",
    },
    {
      key: "expected",
      label: "Entrega prevista",
      render: (row) =>
        row.expectedOn ? (
          <span className="flex flex-wrap items-center gap-1.5">
            {formatRequestDay(row.expectedOn)}
            {waiting(row) && row.expectedOn < today && (
              <Badge tone="danger">Atrasada</Badge>
            )}
          </span>
        ) : (
          "A combinar"
        ),
    },
    {
      key: "items",
      label: "Itens recebidos",
      render: (row) => deliveryProgress(row),
    },
    {
      key: "status",
      label: "Situação",
      mobile: "subtitle",
      render: (row) => (
        <Badge tone={REQUEST_STATUS_TONES[row.request.status]}>
          {waiting(row) && row.receiptCount > 0
            ? "Chegou em parte"
            : waiting(row)
              ? "Aguardando entrega"
              : REQUEST_STATUS_LABELS[row.request.status]}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      mobile: "control",
      renderMobile: (row) => (
        <>
          <IconLink href={orderHref(row)} label="Abrir pedido" icon={<Eye />} />
          {waiting(row) && (
            <RecordDeliveryButton requestId={row.request.id} iconOnly />
          )}
        </>
      ),
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Link
            href={orderHref(row)}
            className={buttonClasses("secondary", "sm")}
          >
            <Eye aria-hidden className="size-4" />
            Abrir
          </Link>
          {waiting(row) && <RecordDeliveryButton requestId={row.request.id} />}
        </div>
      ),
    },
  ];

  return (
    <DataTable rows={rows} columns={columns} getId={(row) => row.request.id} />
  );
}
