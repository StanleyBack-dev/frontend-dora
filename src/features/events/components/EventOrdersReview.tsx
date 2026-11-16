"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ExternalLink, X } from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  TextArea,
  cn,
} from "@/design-system";
import { eventsClient } from "@/features/events/api/events.client";
import {
  ORDER_STATUS,
  peopleCount,
} from "@/features/events/model/order-labels";
import type { EventOrder } from "@/shared/contracts/events";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatCents, formatDateTime } from "@/shared/lib/format";
import { formatPixKey, PIX_KEY_TYPE_LABELS } from "@/shared/lib/pix-key";
import { useToast } from "@/shared/toast/useToast";

// An event's orders for whoever reviews payments, as folding rows: closed,
// the code, who ordered, the people and the amount; open, the people, the
// receipt and (under review) approve or reject with a reason. The bank
// statement is checked by the order code (the PIX reference).
export function EventOrdersReview({ orders }: { orders: EventOrder[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="Nenhum pedido aqui"
        description="Os pedidos desta situação aparecem nesta lista."
      />
    );
  }
  return (
    <ul className="divide-y divide-border">
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </ul>
  );
}

function OrderRow({ order }: { order: EventOrder }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [open, setOpen] = useState(order.status === "AWAITING_REVIEW");
  const [pending, setPending] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const bodyId = useId();
  const status = ORDER_STATUS[order.status];
  const pdf = order.receiptContentType === "application/pdf";

  async function approve() {
    setPending(true);
    try {
      await eventsClient.approveOrder(order.id);
      showSuccess(`Pedido ${order.code} confirmado.`, "O morador foi avisado.");
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível aprovar o pedido.",
      );
    }
    setPending(false);
  }

  async function reject() {
    setPending(true);
    try {
      await eventsClient.rejectOrder(order.id, reason.trim());
      setRejecting(false);
      showSuccess(`Pedido ${order.code} recusado.`, "O morador foi avisado.");
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível recusar o pedido.",
      );
    }
    setPending(false);
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted sm:px-5"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="font-mono text-sm font-semibold text-fg">
              {order.code}
            </span>
            <span className="truncate text-sm text-fg">
              {order.buyerName ?? "Conta removida"}
            </span>
          </span>
          <span className="block truncate text-xs text-soft">
            {[
              order.unitLabel,
              peopleCount(order),
              order.totalCents > 0 ? formatCents(order.totalCents) : "Grátis",
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <Badge tone={status.tone}>{status.label}</Badge>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-soft transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        id={bodyId}
        hidden={!open}
        className="space-y-4 border-t border-border bg-surface-muted/60 px-4 py-4 sm:px-5"
      >
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface text-sm">
          {order.attendees.map((person) => (
            <li
              key={person.id}
              className="flex flex-wrap items-center gap-x-2 px-3 py-2"
            >
              <span className="font-medium text-fg">{person.name}</span>
              <span className="text-soft">{person.age} anos</span>
              {person.outside && <Badge tone="neutral">De fora</Badge>}
              {person.source !== "GUEST" && (
                <Badge tone="info">
                  {person.source === "SELF" ? "Quem pediu" : "Dependente"}
                </Badge>
              )}
              {person.ticketName && (
                <span className="ml-auto text-muted">
                  {person.ticketName}
                  {person.priceCents > 0
                    ? ` · ${formatCents(person.priceCents)}`
                    : " · grátis"}
                </span>
              )}
              {person.needsProof &&
                (person.proofUrl ? (
                  <a
                    href={person.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center gap-1 pt-1 text-xs font-semibold text-brand-ink hover:underline"
                  >
                    <ExternalLink aria-hidden className="size-3.5" />
                    Ver documento de {person.name}
                    {person.proofContentType === "application/pdf"
                      ? " (PDF)"
                      : ""}
                  </a>
                ) : (
                  <span className="w-full pt-1 text-xs text-warning">
                    Documento ainda não enviado.
                  </span>
                ))}
            </li>
          ))}
        </ul>

        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-soft">Pedido em</dt>
            <dd className="text-fg">{formatDateTime(order.createdAt)}</dd>
          </div>
          {order.pix && (
            <div>
              <dt className="text-xs text-soft">PIX para</dt>
              <dd className="break-words text-fg">
                {order.pix.name} · {PIX_KEY_TYPE_LABELS[order.pix.keyType]}{" "}
                {formatPixKey(order.pix.keyType, order.pix.key)}
              </dd>
            </div>
          )}
          {order.receiptSentAt && (
            <div>
              <dt className="text-xs text-soft">Comprovante enviado</dt>
              <dd className="text-fg">{formatDateTime(order.receiptSentAt)}</dd>
            </div>
          )}
          {order.status === "PENDING_PAYMENT" && order.expiresAt && (
            <div>
              <dt className="text-xs text-soft">Reserva até</dt>
              <dd className="text-fg">{formatDateTime(order.expiresAt)}</dd>
            </div>
          )}
          {order.rejectReason && (
            <div className="sm:col-span-3">
              <dt className="text-xs text-soft">Motivo da recusa</dt>
              <dd className="text-fg">{order.rejectReason}</dd>
            </div>
          )}
        </dl>

        {order.receiptUrl &&
          (pdf ? (
            <a
              href={order.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline"
            >
              <ExternalLink aria-hidden className="size-4" />
              Abrir o comprovante (PDF)
            </a>
          ) : (
            <a
              href={order.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir em tamanho real"
              className="block max-w-xs overflow-hidden rounded-lg border border-border bg-white"
            >
              {/* A signed link to the stored receipt (WebP). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.receiptUrl}
                alt={`Comprovante do pedido ${order.code}`}
                className="max-h-96 w-full object-contain"
              />
            </a>
          ))}

        {order.status === "AWAITING_REVIEW" && (
          <div className="flex flex-wrap gap-2">
            <Button
              icon={<Check className="size-4" />}
              loading={pending && !rejecting}
              onClick={approve}
            >
              Aprovar pagamento
            </Button>
            <Button
              variant="danger"
              icon={<X className="size-4" />}
              disabled={pending}
              onClick={() => setRejecting(true)}
            >
              Recusar
            </Button>
          </div>
        )}
      </div>

      <Modal
        open={rejecting}
        onClose={() => !pending && setRejecting(false)}
        title={`Recusar o pedido ${order.code}?`}
        footer={
          <>
            <Button
              variant="cancel"
              onClick={() => setRejecting(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={pending}
              disabled={reason.trim().length < 3}
              onClick={reject}
            >
              Recusar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p>
            As vagas voltam e o morador é avisado com o motivo. Recuse só se o
            pagamento não estiver no extrato ou o valor estiver errado.
          </p>
          <TextArea
            label="Motivo"
            required
            rows={3}
            maxLength={300}
            data-autofocus
            placeholder="Ex.: o PIX não aparece no extrato; valor diferente do pedido."
            value={reason}
            onChange={(change) => setReason(change.target.value)}
          />
        </div>
      </Modal>
    </li>
  );
}
