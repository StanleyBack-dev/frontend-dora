"use client";

import Link from "next/link";
import { Eye, PackageCheck } from "lucide-react";
import {
  Badge,
  buttonClasses,
  DataTable,
  EmptyState,
  IconLink,
  type DataTableColumn,
} from "@/design-system";
import { RowTitle } from "@/features/purchases/components/RowTitle";
import { PlaceOrderButton } from "@/features/purchases/components/PlaceOrderButton";
import {
  deliveryProgress,
  orderCode,
} from "@/features/purchases/model/order-labels";
import {
  formatRequestDay,
  PRIORITY_LABELS,
  PRIORITY_TONES,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_TONES,
  requestCode,
} from "@/features/purchases/model/request-labels";
import type { OrderBoardRow } from "@/shared/contracts/purchase-orders";
import { formatCents } from "@/shared/lib/format";
import { fullTitleColumn } from "@/features/purchases/model/request-columns";

const orderHref = (row: OrderBoardRow) => `/compras/pedidos/${row.request.id}`;

/** The order is still to place. */
const toOrder = (row: OrderBoardRow) => row.orderNumber === null;

/** "1 de 3 pagas · próxima 10/12/2026". */
const payment = (row: OrderBoardRow) =>
  row.installmentCount === 0
    ? "—"
    : row.installmentsPaid === row.installmentCount
      ? "Tudo pago"
      : `${row.installmentsPaid} de ${row.installmentCount} pagas${row.nextDueOn ? ` · próxima ${formatRequestDay(row.nextDueOn)}` : ""}`;

/**
 * The orders page (Compras > Pedidos): each approved purchase with its
 * order (or "a fazer"), the supplier and total, how the delivery and the
 * payment stand; "Fazer pedido" while the order is to place and "Abrir" for
 * the order page (PDF, send to the supplier, cancel, deliveries, payment).
 */
export function OrderBoardTable({
  rows,
  filtered,
  canManage,
}: {
  rows: OrderBoardRow[];
  filtered: boolean;
  /** Places, sends, cancels and rates; the approvers only follow. */
  canManage: boolean;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<PackageCheck className="size-5" />}
        title={
          filtered ? "Nenhuma compra encontrada" : "Nenhum pedido em andamento"
        }
        description={
          filtered
            ? "Tente outra solicitação, categoria, prioridade ou situação, ou limpe os filtros."
            : "Quando uma compra for aprovada, ela aparece aqui para fazer o pedido."
        }
      />
    );
  }

  /** "Fazer pedido" for the management while the order is to place. */
  const place = (row: OrderBoardRow) => canManage && toOrder(row);

  const columns: DataTableColumn<OrderBoardRow>[] = [
    {
      key: "request",
      label: "Solicitação",
      mobile: "title",
      render: (row) => (
        <RowTitle
          title={row.request.title}
          href={orderHref(row)}
          meta={`${requestCode(row.request.number)}${row.orderNumber !== null ? ` · ${orderCode(row.orderNumber)}` : ""}`}
        />
      ),
      renderMobile: (row) => (
        <span className="font-medium text-fg">
          {requestCode(row.request.number)} · {row.request.title}
        </span>
      ),
    },
    fullTitleColumn((row) => row.request.title),
    {
      key: "order",
      label: "Pedido",
      desktop: "hidden",
      render: (row) =>
        row.orderNumber === null ? "A fazer" : orderCode(row.orderNumber),
    },
    {
      key: "supplier",
      label: "Fornecedor",
      render: (row) =>
        row.supplierName ? (
          <span className="flex max-w-[10rem] min-w-0 flex-col lg:max-w-[14rem]">
            <span
              title={row.supplierName}
              className="truncate font-medium text-fg"
            >
              {row.supplierName}
            </span>
            {row.totalCents !== null && (
              <span className="text-xs text-soft tabular-nums">
                {formatCents(row.totalCents)}
              </span>
            )}
          </span>
        ) : (
          <span className="text-soft">—</span>
        ),
    },
    {
      key: "delivery",
      label: "Entrega",
      render: (row) => (toOrder(row) ? "—" : deliveryProgress(row)),
    },
    {
      key: "payment",
      label: "Pagamento",
      render: (row) => payment(row),
    },
    {
      key: "status",
      label: "Situação",
      mobile: "subtitle",
      render: (row) => (
        <Badge tone={REQUEST_STATUS_TONES[row.request.status]}>
          {toOrder(row)
            ? "Pedido a fazer"
            : REQUEST_STATUS_LABELS[row.request.status]}
        </Badge>
      ),
    },
    {
      key: "expected",
      label: "Entrega prevista",
      desktop: "detail",
      render: (row) =>
        row.expectedOn ? formatRequestDay(row.expectedOn) : "—",
    },
    {
      key: "priority",
      label: "Prioridade",
      desktop: "detail",
      render: (row) => (
        <Badge tone={PRIORITY_TONES[row.request.priority]}>
          {PRIORITY_LABELS[row.request.priority]}
        </Badge>
      ),
    },
    {
      key: "neededBy",
      label: "Precisa até",
      desktop: "detail",
      render: (row) =>
        row.request.neededBy ? formatRequestDay(row.request.neededBy) : "—",
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      mobile: "control",
      renderMobile: (row) => (
        <>
          <IconLink href={orderHref(row)} label="Abrir pedido" icon={<Eye />} />
          {place(row) && (
            <PlaceOrderButton requestId={row.request.id} iconOnly />
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
          {place(row) && <PlaceOrderButton requestId={row.request.id} />}
        </div>
      ),
    },
  ];

  return (
    <DataTable rows={rows} columns={columns} getId={(row) => row.request.id} />
  );
}
