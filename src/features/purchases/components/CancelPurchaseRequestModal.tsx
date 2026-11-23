"use client";

import { useState } from "react";
import { Button, Modal, TextArea } from "@/design-system";
import { purchaseRequestsClient } from "@/features/purchases/api/purchase-requests.client";
import { requestCode } from "@/features/purchases/model/request-labels";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import { errorMessage } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

/**
 * Cancels a request waiting for quotes, with the reason (when it was
 * someone else's, they are told why).
 */
export function CancelPurchaseRequestModal({
  request,
  open,
  ownRequest,
  onClose,
  onDone,
}: {
  request: PurchaseRequest;
  open: boolean;
  /** The viewer made it (nobody else is told). */
  ownRequest: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { showError, showSuccess } = useToast();
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const ready = reason.trim().length >= 3;

  async function confirm() {
    if (!ready) return;
    setPending(true);
    try {
      await purchaseRequestsClient.cancel(request.id, reason.trim());
      showSuccess(
        "Solicitação cancelada.",
        ownRequest ? undefined : `${request.requestedByName} foi avisado(a).`,
      );
      setReason("");
      onDone();
    } catch (cause) {
      showError(
        errorMessage(cause, "Não foi possível cancelar a solicitação."),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Cancelar solicitação ${requestCode(request.number)}`}
      tone="danger"
      busy={pending}
      footer={
        <>
          <Button variant="cancel" onClick={onClose} disabled={pending}>
            Voltar
          </Button>
          <Button
            variant="danger"
            onClick={confirm}
            loading={pending}
            disabled={!ready}
          >
            Cancelar solicitação
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p>
          “{request.title}” deixa de seguir para as cotações. O histórico fica
          guardado.
        </p>
        <TextArea
          label="Motivo"
          required
          maxLength={300}
          rows={3}
          placeholder="Ex.: comprado por outro meio; não é mais necessário."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
    </Modal>
  );
}
