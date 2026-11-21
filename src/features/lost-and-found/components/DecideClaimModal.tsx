"use client";

import { useState } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { Button, Modal, TextArea } from "@/design-system";
import { lostAndFoundClient } from "@/features/lost-and-found/api/lost-and-found.client";
import type { FoundItemClaim } from "@/shared/contracts/lost-and-found";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

// Answers a resident's claim: accepting tells them to come for the item
// (an optional note, e.g. when); rejecting needs the reason, sent to them.
export function DecideClaimModal({
  claim,
  accept,
  onClose,
  onDone,
}: {
  /** The claim to answer (null: closed). */
  claim: FoundItemClaim | null;
  accept: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { showError, showSuccess } = useToast();
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const text = note.trim();
  const valid = accept
    ? text.length === 0 || text.length >= 3
    : text.length >= 3;

  function close() {
    setNote("");
    onClose();
  }

  async function run() {
    if (!claim || !valid) return;
    setSending(true);
    try {
      await lostAndFoundClient.decide(claim.id, accept, text || null);
      showSuccess(
        accept ? "Pedido aceito." : "Pedido recusado.",
        accept
          ? `${claim.userName} foi avisado para vir buscar o item.`
          : `${claim.userName} foi avisado, com o motivo.`,
      );
      setNote("");
      onDone();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível responder o pedido.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      open={claim !== null}
      onClose={close}
      busy={sending}
      tone={accept ? "neutral" : "danger"}
      icon={
        accept ? (
          <CircleCheck className="size-5" />
        ) : (
          <CircleX className="size-5" />
        )
      }
      title={accept ? "Aceitar pedido" : "Recusar pedido"}
      footer={
        <>
          <Button variant="cancel" onClick={close} disabled={sending}>
            Voltar
          </Button>
          <Button
            variant={accept ? "primary" : "danger"}
            loading={sending}
            disabled={!valid}
            onClick={() => void run()}
          >
            {accept ? "Aceitar e avisar" : "Recusar e avisar"}
          </Button>
        </>
      }
    >
      {claim && (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            {claim.userName}
            {claim.unitLabel ? ` · ${claim.unitLabel}` : ""}
          </p>
          <blockquote className="rounded-xl border border-border bg-surface-muted p-3 text-[13px] text-fg">
            {claim.message}
          </blockquote>
          <TextArea
            label={accept ? "Observação (opcional)" : "Motivo"}
            required={!accept}
            rows={3}
            maxLength={300}
            placeholder={
              accept
                ? "Ex.: pode retirar na portaria a qualquer hora, com documento."
                : "Ex.: a descrição não confere com o item."
            }
            value={note}
            onChange={(event) => setNote(event.target.value)}
            data-autofocus
          />
        </div>
      )}
    </Modal>
  );
}
