"use client";

import { useState } from "react";
import { HeartHandshake, Trash2 } from "lucide-react";
import { Button, Modal, TextArea } from "@/design-system";
import { lostAndFoundClient } from "@/features/lost-and-found/api/lost-and-found.client";
import type { FoundItem } from "@/shared/contracts/lost-and-found";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

export type CloseFoundItemKind = "donate" | "discard";

const COPY: Record<
  CloseFoundItemKind,
  { title: string; action: string; hint: string; done: string }
> = {
  donate: {
    title: "Doar item",
    action: "Doar",
    hint: "Ex.: ninguém pediu em 90 dias; doado para a campanha do agasalho.",
    done: "Item doado.",
  },
  discard: {
    title: "Descartar item",
    action: "Descartar",
    hint: "Ex.: estragado ou sem condições de uso.",
    done: "Item descartado.",
  },
};

// Ends a kept item nobody took: donated or discarded, always with the
// reason. Open claims are closed and their residents told.
export function CloseFoundItemModal({
  item,
  kind,
  onClose,
  onDone,
}: {
  /** The item to close (null: closed). */
  item: FoundItem | null;
  kind: CloseFoundItemKind;
  onClose: () => void;
  onDone: (item: FoundItem) => void;
}) {
  const { showError, showSuccess } = useToast();
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const copy = COPY[kind];
  const valid = reason.trim().length >= 3;

  function close() {
    setReason("");
    onClose();
  }

  async function run() {
    if (!item || !valid) return;
    setSending(true);
    try {
      const closed =
        kind === "donate"
          ? await lostAndFoundClient.donate(item.id, reason.trim())
          : await lostAndFoundClient.discard(item.id, reason.trim());
      showSuccess(
        copy.done,
        item.pendingClaims > 0
          ? "Os pedidos abertos foram encerrados e os moradores, avisados."
          : undefined,
      );
      setReason("");
      onDone(closed);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível concluir.",
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
      tone={kind === "discard" ? "danger" : "neutral"}
      icon={
        kind === "discard" ? (
          <Trash2 className="size-5" />
        ) : (
          <HeartHandshake className="size-5" />
        )
      }
      title={copy.title}
      footer={
        <>
          <Button variant="cancel" onClick={close} disabled={sending}>
            Voltar
          </Button>
          <Button
            variant={kind === "discard" ? "danger" : "primary"}
            loading={sending}
            disabled={!valid}
            onClick={() => void run()}
          >
            {copy.action}
          </Button>
        </>
      }
    >
      {item && (
        <div className="space-y-3">
          <p className="text-sm text-muted">{item.title}</p>
          <TextArea
            label="Motivo"
            required
            rows={3}
            maxLength={300}
            placeholder={copy.hint}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            data-autofocus
          />
        </div>
      )}
    </Modal>
  );
}
