import { ClipboardList } from "lucide-react";
import { Alert, Badge } from "@/design-system";
import { categoryLabels } from "@/features/catalog/model/categories";
import { RequestItemsList } from "@/features/purchases/components/RequestItemsList";
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

// A purchase request at a glance: code, status and priority, the facts
// (category, where, by when, who asked) and its items, so whoever quotes
// knows exactly what to ask the suppliers. Inside a list row, which already
// shows the code, status and priority, the header is left out.
export function PurchaseRequestDetails({
  request,
  withHeader = true,
}: {
  request: PurchaseRequest;
  withHeader?: boolean;
}) {
  const facts = [
    { label: "Onde vai ser usado", value: request.location },
    {
      label: "Precisa até",
      value: request.neededBy ? formatRequestDay(request.neededBy) : null,
    },
    {
      label: "Solicitante",
      value: `${request.requestedByName} · ${formatDateTime(request.createdAt)}`,
    },
  ].filter((fact) => fact.value);

  return (
    <div className="space-y-5">
      {withHeader && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-lg font-semibold tracking-wider text-fg">
            {requestCode(request.number)}
          </span>
          <Badge tone={REQUEST_STATUS_TONES[request.status]}>
            {REQUEST_STATUS_LABELS[request.status]}
          </Badge>
          <Badge tone={PRIORITY_TONES[request.priority]}>
            Prioridade {PRIORITY_LABELS[request.priority].toLowerCase()}
          </Badge>
        </div>
      )}

      {request.status === "CANCELLED" && request.cancelReason && (
        <Alert tone="warning">
          <strong>Cancelada</strong>
          {request.cancelledAt
            ? ` em ${formatDateTime(request.cancelledAt)}`
            : ""}
          . Motivo: {request.cancelReason}
        </Alert>
      )}

      <dl className="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className="text-xs text-soft">{fact.label}</dt>
            <dd className="break-words text-fg">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <p className="mb-1.5 text-xs text-soft">Categorias</p>
        <div className="flex flex-wrap gap-1.5">
          {categoryLabels(request).map((label) => (
            <Badge
              key={label}
              tone="neutral"
              className="max-w-full whitespace-normal"
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>

      {request.description && (
        <div>
          <p className="text-xs text-soft">Detalhes</p>
          <p className="text-sm whitespace-pre-line text-fg">
            {request.description}
          </p>
        </div>
      )}

      <section aria-label="Itens">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg">
          <ClipboardList aria-hidden className="size-4 text-soft" />
          {itemsCount(request.items.length)}
        </h2>
        <RequestItemsList items={request.items} />
      </section>
    </div>
  );
}
