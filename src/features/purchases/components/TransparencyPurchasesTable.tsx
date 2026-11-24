"use client";

import { ReceiptText } from "lucide-react";
import { DataTable, type DataTableColumn, EmptyState } from "@/design-system";
import { CATEGORY_LABELS } from "@/features/catalog/model/categories";
import { RowTitle } from "@/features/purchases/components/RowTitle";
import {
  formatRequestDay,
  requestCode,
} from "@/features/purchases/model/request-labels";
import type { TransparencyPurchase } from "@/shared/contracts/purchase-indicators";
import { formatCents } from "@/shared/lib/format";

const categoriesOf = (row: TransparencyPurchase) =>
  row.categories
    .map((category) =>
      category === "OTHER" && row.categoryOther
        ? row.categoryOther
        : CATEGORY_LABELS[category],
    )
    .join(", ");

/**
 * The purchases completed in the period (received and paid), the latest
 * first: what, its categories, the supplier, how many quotes there were,
 * the day and the value. What the residents see; no files.
 */
export function TransparencyPurchasesTable({
  rows,
}: {
  rows: TransparencyPurchase[];
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText className="size-5" />}
        title="Nenhuma compra concluída no período"
        description="Quando uma compra for recebida e paga, ela aparece aqui."
      />
    );
  }
  const columns: DataTableColumn<TransparencyPurchase>[] = [
    {
      key: "purchase",
      label: "Compra",
      mobile: "title",
      render: (row) => (
        <RowTitle
          title={row.title}
          meta={`${requestCode(row.number)} · ${categoriesOf(row)}`}
          mono={false}
        />
      ),
      renderMobile: (row) => (
        <span className="font-medium text-fg">{row.title}</span>
      ),
    },
    {
      key: "value",
      label: "Valor",
      mobile: "subtitle",
      className: "text-right",
      render: (row) => (
        <span className="font-medium text-fg tabular-nums">
          {formatCents(row.totalCents)}
        </span>
      ),
    },
    {
      key: "supplier",
      label: "Fornecedor",
      render: (row) => row.supplierName,
    },
    {
      key: "categories",
      label: "Categoria",
      desktop: "hidden",
      render: (row) => categoriesOf(row),
    },
    {
      key: "quotes",
      label: "Cotações",
      className: "text-right",
      render: (row) => String(row.quoteCount),
    },
    {
      key: "completed",
      label: "Concluída",
      render: (row) => formatRequestDay(row.completedOn),
    },
  ];
  return (
    <DataTable
      rows={rows}
      columns={columns}
      getId={(row) => String(row.number)}
    />
  );
}
