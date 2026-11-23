"use client";

import Link from "next/link";
import { ClipboardList, Pencil, Scale } from "lucide-react";
import {
  Badge,
  buttonClasses,
  DataTable,
  EmptyState,
  IconLink,
  type DataTableColumn,
} from "@/design-system";
import { PurchaseRequestExpanded } from "@/features/purchases/components/PurchaseRequestExpanded";
import {
  formatRequestDay,
  isDetailsEditableRequest,
  PRIORITY_LABELS,
  PRIORITY_TONES,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_TONES,
  requestCode,
} from "@/features/purchases/model/request-labels";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";

/** The request has a quote page (the management, once it isn't cancelled). */
const quotable = (request: PurchaseRequest) => request.status !== "CANCELLED";

function RowActions({
  request,
  canManage,
  compact = false,
}: {
  request: PurchaseRequest;
  canManage: boolean;
  /** Icons only (the phone card's header). */
  compact?: boolean;
}) {
  const edit = isDetailsEditableRequest(request);
  const quotes = canManage && quotable(request);
  if (!edit && !quotes) return null;
  if (compact) {
    return (
      <>
        {edit && (
          <IconLink
            href={`/compras/solicitacoes/${request.id}/editar`}
            label="Editar solicitação"
            icon={<Pencil />}
          />
        )}
        {quotes && (
          <IconLink
            href={`/compras/cotacoes/${request.id}`}
            label="Abrir cotação"
            icon={<Scale />}
            variant="primary"
          />
        )}
      </>
    );
  }
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:flex-nowrap sm:justify-end">
      {edit && (
        <Link
          href={`/compras/solicitacoes/${request.id}/editar`}
          className={buttonClasses("secondary", "sm")}
        >
          <Pencil aria-hidden className="mr-1.5 size-4" />
          Editar
        </Link>
      )}
      {quotes && (
        <Link
          href={`/compras/cotacoes/${request.id}`}
          className={buttonClasses("primary", "sm")}
        >
          <Scale aria-hidden className="mr-1.5 size-4" />
          Abrir cotação
        </Link>
      )}
    </div>
  );
}

// The purchase requests (Compras > Solicitações): code and title, priority,
// the day it is needed by and the status, with "Editar" (while it waits for
// quotes) and, for the management, "Abrir cotação" (the request's quote
// page, where the comparison map lives). The row opens to the whole
// request: facts, categories, details and items.
export function PurchaseRequestsTable({
  requests,
  filtered,
  viewerId,
  canManage,
  openId,
}: {
  requests: PurchaseRequest[];
  filtered: boolean;
  viewerId: string;
  /** Opens the quote pages (the management and the approvers). */
  canManage: boolean;
  /** A request to show open (the list filtered to it). */
  openId?: string;
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="size-5" />}
        title={
          filtered
            ? "Nenhuma solicitação encontrada"
            : "Nenhuma solicitação pendente"
        }
        description={
          filtered
            ? "Tente outra solicitação, solicitante, categoria, prioridade ou situação, ou limpe os filtros."
            : "Use “Nova solicitação” para pedir o que precisa ser comprado ou contratado. As aprovadas, reprovadas e canceladas ficam no filtro “Situação”."
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
          <span className="truncate font-medium text-fg">{request.title}</span>
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
    // Phones cut the title in the card header: the whole name opens here.
    {
      key: "title",
      label: "Solicitação",
      desktop: "hidden",
      render: (request) => request.title,
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
      key: "actions",
      label: "",
      className: "text-right",
      mobile: "control",
      render: (request) => (
        <RowActions request={request} canManage={canManage} />
      ),
      renderMobile: (request) => (
        <RowActions request={request} canManage={canManage} compact />
      ),
    },
  ];

  return (
    <DataTable
      rows={requests}
      columns={columns}
      getId={(request) => request.id}
      initiallyOpen={(request) => request.id === openId}
      renderExpanded={(request) => (
        <PurchaseRequestExpanded request={request} viewerId={viewerId} />
      )}
      renderDesktopExpanded={(request) => (
        <PurchaseRequestExpanded request={request} viewerId={viewerId} />
      )}
    />
  );
}
