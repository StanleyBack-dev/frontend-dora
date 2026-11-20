"use client";

import { useState } from "react";
import { Undo2, XCircle } from "lucide-react";
import { Button, Modal, TextArea } from "@/design-system";
import { parcelsClient } from "@/features/parcels/api/parcels.client";
import { parcelSummary } from "@/features/parcels/model/parcel-labels";
import type { Parcel } from "@/shared/contracts/parcels";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

export type CloseKind = "return" | "cancel";

const COPY: Record<
  CloseKind,
  { title: string; action: string; hint: string; done: string }
> = {
  return: {
    title: "Devolver ao remetente",
    action: "Devolver",
    hint: "Ex.: recusada pelo morador, endereço errado, não retirada no prazo.",
    done: "Encomenda devolvida.",
  },
  cancel: {
    title: "Cancelar registro",
    action: "Cancelar registro",
    hint: "Use quando a encomenda foi registrada por engano (unidade errada, em dobro).",
    done: "Registro cancelado.",
  },
};

// Ends a parcel still waiting without a pickup: returned to the sender or
// registered by mistake, always with the reason (the residents are told).
export function CloseParcelModal({
  parcel,
  kind,
  onClose,
  onDone,
}: {
  parcel: Parcel | null;
  kind: CloseKind;
  onClose: () => void;
  onDone: (parcel: Parcel) => void;
}) {
  const { showError, showSuccess } = useToast();
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const copy = COPY[kind];
  const valid = reason.trim().length >= 3;

  async function run() {
    if (!parcel || !valid) return;
    setSending(true);
    try {
      const closed =
        kind === "return"
          ? await parcelsClient.returnToSender(parcel.id, reason.trim())
          : await parcelsClient.cancel(parcel.id, reason.trim());
      showSuccess(copy.done, "Os moradores da unidade foram avisados.");
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
      open={parcel !== null}
      onClose={() => {
        setReason("");
        onClose();
      }}
      busy={sending}
      tone={kind === "cancel" ? "danger" : "neutral"}
      icon={
        kind === "cancel" ? (
          <XCircle className="size-5" />
        ) : (
          <Undo2 className="size-5" />
        )
      }
      title={copy.title}
      footer={
        <>
          <Button variant="cancel" onClick={onClose} disabled={sending}>
            Voltar
          </Button>
          <Button
            variant={kind === "cancel" ? "danger" : "primary"}
            loading={sending}
            disabled={!valid}
            onClick={() => void run()}
          >
            {copy.action}
          </Button>
        </>
      }
    >
      {parcel && (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            {parcelSummary(parcel)}
            {parcel.unitLabel ? ` · ${parcel.unitLabel}` : ""}
          </p>
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
