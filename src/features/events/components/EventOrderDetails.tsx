"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, X } from "lucide-react";
import { Badge, Button, Modal, TextArea } from "@/design-system";
import { eventsClient } from "@/features/events/api/events.client";
import type { EventOrder } from "@/shared/contracts/events";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatCents, formatDateTime } from "@/shared/lib/format";
import { formatTime } from "@/shared/lib/datetime";
import { formatPixKey, PIX_KEY_TYPE_LABELS } from "@/shared/lib/pix-key";
import { useToast } from "@/shared/toast/useToast";

// What an order's row opens: the people (with their tickets and
// documents), the PIX and dates, the receipt and, under review, approve
// or reject with a reason. The bank statement is checked by the order code
// (the PIX reference).
export function EventOrderDetails({ order }: { order: EventOrder }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [pending, setPending] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
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
    <div className="space-y-4 px-3 py-3 sm:px-0 sm:pt-2 sm:pb-1">
      <section className="space-y-1.5">
        <h3 className="text-[10px] font-medium tracking-wide text-soft uppercase">
          Pessoas
        </h3>
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface text-[13px]">
          {order.attendees.map((person) => (
            <li
              key={person.id}
              className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium text-fg">{person.name}</span>
                <span className="text-soft">{person.age} anos</span>
                {person.outside && <Badge tone="neutral">De fora</Badge>}
                {person.source !== "GUEST" && (
                  <Badge tone="info">
                    {person.source === "SELF" ? "Quem pediu" : "Dependente"}
                  </Badge>
                )}
                {person.checkedInAt && (
                  <Badge tone="success">
                    Entrou às {formatTime(person.checkedInAt)}
                  </Badge>
                )}
              </span>
              {person.ticketName && (
                <span className="shrink-0 text-muted">
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
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-ink hover:underline"
                  >
                    <ExternalLink aria-hidden className="size-3.5" />
                    Ver documento
                    {person.proofContentType === "application/pdf"
                      ? " (PDF)"
                      : ""}
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-warning">
                    Documento ainda não enviado.
                  </span>
                ))}
            </li>
          ))}
        </ul>
      </section>

      <dl className="grid gap-x-6 gap-y-3 text-[13px] sm:grid-cols-3">
        {order.pix && (
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-medium tracking-wide text-soft uppercase">
              PIX para
            </dt>
            <dd className="break-words text-fg">
              {order.pix.name} · {PIX_KEY_TYPE_LABELS[order.pix.keyType]}{" "}
              {formatPixKey(order.pix.keyType, order.pix.key)}
            </dd>
          </div>
        )}
        {order.receiptSentAt && (
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-soft uppercase">
              Comprovante enviado
            </dt>
            <dd className="text-fg">{formatDateTime(order.receiptSentAt)}</dd>
          </div>
        )}
        {order.status === "PENDING_PAYMENT" && order.expiresAt && (
          <div>
            <dt className="text-[10px] font-medium tracking-wide text-soft uppercase">
              Vagas reservadas até
            </dt>
            <dd className="text-fg">{formatDateTime(order.expiresAt)}</dd>
          </div>
        )}
        {order.rejectReason && (
          <div className="sm:col-span-3">
            <dt className="text-[10px] font-medium tracking-wide text-soft uppercase">
              Motivo da recusa
            </dt>
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
    </div>
  );
}
