"use client";

import { useState } from "react";
import { Award } from "lucide-react";
import { Alert, Button, Modal, TextArea } from "@/design-system";
import { purchaseQuotesClient } from "@/features/purchases/api/purchase-quotes.client";
import {
  choiceNeedsJustification,
  justificationReason,
} from "@/features/purchases/model/quote-labels";
import type { PurchaseQuote } from "@/shared/contracts/purchase-quotes";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

// Chooses the winning quote: the request goes to "Aguardando aprovação".
// A justification is asked (and required) when it isn't the cheapest
// complete quote or there are fewer than three quotes.
export function ChooseQuoteModal({
  quote,
  total,
  onClose,
  onDone,
}: {
  quote: PurchaseQuote;
  /** How many quotes the request has. */
  total: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const { showError, showSuccess } = useToast();
  const [justification, setJustification] = useState("");
  const [pending, setPending] = useState(false);
  const needed = choiceNeedsJustification(quote, total);
  const reason = justificationReason(quote, total);
  const ready = !needed || justification.trim().length >= 3;

  async function confirm() {
    if (!ready) return;
    setPending(true);
    try {
      await purchaseQuotesClient.choose(quote.id, justification.trim() || null);
      showSuccess(
        "Cotação escolhida.",
        "A solicitação agora aguarda aprovação.",
      );
      onDone();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível escolher a cotação.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Escolher cotação"
      icon={<Award className="size-4" />}
      busy={pending}
      footer={
        <>
          <Button variant="cancel" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={confirm} loading={pending} disabled={!ready}>
            Escolher esta cotação
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p>
          <strong className="text-fg">{quote.supplierName}</strong> ·{" "}
          {formatCents(quote.totalCents)}
          {quote.complete ? "" : " (parcial)"}. A solicitação segue para a
          aprovação e as cotações não podem mais ser alteradas (dá para reabrir
          enquanto não for aprovada).
        </p>
        {reason && <Alert tone="warning">{reason}</Alert>}
        <TextArea
          label={needed ? "Justificativa" : "Justificativa (opcional)"}
          required={needed}
          maxLength={300}
          rows={3}
          placeholder="Ex.: entrega em 2 dias; garantia maior; único com o item em estoque."
          value={justification}
          onChange={(event) => setJustification(event.target.value)}
        />
      </div>
    </Modal>
  );
}
