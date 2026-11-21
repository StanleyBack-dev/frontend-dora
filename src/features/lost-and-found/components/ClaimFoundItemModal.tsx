"use client";

import { useState } from "react";
import { HandHelping } from "lucide-react";
import { Button, Modal, TextArea } from "@/design-system";
import { lostAndFoundClient } from "@/features/lost-and-found/api/lost-and-found.client";
import { CLAIM_MESSAGE_MAX } from "@/features/lost-and-found/model/found-item-labels";
import type { FoundItem } from "@/shared/contracts/lost-and-found";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

// "É meu": one confirmation, with an optional note for the desk. The owner
// is checked in person when they come for it (with a document and the
// signature on the screen).
export function ClaimFoundItemModal({
  item,
  onClose,
  onDone,
}: {
  /** The item being claimed (null: closed). */
  item: FoundItem | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const { showError, showSuccess } = useToast();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  function close() {
    setMessage("");
    onClose();
  }

  async function run() {
    if (!item) return;
    setSending(true);
    try {
      await lostAndFoundClient.claim(item.id, message.trim() || null);
      showSuccess(
        "Pedido enviado.",
        "A portaria foi avisada. Retire o item lá com um documento.",
      );
      setMessage("");
      onDone();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível enviar o pedido.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      open={item !== null}
      onClose={close}
      busy={sending}
      icon={<HandHelping className="size-5" />}
      title="Este item é meu"
      footer={
        <>
          <Button variant="cancel" onClick={close} disabled={sending}>
            Voltar
          </Button>
          <Button loading={sending} onClick={() => void run()}>
            Confirmar
          </Button>
        </>
      }
    >
      {item && (
        <div className="space-y-3">
          <p className="text-sm text-fg">
            <strong>{item.title}</strong>
          </p>
          <p className="text-[13px] text-muted">
            A portaria é avisada. Para retirar, vá até lá com um documento: o
            porteiro confere se o item é seu e você assina na tela.
          </p>
          <TextArea
            label="Algum detalhe que ajude? (opcional)"
            rows={2}
            maxLength={CLAIM_MESSAGE_MAX}
            placeholder="Ex.: perdi no sábado à tarde; o chaveiro tem uma tag com meu apartamento."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
      )}
    </Modal>
  );
}
