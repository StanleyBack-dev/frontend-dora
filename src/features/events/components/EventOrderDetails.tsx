"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, FileText, X } from "lucide-react";
import { Alert, Badge, Button, Modal, TextArea, cn } from "@/design-system";
import { CopyShareValue } from "@/features/admin/components/CopyShareValue";
import { eventsClient } from "@/features/events/api/events.client";
import type { Attendee, EventOrder } from "@/shared/contracts/events";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatCents, formatDateTime } from "@/shared/lib/format";
import { formatTime } from "@/shared/lib/datetime";
import { formatPixKey, PIX_KEY_TYPE_LABELS } from "@/shared/lib/pix-key";
import { useToast } from "@/shared/toast/useToast";

// What an order's row opens, in blocks: the order at a glance (code to
// copy, dates, the PIX), the reason when it was rejected, the people (with
// their tickets and documents), and the receipt with the decision while it
// waits for review. The bank statement is checked by the order code (the
// PIX reference).
export function EventOrderDetails({
  order,
  showBuyer = false,
}: {
  order: EventOrder;
  /** Phones: who ordered goes here (the card shows whose tickets). */
  showBuyer?: boolean;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [pending, setPending] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const reviewing = order.status === "AWAITING_REVIEW";
  const paid = order.totalCents > 0;

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
    // Laid out by its own width (container queries): the same blocks fit a
    // phone card and a wide table row.
    <div className="@container space-y-4 sm:py-2">
      {/* The order at a glance. */}
      <dl className="grid grid-cols-1 gap-2 @sm:grid-cols-2 @3xl:grid-cols-4">
        {showBuyer && (
          <Info label="Quem pediu" wide>
            {order.buyerName ?? "Conta removida"}
            {order.unitLabel && (
              <span className="block text-xs text-muted">
                {order.unitLabel}
              </span>
            )}
          </Info>
        )}
        <Info label="Código do pedido">
          <CopyShareValue
            value={order.code}
            label="Código do pedido"
            share={false}
            valueClassName="font-mono font-semibold text-fg"
          />
        </Info>
        <Info label="Pedido em">{formatDateTime(order.createdAt)}</Info>
        {order.receiptSentAt && (
          <Info label="Comprovante enviado">
            {formatDateTime(order.receiptSentAt)}
          </Info>
        )}
        {order.status === "PENDING_PAYMENT" && order.expiresAt && (
          <Info label="Vagas reservadas até">
            {formatDateTime(order.expiresAt)}
          </Info>
        )}
        {order.reviewedAt && (
          <Info label="Conferido em">{formatDateTime(order.reviewedAt)}</Info>
        )}
        {order.pix && (
          <Info label="PIX para" wide>
            {order.pix.name}
            <span className="block text-xs text-muted">
              {PIX_KEY_TYPE_LABELS[order.pix.keyType]}{" "}
              {formatPixKey(order.pix.keyType, order.pix.key)}
            </span>
          </Info>
        )}
      </dl>

      {order.rejectReason && (
        <Alert tone="danger" title="Motivo da recusa">
          {order.rejectReason}
        </Alert>
      )}

      <Section title={`Pessoas (${order.attendees.length})`}>
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {order.attendees.map((person) => (
            <PersonRow key={person.id} person={person} />
          ))}
        </ul>
      </Section>

      {paid && (
        <Section title="Comprovante do PIX">
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-3 @xl:flex-row @xl:items-start">
            <Receipt order={order} />
            {reviewing && (
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <p className="text-[13px] text-muted">
                  Confira no extrato se o PIX de{" "}
                  <strong className="text-fg">
                    {formatCents(order.totalCents)}
                  </strong>{" "}
                  chegou com o código{" "}
                  <strong className="font-mono text-fg">{order.code}</strong> e,
                  se houver desconto, os documentos das pessoas.
                </p>
                <Decision
                  pending={pending}
                  rejecting={rejecting}
                  onApprove={approve}
                  onReject={() => setRejecting(true)}
                />
              </div>
            )}
          </div>
        </Section>
      )}
      {!paid && reviewing && (
        <Decision
          pending={pending}
          rejecting={rejecting}
          onApprove={approve}
          onReject={() => setRejecting(true)}
        />
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

/** A labelled value of the order at a glance. */
function Info({
  label,
  wide = false,
  children,
}: {
  label: string;
  /** Takes two columns (the PIX). */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border border-border bg-surface px-3 py-2",
        wide && "@sm:col-span-2",
      )}
    >
      <dt className="text-[10px] font-medium tracking-wide text-soft uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13px] break-words text-fg">{children}</dd>
    </div>
  );
}

/** A titled block of the details. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-[10px] font-medium tracking-wide text-soft uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** One person of the order: who, the tags, the ticket and the document. */
function PersonRow({ person }: { person: Attendee }) {
  return (
    <li className="flex flex-col gap-1.5 px-3 py-2.5 @md:flex-row @md:items-center @md:gap-4">
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2">
          <span className="truncate text-[13px] font-medium text-fg">
            {person.name}
          </span>
          <span className="shrink-0 text-xs text-soft">{person.age} anos</span>
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-1.5">
          {person.source !== "GUEST" && (
            <Badge tone="info">
              {person.source === "SELF" ? "Quem pediu" : "Dependente"}
            </Badge>
          )}
          {person.outside && <Badge tone="neutral">De fora</Badge>}
          {person.checkedInAt && (
            <Badge tone="success">
              Entrou às {formatTime(person.checkedInAt)}
            </Badge>
          )}
        </p>
      </div>
      {person.ticketName && (
        <p className="shrink-0 text-[13px] text-muted @md:text-right">
          {person.ticketName}
          <span className="block font-semibold text-fg">
            {person.priceCents > 0 ? formatCents(person.priceCents) : "Grátis"}
          </span>
        </p>
      )}
      {person.needsProof &&
        (person.proofUrl ? (
          <a
            href={person.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-ink hover:underline"
          >
            <FileText aria-hidden className="size-3.5" />
            Ver documento
            {person.proofContentType === "application/pdf" ? " (PDF)" : ""}
          </a>
        ) : (
          <span className="shrink-0 text-xs font-medium text-warning">
            Documento não enviado
          </span>
        ))}
    </li>
  );
}

/** The receipt: the image (opens full size) or the PDF link. */
function Receipt({ order }: { order: EventOrder }) {
  if (!order.receiptUrl) {
    return (
      <p className="text-[13px] text-soft">
        {order.status === "PENDING_PAYMENT"
          ? "O morador ainda não enviou o comprovante."
          : "Sem comprovante."}
      </p>
    );
  }
  if (order.receiptContentType === "application/pdf") {
    return (
      <a
        href={order.receiptUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline"
      >
        <ExternalLink aria-hidden className="size-4" />
        Abrir o comprovante (PDF)
      </a>
    );
  }
  return (
    <a
      href={order.receiptUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Abrir em tamanho real"
      className="block w-full shrink-0 overflow-hidden rounded-lg border border-border bg-white @xl:w-56"
    >
      {/* A signed link to the stored receipt (WebP). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={order.receiptUrl}
        alt={`Comprovante do pedido ${order.code}`}
        className="max-h-80 w-full object-contain"
      />
    </a>
  );
}

/** Approve or reject an order under review. */
function Decision({
  pending,
  rejecting,
  onApprove,
  onReject,
}: {
  pending: boolean;
  rejecting: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        icon={<Check className="size-4" />}
        loading={pending && !rejecting}
        onClick={onApprove}
      >
        Aprovar pagamento
      </Button>
      <Button
        variant="danger"
        icon={<X className="size-4" />}
        disabled={pending}
        onClick={onReject}
      >
        Recusar
      </Button>
    </div>
  );
}
