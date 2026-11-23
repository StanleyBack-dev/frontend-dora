"use client";

import Link from "next/link";
import { Eye, Wallet } from "lucide-react";
import {
  Badge,
  DataTable,
  EmptyState,
  FileLink,
  IconLink,
  type DataTableColumn,
} from "@/design-system";
import { RowTitle } from "@/features/purchases/components/RowTitle";
import { InstallmentActions } from "@/features/purchases/components/InstallmentActions";
import {
  INSTALLMENT_BADGES,
  installmentName,
  installmentState,
  orderCode,
} from "@/features/purchases/model/order-labels";
import {
  formatRequestDay,
  requestCode,
} from "@/features/purchases/model/request-labels";
import type { PaymentBoardRow } from "@/shared/contracts/purchase-orders";
import { localDay } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";

const orderHref = (row: PaymentBoardRow) => `/compras/pedidos/${row.requestId}`;

/** "OC-0003 · Parcela 2 de 3", "OC-0004 · Pagamento". */
const installmentLabel = (row: PaymentBoardRow) =>
  `${orderCode(row.orderNumber)} · ${installmentName(row.number, row.installmentCount)}${row.installmentCount > 1 ? ` de ${row.installmentCount}` : ""}`;

/** The installment's actions; on a phone card, "pay" or the "others". */
const RowActions = ({
  row,
  part,
}: {
  row: PaymentBoardRow;
  part?: "pay" | "others";
}) => (
  <InstallmentActions
    requestId={row.requestId}
    installment={row}
    count={row.installmentCount}
    orderedOn={localDay(row.orderedAt)}
    context={`${orderCode(row.orderNumber)} · ${row.supplierName}`}
    part={part}
  />
);

/**
 * The payments page (Compras > Pagamentos): every installment by due day,
 * with its order, purchase and supplier, the value and where it stands; the
 * management pays, moves the due day or undoes from here.
 */
export function PaymentBoardTable({
  rows,
  filtered,
  canManage,
}: {
  rows: PaymentBoardRow[];
  filtered: boolean;
  canManage: boolean;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<Wallet className="size-5" />}
        title={filtered ? "Nenhuma parcela encontrada" : "Nada a pagar"}
        description={
          filtered
            ? "Tente outra situação ou solicitação, ou limpe os filtros."
            : "As parcelas dos pedidos feitos aparecem aqui, pelo vencimento."
        }
      />
    );
  }

  const columns: DataTableColumn<PaymentBoardRow>[] = [
    {
      key: "due",
      label: "Vencimento",
      mobile: "title",
      className: "whitespace-nowrap",
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-medium text-fg">
            {formatRequestDay(row.dueOn)}
          </span>
          <span className="font-mono text-xs text-soft">
            {installmentLabel(row)}
          </span>
        </span>
      ),
      renderMobile: (row) => (
        <span className="font-medium text-fg">
          {formatRequestDay(row.dueOn)} · {formatCents(row.amountCents)}
        </span>
      ),
    },
    {
      key: "installment",
      label: "Parcela",
      desktop: "hidden",
      render: installmentLabel,
    },
    {
      key: "purchase",
      label: "Compra",
      render: (row) => (
        <RowTitle
          title={row.requestTitle}
          href={orderHref(row)}
          meta={`${requestCode(row.requestNumber)} · ${row.supplierName}`}
          mono={false}
        />
      ),
    },
    {
      key: "amount",
      label: "Valor",
      desktop: "column",
      mobile: "hidden",
      className: "whitespace-nowrap tabular-nums",
      render: (row) => formatCents(row.amountCents),
    },
    {
      key: "status",
      label: "Situação",
      mobile: "subtitle",
      render: (row) => {
        const badge = INSTALLMENT_BADGES[installmentState(row)];
        return <Badge tone={badge.tone}>{badge.label}</Badge>;
      },
    },
    {
      key: "paid",
      label: "Pagamento",
      desktop: "detail",
      render: (row) =>
        row.paidOn ? (
          <span className="flex flex-col gap-0.5">
            <span>
              Paga em {formatRequestDay(row.paidOn)}
              {row.paidByName && ` por ${row.paidByName}`}
            </span>
            {row.note && <span className="text-muted">{row.note}</span>}
            {row.proofUrl && (
              <FileLink href={row.proofUrl} label="Ver o comprovante" />
            )}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "open",
      label: "",
      desktop: "hidden",
      mobile: "control",
      render: (row) => (
        <>
          <IconLink href={orderHref(row)} label="Abrir pedido" icon={<Eye />} />
          {canManage && <RowActions row={row} part="pay" />}
        </>
      ),
    },
    ...(canManage
      ? [
          {
            key: "actions",
            label: "",
            className: "text-right",
            mobile: "detail" as const,
            render: (row: PaymentBoardRow) => <RowActions row={row} />,
            renderMobile: (row: PaymentBoardRow) => (
              <RowActions row={row} part="others" />
            ),
          },
        ]
      : []),
  ];

  return <DataTable rows={rows} columns={columns} getId={(row) => row.id} />;
}
