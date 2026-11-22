"use client";

import Link from "next/link";
import { ClipboardList, Eye } from "lucide-react";
import {
  Badge,
  buttonClasses,
  DataTable,
  EmptyState,
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
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import { formatDateTime } from "@/shared/lib/datetime";

const requestHref = (request: PurchaseRequest) =>
  `/compras/solicitacoes/${request.id}`;

// The purchase requests (Compras > Solicitações): code and title, priority,
// the day it is needed by and the status; category, place, items, who
// asked and when open below the row. The request's page has the items and
// the actions.
export function PurchaseRequestsTable({
  requests,
  filtered,
}: {
  requests: PurchaseRequest[];
  filtered: boolean;
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="size-5" />}
        title={
          filtered
            ? "Nenhuma solicitação encontrada"
            : "Nenhuma solicitação ainda"
        }
        description={
          filtered
            ? "Tente outra solicitação, solicitante, categoria, prioridade ou situação, ou limpe os filtros."
            : "Use “Nova solicitação” para pedir o que precisa ser comprado ou contratado."
        }
      />
    );
  }

  const columns: DataTableColumn<PurchaseRequest>[] = [
    {
      key: "request",
      label: "Solicitação",
      mobile: "title",
      render: (request) => (
        <span className="flex min-w-0 flex-col">
          <Link
            href={requestHref(request)}
            className="truncate font-medium text-fg hover:underline"
          >
            {request.title}
          </Link>
          <span className="font-mono text-xs text-soft">
            {requestCode(request.number)}
          </span>
        </span>
      ),
      renderMobile: (request) => (
        <span className="font-medium text-fg">
          {requestCode(request.number)} · {request.title}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Prioridade",
      render: (request) => (
        <Badge tone={PRIORITY_TONES[request.priority]}>
          {PRIORITY_LABELS[request.priority]}
        </Badge>
      ),
    },
    {
      key: "neededBy",
      label: "Precisa até",
      className: "whitespace-nowrap",
      render: (request) =>
        request.neededBy ? formatRequestDay(request.neededBy) : "—",
    },
    {
      key: "status",
      label: "Situação",
      mobile: "subtitle",
      render: (request) => (
        <Badge tone={REQUEST_STATUS_TONES[request.status]}>
          {REQUEST_STATUS_LABELS[request.status]}
        </Badge>
      ),
    },
    {
      key: "items",
      label: "Itens",
      desktop: "detail",
      render: (request) => itemsCount(request.items.length),
    },
    {
      key: "location",
      label: "Onde vai ser usado",
      desktop: "detail",
      render: (request) => request.location ?? "—",
    },
    {
      key: "requester",
      label: "Solicitante",
      desktop: "detail",
      render: (request) => request.requestedByName,
    },
    {
      key: "createdAt",
      label: "Feita em",
      desktop: "detail",
      render: (request) => formatDateTime(request.createdAt),
    },
    // Last of the details (its own folding block), as on Fornecedores.
    {
      key: "categories",
      label: "Categorias",
      desktop: "detail",
      render: (request) => <CategoriesFold value={request} />,
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      mobile: "detail",
      render: (request) => (
        <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
          <Link
            href={requestHref(request)}
            className={buttonClasses("primary", "sm")}
          >
            <Eye aria-hidden className="mr-1.5 size-4" />
            Ver solicitação
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={requests}
      columns={columns}
      getId={(request) => request.id}
    />
  );
}
