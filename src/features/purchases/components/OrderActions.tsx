"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Mail, MessageCircle, RotateCcw, Scale, Send } from "lucide-react";
import {
  Button,
  ChoiceCards,
  type ChoiceOption,
  Modal,
  MoreActions,
  TextArea,
} from "@/design-system";
import { purchaseOrdersClient } from "@/features/purchases/api/purchase-orders.client";
import { DocumentEmailModal } from "@/features/purchases/components/DocumentEmailModal";
import { DocumentWhatsAppModal } from "@/features/purchases/components/DocumentWhatsAppModal";
import { orderCode } from "@/features/purchases/model/order-labels";
import type { PurchaseOrder } from "@/shared/contracts/purchase-orders";
import { errorMessage } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

const MAX_REASON = 300;

type CancelNext = "reorder" | "quotes";

const CANCEL_NEXT_OPTIONS: ChoiceOption<CancelNext>[] = [
  {
    value: "reorder",
    title: "Fazer novo pedido",
    hint: "Com o mesmo fornecedor e a mesma cotação.",
    icon: <RotateCcw className="size-4" />,
  },
  {
    value: "quotes",
    title: "Voltar às cotações",
    hint: "Para escolher outro fornecedor (passa de novo pela aprovação).",
    icon: <Scale className="size-4" />,
  },
];

/**
 * The management's actions on a placed order: send the purchase order to
 * the supplier by WhatsApp or e-mail (its registered phone or address
 * suggested) and cancel the
 * order, with the reason, while nothing arrived nor was paid: then order
 * again or go back to the quotes for another supplier.
 */
export function OrderActions({
  requestId,
  requestTitle,
  order,
  cancellable,
}: {
  requestId: string;
  requestTitle: string;
  order: PurchaseOrder;
  cancellable: boolean;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [open, setOpen] = useState<"whatsapp" | "email" | "cancel" | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const [next, setNext] = useState<CancelNext>("reorder");
  const [tried, setTried] = useState(false);
  const [pending, setPending] = useState(false);
  const code = orderCode(order.number);
  const fileName = `ordem-de-compra-${code}.pdf`;
  const message = [
    `Olá, ${order.supplierName}!`,
    "",
    `Segue em anexo a ordem de compra ${code} (${requestTitle}). Por favor, confirme o recebimento e o prazo de entrega.`,
    "",
    "Obrigado!",
  ].join("\n");
  const reasonProblem =
    reason.trim().length < 3 ? "Diga o motivo (ao menos 3 letras)." : null;

  async function cancel() {
    setTried(true);
    if (reasonProblem) return;
    setPending(true);
    try {
      const backToQuotes = next === "quotes";
      await purchaseOrdersClient.cancel(requestId, reason.trim(), backToQuotes);
      setOpen(null);
      if (backToQuotes) {
        showSuccess(
          "Pedido cancelado.",
          "A compra voltou às cotações: escolha outro fornecedor.",
        );
        router.push(`/compras/cotacoes/${requestId}`);
        return;
      }
      showSuccess(
        "Pedido cancelado.",
        "A compra voltou a aprovada: dá para fazer um novo pedido.",
      );
      router.refresh();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível cancelar o pedido."));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <MoreActions
        label="Enviar ao fornecedor"
        icon={<Send aria-hidden className="size-4" />}
        actions={[
          {
            label: "WhatsApp",
            icon: <MessageCircle />,
            onSelect: () => setOpen("whatsapp"),
          },
          {
            label: "E-mail",
            icon: <Mail />,
            onSelect: () => setOpen("email"),
          },
        ]}
      />
      {cancellable && (
        <Button
          variant="ghost"
          className="justify-center text-danger"
          icon={<Ban className="size-4" />}
          onClick={() => setOpen("cancel")}
        >
          Cancelar pedido
        </Button>
      )}

      {open === "whatsapp" && (
        <DocumentWhatsAppModal
          open
          path={`/purchases/requests/${requestId}/order/pdf`}
          fileName={fileName}
          defaultMessage={message}
          phone={order.supplierPhone}
          onClose={() => setOpen(null)}
        />
      )}
      {open === "email" && (
        <DocumentEmailModal
          open
          title="Enviar ordem de compra"
          sentTitle="Ordem de compra enviada."
          fileName={fileName}
          defaultEmails={order.supplierEmail ? [order.supplierEmail] : []}
          defaultMessage={message}
          onClose={() => setOpen(null)}
          onSend={(input) => purchaseOrdersClient.sendByEmail(requestId, input)}
        />
      )}
      <Modal
        open={open === "cancel"}
        onClose={() => setOpen(null)}
        title={`Cancelar pedido ${code}`}
        icon={<Ban className="size-4" />}
        tone="danger"
        busy={pending}
        footer={
          <>
            <Button
              variant="cancel"
              onClick={() => setOpen(null)}
              disabled={pending}
            >
              Voltar
            </Button>
            <Button
              variant="danger"
              icon={<Ban className="size-4" />}
              loading={pending}
              onClick={() => void cancel()}
            >
              Cancelar pedido
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            O pedido com {order.supplierName} é cancelado. Quem pediu e a gestão
            são avisados; avise também o fornecedor.
          </p>
          <ChoiceCards
            name="cancel-next"
            legend="E depois?"
            options={CANCEL_NEXT_OPTIONS}
            value={next}
            onChange={setNext}
          />
          <TextArea
            label="Motivo"
            required
            rows={3}
            maxLength={MAX_REASON}
            placeholder="Ex.: o fornecedor não tem mais o item; prazo não atende."
            value={reason}
            hint={`${reason.length}/${MAX_REASON}`}
            error={tried && reasonProblem ? reasonProblem : undefined}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}
