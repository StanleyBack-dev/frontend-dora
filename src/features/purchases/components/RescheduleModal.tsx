"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button, Field, Modal } from "@/design-system";
import { purchasePaymentsClient } from "@/features/purchases/api/purchase-payments.client";
import { formatRequestDay } from "@/features/purchases/model/request-labels";
import type { PurchaseInstallment } from "@/shared/contracts/purchase-orders";
import { errorMessage } from "@/shared/lib/api-client";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

/** Moves an unpaid installment's due day (from the day of the order on). */
export function RescheduleModal({
  requestId,
  installment,
  label,
  orderedOn,
  onClose,
  onDone,
}: {
  requestId: string;
  installment: PurchaseInstallment;
  /** "Parcela 2" or "Pagamento". */
  label: string;
  orderedOn: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const { showError, showSuccess } = useToast();
  const [dueOn, setDueOn] = useState(installment.dueOn);
  const [tried, setTried] = useState(false);
  const [pending, setPending] = useState(false);
  const problem =
    !dueOn || dueOn < orderedOn
      ? "O vencimento deve ser do dia do pedido em diante."
      : null;

  async function save() {
    setTried(true);
    if (problem) return;
    setPending(true);
    try {
      await purchasePaymentsClient.reschedule(requestId, installment.id, dueOn);
      showSuccess("Vencimento alterado.");
      onDone();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível alterar o vencimento."));
      setPending(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Alterar vencimento"
      icon={<CalendarClock className="size-4" />}
      busy={pending}
      footer={
        <>
          <Button variant="cancel" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            icon={<CalendarClock className="size-4" />}
            loading={pending}
            onClick={() => void save()}
          >
            Salvar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted">
          {`${label}: ${formatCents(installment.amountCents)}, vencendo hoje em ${formatRequestDay(installment.dueOn)}.`}
        </p>
        <Field
          label="Novo vencimento"
          type="date"
          required
          min={orderedOn}
          value={dueOn}
          error={tried && problem ? problem : undefined}
          onChange={(event) => setDueOn(event.target.value)}
        />
      </div>
    </Modal>
  );
}
