"use client";

import Link from "next/link";
import { BadgeCheck, Eye } from "lucide-react";
import {
  Badge,
  buttonClasses,
  DataTable,
  EmptyState,
  IconLink,
  type DataTableColumn,
} from "@/design-system";
import { CategoriesFold } from "@/features/catalog/components/CategoriesFold";
import { ReceiptPdfButton } from "@/features/signature/components/ReceiptPdfButton";
import {
  formatRequestDay,
  itemsCount,
  PRIORITY_LABELS,
  PRIORITY_TONES,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_TONES,
  requestCode,
} from "@/features/purchases/model/request-labels";
import type {
  QuoteBoardPick,
  QuoteBoardRow,
} from "@/shared/contracts/purchase-quotes";
import { formatCents } from "@/shared/lib/format";

const approvalHref = (row: QuoteBoardRow) =>
  `/compras/aprovacoes/${row.request.id}`;

/** The "Resumo da compra" PDF, also offered on the approval page. */
function SummaryPdf({ row }: { row: QuoteBoardRow }) {
  return (
    <ReceiptPdfButton
      iconOnly
      variant="secondary"
      path={`/purchases/requests/${row.request.id}/summary`}
      fallbackName={`resumo-da-compra-${requestCode(row.request.number)}.pdf`}
      label="Resumo da compra (PDF)"
    />
  );
}

function Pick({ pick }: { pick: QuoteBoardPick | null }) {
  if (!pick) return <span className="text-soft">—</span>;
  return (
    <span className="flex min-w-0 flex-col">
      <span className="font-medium text-fg tabular-nums">
        {formatCents(pick.totalCents)}
      </span>
      <span className="truncate text-xs text-soft">{pick.supplierName}</span>
    </span>
  );
}

// The approvals page (Compras > Aprovações): each purchase waiting for a
// decision, approved or rejected, with the chosen quote (and the cheapest,
// to compare); priority, the day it is needed by, who chose, items and
// categories open below the row. "Decidir" (or "Ver") opens the purchase's
// approval page; the PDF button downloads its "Resumo da compra".
export function ApprovalBoardTable({
  rows,
  filtered,
}: {
  rows: QuoteBoardRow[];
  filtered: boolean;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<BadgeCheck className="size-5" />}
        title={
          filtered ? "Nenhuma compra encontrada" : "Nada aguardando aprovação"
        }
        description={
          filtered
            ? "Tente outra solicitação, categoria, prioridade ou situação, ou limpe os filtros."
            : "Quando a gestão escolher uma cotação que precise de aprovação, ela aparece aqui."
        }
      />
    );
  }

  const columns: DataTableColumn<QuoteBoardRow>[] = [
    {
      key: "request",
      label: "Solicitação",
      mobile: "title",
      render: (row) => (
        <span className="flex min-w-0 flex-col">
          <Link
            href={approvalHref(row)}
            className="truncate font-medium text-fg hover:underline"
          >
            {row.request.title}
          </Link>
          <span className="font-mono text-xs text-soft">
            {requestCode(row.request.number)}
          </span>
        </span>
      ),
      renderMobile: (row) => (
        <span className="font-medium text-fg">
          {requestCode(row.request.number)} · {row.request.title}
        </span>
      ),
    },
    // Phones cut the title in the card header: the whole name opens here.
    {
      key: "title",
      label: "Solicitação",
      desktop: "hidden",
      render: (row) => row.request.title,
    },
    {
      key: "chosen",
      label: "Escolhida",
      render: (row) => <Pick pick={row.chosen} />,
    },
    {
      key: "cheapest",
      label: "Mais barata",
      render: (row) => <Pick pick={row.cheapest} />,
    },
    {
      key: "status",
      label: "Situação",
      mobile: "subtitle",
      render: (row) => (
        <Badge tone={REQUEST_STATUS_TONES[row.request.status]}>
          {REQUEST_STATUS_LABELS[row.request.status]}
        </Badge>
      ),
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
      key: "chosenBy",
      label: "Escolhida por",
      desktop: "detail",
      render: (row) => row.request.chosenByName ?? "—",
    },
    {
      key: "quotes",
      label: "Cotações",
      desktop: "detail",
      render: (row) =>
        `${row.quoteCount} (${row.completeCount} com todos os itens)`,
    },
    {
      key: "items",
      label: "Itens",
      desktop: "detail",
      render: (row) => itemsCount(row.request.items.length),
    },
    {
      key: "categories",
      label: "Categorias",
      desktop: "detail",
      render: (row) => <CategoriesFold value={row.request} />,
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      mobile: "control",
      renderMobile: (row) => (
        <>
          <SummaryPdf row={row} />
          <IconLink
            href={approvalHref(row)}
            label={
              row.request.status === "AWAITING_APPROVAL" ? "Decidir" : "Ver"
            }
            icon={
              row.request.status === "AWAITING_APPROVAL" ? (
                <BadgeCheck />
              ) : (
                <Eye />
              )
            }
            variant="primary"
          />
        </>
      ),
      render: (row) => (
        <div className="flex justify-end gap-2">
          <SummaryPdf row={row} />
          <Link
            href={approvalHref(row)}
            className={buttonClasses(
              row.request.status === "AWAITING_APPROVAL"
                ? "primary"
                : "secondary",
              "sm",
            )}
          >
            {row.request.status === "AWAITING_APPROVAL" ? (
              <>
                <BadgeCheck aria-hidden className="size-4" />
                Decidir
              </>
            ) : (
              <>
                <Eye aria-hidden className="size-4" />
                Ver
              </>
            )}
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DataTable rows={rows} columns={columns} getId={(row) => row.request.id} />
  );
}
