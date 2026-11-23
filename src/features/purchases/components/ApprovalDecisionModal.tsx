"use client";

import { useState } from "react";
import { BadgeCheck, Ban, Undo2 } from "lucide-react";
import { Button, Modal, TextArea } from "@/design-system";
import { purchaseApprovalsClient } from "@/features/purchases/api/purchase-approvals.client";
import { MAX_APPROVAL_NOTE } from "@/features/purchases/model/approval-labels";
import { errorMessage } from "@/shared/lib/api-client";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

export type ApprovalAction = "approve" | "return" | "reject";

const COPY: Record<
  ApprovalAction,
  {
    title: string;
    confirm: string;
    field: string;
    placeholder: string;
    required: boolean;
    explain: (supplier: string, total: string) => string;
    done: string;
  }
> = {
  approve: {
    title: "Aprovar compra",
    confirm: "Aprovar",
    field: "Observação (opcional)",
    placeholder: "Ex.: pode comprar; pedir nota fiscal no nome do condomínio.",
    required: false,
    explain: (supplier, total) =>
      `A compra com ${supplier} (${total}) fica aprovada. Quem pediu e a gestão são avisados.`,
    done: "Compra aprovada.",
  },
  return: {
    title: "Devolver para cotação",
    confirm: "Devolver",
    field: "Motivo",
    placeholder: "Ex.: falta uma terceira cotação; confira o frete.",
    required: true,
    explain: (supplier, total) =>
      `A escolha de ${supplier} (${total}) é desfeita e a solicitação volta para “Em cotação”, para a gestão ajustar e escolher de novo.`,
    done: "Compra devolvida para cotação.",
  },
  reject: {
    title: "Reprovar compra",
    confirm: "Reprovar",
    field: "Motivo",
    placeholder: "Ex.: sem verba neste mês; não é prioridade agora.",
    required: true,
    explain: (supplier, total) =>
      `A compra com ${supplier} (${total}) é reprovada e a solicitação é encerrada. Isso não pode ser desfeito.`,
    done: "Compra reprovada.",
  },
};

const ICONS: Record<ApprovalAction, React.ReactNode> = {
  approve: <BadgeCheck className="size-4" />,
  return: <Undo2 className="size-4" />,
  reject: <Ban className="size-4" />,
};

/**
 * The approver's decision on a chosen quote: approve (an optional note),
 * send it back to quotes or reject it (both need the reason).
 */
export function ApprovalDecisionModal({
  action,
  requestId,
  supplierName,
  totalCents,
  onClose,
  onDone,
}: {
  action: ApprovalAction;
  requestId: string;
  supplierName: string;
  totalCents: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const copy = COPY[action];
  const { showError, showSuccess } = useToast();
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  const [pending, setPending] = useState(false);
  const problem =
    copy.required && note.trim().length < 3
      ? "Diga o motivo (ao menos 3 letras)."
      : null;

  async function confirm() {
    setTried(true);
    if (problem) return;
    setPending(true);
    try {
      const text = note.trim();
      if (action === "approve") {
        await purchaseApprovalsClient.approve(requestId, text || null);
      } else if (action === "return") {
        await purchaseApprovalsClient.returnToQuotes(requestId, text);
      } else {
        await purchaseApprovalsClient.reject(requestId, text);
      }
      showSuccess(copy.done);
      onDone();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível registrar a decisão."));
      setPending(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={copy.title}
      icon={ICONS[action]}
      tone={action === "reject" ? "danger" : "neutral"}
      busy={pending}
      footer={
        <>
          <Button variant="cancel" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant={action === "reject" ? "danger" : "primary"}
            icon={ICONS[action]}
            loading={pending}
            onClick={() => void confirm()}
          >
            {copy.confirm}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted">
          {copy.explain(supplierName, formatCents(totalCents))}
        </p>
        <TextArea
          label={copy.field}
          required={copy.required}
          rows={4}
          maxLength={MAX_APPROVAL_NOTE}
          placeholder={copy.placeholder}
          value={note}
          hint={`${note.length}/${MAX_APPROVAL_NOTE}`}
          error={tried && problem ? problem : undefined}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
    </Modal>
  );
}
