"use client";

import Link from "next/link";
import { BadgeCheck, Calculator, Scale } from "lucide-react";
import {
  Badge,
  buttonClasses,
  DataTable,
  EmptyState,
  IconLink,
  type DataTableColumn,
} from "@/design-system";
import { CategoriesFold } from "@/features/catalog/components/CategoriesFold";
import {
  formatRequestDay,
  itemsCount,
  PRIORITY_LABELS,
  PRIORITY_TONES,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_TONES,
  requestCode,
} from "@/features/purchases/model/request-labels";
import {
  MIN_QUOTES,
  type QuoteBoardPick,
  type QuoteBoardRow,
} from "@/shared/contracts/purchase-quotes";
import { formatCents } from "@/shared/lib/format";

const requestHref = (row: QuoteBoardRow) =>
  `/compras/cotacoes/${row.request.id}`;

/** A quote was chosen: the purchase has its approval page. */
const hasApproval = (row: QuoteBoardRow) =>
  row.request.status === "AWAITING_APPROVAL" ||
  row.request.status === "APPROVED" ||
  row.request.status === "REJECTED";

function Pick({ pick }: { pick: QuoteBoardPick | null }) {
  if (!pick) return <span className="text-soft">—</span>;
  return (
    <span className="flex min-w-0 flex-col">
      <span className="font-medium text-fg">
        {formatCents(pick.totalCents)}
      </span>
      <span className="truncate text-xs text-soft">{pick.supplierName}</span>
    </span>
  );
}

// The quotes page (Compras > Cotações): each request in the quote stages
// with its number of quotes (short of the recommended in red), the
// cheapest complete one and the chosen one; priority, the day it is
// needed by, items and categories open below the row. "Abrir cotação" opens
// the request's quote page (the comparison map); "Adicionar cotação" the quote form.
export function QuoteBoardTable({
  rows,
  filtered,
}: {
  rows: QuoteBoardRow[];
  filtered: boolean;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<Scale className="size-5" />}
        title={
          filtered
            ? "Nenhuma solicitação encontrada"
            : "Nenhuma cotação pendente"
        }
        description={
          filtered
            ? "Tente outra solicitação, categoria, prioridade ou situação, ou limpe os filtros."
            : "As solicitações aguardando cotação aparecem aqui. As aprovadas e reprovadas ficam no filtro “Situação”."
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
            href={requestHref(row)}
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
      key: "quotes",
      label: "Cotações",
      className: "whitespace-nowrap",
      render: (row) => (
        <Badge
          tone={
            row.quoteCount === 0
              ? "neutral"
              : row.quoteCount < MIN_QUOTES
                ? "danger"
                : "success"
          }
        >
          {row.quoteCount} de {MIN_QUOTES}
        </Badge>
      ),
    },
    {
      key: "cheapest",
      label: "Mais barata",
      render: (row) => <Pick pick={row.cheapest} />,
    },
    {
      key: "chosen",
      label: "Escolhida",
      render: (row) => <Pick pick={row.chosen} />,
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
      key: "complete",
      label: "Completas",
      desktop: "detail",
      render: (row) =>
        `${row.completeCount} de ${row.quoteCount} com preço para todos os itens`,
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
          {(row.request.status === "OPEN" ||
            row.request.status === "QUOTING") && (
            <IconLink
              href={`${requestHref(row)}/nova`}
              label="Adicionar cotação"
              icon={<Calculator />}
            />
          )}
          {hasApproval(row) && (
            <IconLink
              href={`/compras/aprovacoes/${row.request.id}`}
              label="Ver aprovação"
              icon={<BadgeCheck />}
            />
          )}
          <IconLink
            href={requestHref(row)}
            label="Abrir cotação"
            icon={<Scale />}
            variant="primary"
          />
        </>
      ),
      render: (row) => (
        <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
          {(row.request.status === "OPEN" ||
            row.request.status === "QUOTING") && (
            <Link
              href={`${requestHref(row)}/nova`}
              className={buttonClasses("secondary", "sm")}
            >
              <Calculator aria-hidden className="mr-1.5 size-4" />
              Adicionar cotação
            </Link>
          )}
          {hasApproval(row) && (
            <Link
              href={`/compras/aprovacoes/${row.request.id}`}
              className={buttonClasses("secondary", "sm")}
            >
              <BadgeCheck aria-hidden className="mr-1.5 size-4" />
              Aprovação
            </Link>
          )}
          <Link
            href={requestHref(row)}
            className={buttonClasses("primary", "sm")}
          >
            <Scale aria-hidden className="mr-1.5 size-4" />
            Abrir cotação
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DataTable rows={rows} columns={columns} getId={(row) => row.request.id} />
  );
}
