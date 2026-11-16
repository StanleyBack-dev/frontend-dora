"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileCheck, FileText, FileUp, Send, XCircle } from "lucide-react";
import QRCode from "qrcode";
import { Alert, Badge, Button, Card, CardBody, Modal } from "@/design-system";
import {
  DocumentField,
  type PickedDocument,
} from "@/features/documents/components/DocumentField";
import { eventsClient } from "@/features/events/api/events.client";
import {
  ORDER_STATUS,
  peopleCount,
} from "@/features/events/model/order-labels";
import { CopyPixButton } from "@/features/support-project/components/CopyPixButton";
import type { EventOrder } from "@/shared/contracts/events";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatCents, formatDateTime } from "@/shared/lib/format";
import { formatPixKey, PIX_KEY_TYPE_LABELS } from "@/shared/lib/pix-key";
import { useToast } from "@/shared/toast/useToast";

// The person's orders for this event. Unpaid: the PIX (QR code and copia e
// cola with the amount and the order code), the deadline, the receipt
// upload and giving up. Then: under review, confirmed (with the people) or
// refused (with the reason).
export function MyEventOrders({ orders }: { orders: EventOrder[] }) {
  if (orders.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-fg">Meus pedidos</h2>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </section>
  );
}

function OrderCard({ order }: { order: EventOrder }) {
  const status = ORDER_STATUS[order.status];
  const faded = order.status === "EXPIRED" || order.status === "CANCELLED";
  return (
    <Card className={faded ? "opacity-70" : undefined}>
      <CardBody className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-fg">
            {order.code}
          </span>
          <Badge tone={status.tone}>{status.label}</Badge>
          <span className="ml-auto text-sm text-muted">
            {peopleCount(order)}
            {order.totalCents > 0 && (
              <>
                {" · "}
                <strong className="text-fg">
                  {formatCents(order.totalCents)}
                </strong>
              </>
            )}
          </span>
        </div>

        <ul className="divide-y divide-border rounded-lg border border-border text-sm">
          {order.attendees.map((person) => (
            <li
              key={person.id}
              className="flex flex-wrap items-center gap-x-2 px-3 py-2"
            >
              <span className="font-medium text-fg">{person.name}</span>
              <span className="text-soft">{person.age} anos</span>
              {person.outside && <Badge tone="neutral">De fora</Badge>}
              {person.ticketName && (
                <span className="ml-auto text-muted">
                  {person.ticketName}
                  {person.priceCents > 0
                    ? ` · ${formatCents(person.priceCents)}`
                    : " · grátis"}
                </span>
              )}
              {person.needsProof &&
                (order.status === "PENDING_PAYMENT" || person.proofUrl) && (
                  <AttendeeProof
                    orderId={order.id}
                    attendee={person}
                    editable={order.status === "PENDING_PAYMENT"}
                  />
                )}
            </li>
          ))}
        </ul>

        {order.status === "PENDING_PAYMENT" && <OrderPayment order={order} />}
        {order.status === "AWAITING_REVIEW" && (
          <Alert tone="info">
            {order.totalCents > 0
              ? "Comprovante enviado"
              : "Documentos enviados"}
            {order.receiptSentAt
              ? ` em ${formatDateTime(order.receiptSentAt)}`
              : ""}
            . A administração vai conferir e você será avisado.
            {order.receiptUrl && (
              <>
                {" "}
                <a
                  href={order.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  Ver comprovante
                </a>
              </>
            )}
          </Alert>
        )}
        {order.status === "CONFIRMED" && (
          <Alert tone="success">
            {order.totalCents > 0
              ? "Pagamento conferido: suas vagas estão garantidas."
              : "Inscrição confirmada: suas vagas estão garantidas."}{" "}
            Os ingressos com QR code para a entrada chegam em breve no app.
          </Alert>
        )}
        {order.status === "REJECTED" && (
          <Alert tone="danger">
            Pedido recusado
            {order.rejectReason ? `: ${order.rejectReason}` : "."} Se já pagou,
            fale com a administração; se não, faça um novo pedido.
          </Alert>
        )}
        {order.status === "EXPIRED" && (
          <p className="text-sm text-soft">
            O prazo de 48 horas acabou sem o envio: as vagas voltaram.
          </p>
        )}
      </CardBody>
    </Card>
  );
}

function OrderPayment({ order }: { order: EventOrder }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [receipt, setReceipt] = useState<PickedDocument | null>(null);
  // The page takes a few seconds to come back with the new status: the
  // receipt stays on screen and the button busy until it does.
  const [refreshing, startRefresh] = useTransition();
  const [qr, setQr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const paid = order.totalCents > 0;
  const proofsLeft = order.attendees.filter(
    (person) => person.needsProof && !person.proofUrl,
  ).length;

  useEffect(() => {
    if (!order.pixCode) return;
    let alive = true;
    QRCode.toString(order.pixCode, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      color: { dark: "#111111", light: "#ffffff" },
    })
      .then((svg) => alive && setQr(svg))
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [order.pixCode]);

  // The receipt is attached (and shown) first; it goes on "Enviar".
  async function send() {
    if (!receipt) return;
    setSending(true);
    try {
      await eventsClient.submitReceipt(order.id, receipt.base64);
      showSuccess(
        "Comprovante enviado.",
        "A administração vai conferir o pagamento.",
      );
      startRefresh(() => router.refresh());
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível enviar o comprovante.",
      );
    }
    setSending(false);
  }

  async function cancel() {
    setCancelling(true);
    try {
      await eventsClient.cancelOrder(order.id);
      setConfirmCancel(false);
      showSuccess("Pedido cancelado.", "As vagas foram liberadas.");
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível cancelar o pedido.",
      );
    }
    setCancelling(false);
  }

  return (
    <div className="space-y-3 rounded-xl border border-warning-border bg-warning-soft/40 p-3 sm:p-4">
      <p className="text-sm text-fg">
        {paid ? (
          <>
            Pague <strong>{formatCents(order.totalCents)}</strong> por PIX e
            envie o comprovante
            {proofsLeft > 0
              ? ` (e ${proofsLeft === 1 ? "o documento pedido" : "os documentos pedidos"} acima)`
              : ""}
          </>
        ) : (
          "Envie os documentos pedidos acima"
        )}
        {order.expiresAt ? (
          <>
            {" "}
            até <strong>{formatDateTime(order.expiresAt)}</strong>
          </>
        ) : null}
        . Depois disso, as vagas voltam.
        {paid && order.receiptUrl ? " Comprovante já enviado." : ""}
      </p>
      {order.pixCode && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          {qr && (
            <div
              role="img"
              aria-label={`QR code PIX do pedido ${order.code}`}
              className="w-44 shrink-0 rounded-xl bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
              // Our own SVG, made by the qrcode library from the PIX code.
              dangerouslySetInnerHTML={{ __html: qr }}
            />
          )}
          <div className="w-full min-w-0 space-y-2 text-center sm:text-left">
            <p className="text-xs text-muted">
              Abra o app do banco em Pix → Ler QR code, ou copie o código e cole
              em Pix → Copia e cola. O valor e o código do pedido já vão
              preenchidos.
            </p>
            <CopyPixButton payload={order.pixCode} />
            {order.pix && (
              <p className="text-xs text-soft">
                Recebedor: {order.pix.name} ·{" "}
                {PIX_KEY_TYPE_LABELS[order.pix.keyType]}{" "}
                {formatPixKey(order.pix.keyType, order.pix.key)}
              </p>
            )}
          </div>
        </div>
      )}
      {paid && (
        <DocumentField
          label={
            order.receiptUrl
              ? "Trocar o comprovante do PIX"
              : "Comprovante do PIX"
          }
          hint="Print ou foto do comprovante, ou o PDF do banco, até 1 MB. Confira e clique em Enviar comprovante."
          value={receipt}
          onChange={setReceipt}
        />
      )}
      <div className="flex flex-wrap gap-2">
        {paid && (
          <Button
            icon={<Send className="size-4" />}
            loading={sending || refreshing}
            disabled={!receipt}
            onClick={send}
          >
            Enviar comprovante
          </Button>
        )}
        <Button
          variant="cancel"
          icon={<XCircle className="size-4" />}
          onClick={() => setConfirmCancel(true)}
          disabled={sending || refreshing}
        >
          Desistir
        </Button>
      </div>
      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Desistir do pedido?"
        footer={
          <>
            <Button variant="cancel" onClick={() => setConfirmCancel(false)}>
              Voltar
            </Button>
            <Button variant="danger" loading={cancelling} onClick={cancel}>
              Desistir do pedido
            </Button>
          </>
        }
      >
        As vagas do pedido {order.code} voltam para outros moradores. Se você já
        pagou, não desista: envie o comprovante.
      </Modal>
    </div>
  );
}

/**
 * A person's document: sent (link) or to send (pending orders only). Like
 * the receipt, it is attached and shown first, and goes on "Enviar".
 */
function AttendeeProof({
  orderId,
  attendee,
  editable,
}: {
  orderId: string;
  attendee: EventOrder["attendees"][number];
  editable: boolean;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [proof, setProof] = useState<PickedDocument | null>(null);
  // A sent document is replaced only on "Trocar" (the field opens).
  const [replacing, setReplacing] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const picking = editable && (!attendee.proofUrl || replacing);

  async function send() {
    if (!proof) return;
    setSending(true);
    try {
      await eventsClient.submitProof(orderId, attendee.id, proof.base64);
      showSuccess(`Documento de ${attendee.name} enviado.`);
      startRefresh(() => {
        router.refresh();
        setProof(null);
        setReplacing(false);
      });
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível enviar o documento.",
      );
    }
    setSending(false);
  }

  function stopReplacing() {
    setProof(null);
    setReplacing(false);
  }

  return (
    <div className="w-full space-y-2 pt-1 text-xs">
      <span className="flex flex-wrap items-center gap-2">
        {attendee.proofUrl ? (
          <a
            href={attendee.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-success hover:underline"
          >
            <FileCheck aria-hidden className="size-3.5" /> Documento enviado
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 font-medium text-warning">
            <FileText aria-hidden className="size-3.5" /> Precisa de documento
            (idade ou condição do desconto)
          </span>
        )}
        {editable && attendee.proofUrl && !replacing && (
          <Button
            size="sm"
            variant="secondary"
            icon={<FileUp className="size-3.5" />}
            onClick={() => setReplacing(true)}
          >
            Trocar
          </Button>
        )}
      </span>
      {picking && (
        <div className="space-y-2">
          <DocumentField
            label={`Documento de ${attendee.name}`}
            hint="Documento com foto e data de nascimento, ou o que comprova a condição do desconto (carteirinha, laudo…): imagem ou PDF, até 1 MB."
            value={proof}
            onChange={setProof}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              icon={<Send className="size-3.5" />}
              loading={sending || refreshing}
              disabled={!proof}
              onClick={send}
            >
              Enviar documento
            </Button>
            {replacing && (
              <Button
                size="sm"
                variant="cancel"
                onClick={stopReplacing}
                disabled={sending || refreshing}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
