"use client";

import { useState } from "react";
import { CalendarDays, FileText, StickyNote, Wallet } from "lucide-react";
import {
  Button,
  CollapsibleSection,
  Drawer,
  DrawerActions,
  Field,
  TextArea,
} from "@/design-system";
import {
  DocumentField,
  type PickedDocument,
} from "@/features/documents/components/DocumentField";
import { purchasePaymentsClient } from "@/features/purchases/api/purchase-payments.client";
import {
  installmentName,
  MAX_PAYMENT_NOTE,
} from "@/features/purchases/model/order-labels";
import { formatRequestDay } from "@/features/purchases/model/request-labels";
import type { PurchaseInstallment } from "@/shared/contracts/purchase-orders";
import { errorMessage } from "@/shared/lib/api-client";
import { localDay } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

/**
 * An installment is paid, in a drawer: the day (today by default), the
 * proof of payment (a PDF or a photo) and a note, each in its section.
 */
export function PaymentDrawer({
  requestId,
  installment,
  count,
  context,
  onClose,
  onDone,
}: {
  requestId: string;
  installment: PurchaseInstallment;
  /** The order's installments (1: paid at once). */
  count: number;
  /** "OC-0002 · Casa & Cia". */
  context: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const { showError, showSuccess } = useToast();
  const name = installmentName(installment.number, count);
  const today = localDay(new Date());
  const [paidOn, setPaidOn] = useState(today);
  const [file, setFile] = useState<PickedDocument | null>(null);
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  const [pending, setPending] = useState(false);
  const problem =
    !paidOn || paidOn > today
      ? "A data do pagamento não pode ser no futuro."
      : null;

  async function save() {
    setTried(true);
    if (problem) return;
    setPending(true);
    try {
      await purchasePaymentsClient.pay(
        requestId,
        installment.id,
        { paidOn, note: note.trim() || null },
        file?.base64 ?? null,
      );
      showSuccess(
        "Pagamento registrado.",
        `${name}: ${formatCents(installment.amountCents)}.`,
      );
      onDone();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível registrar o pagamento."));
      setPending(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={
        count > 1
          ? `Pagar parcela ${installment.number} de ${count}`
          : "Registrar pagamento"
      }
      subtitle={`${context} · ${formatCents(installment.amountCents)}, vence em ${formatRequestDay(installment.dueOn)}.`}
      busy={pending}
      footer={
        <DrawerActions>
          <Button variant="cancel" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={<Wallet className="size-4" />}
            loading={pending}
            onClick={() => void save()}
          >
            Marcar como pago
          </Button>
        </DrawerActions>
      }
    >
      <div className="space-y-4">
        <CollapsibleSection icon={<CalendarDays />} title="Quando foi pago">
          <Field
            label="Data do pagamento"
            type="date"
            required
            max={today}
            value={paidOn}
            error={tried && problem ? problem : undefined}
            onChange={(event) => setPaidOn(event.target.value)}
          />
        </CollapsibleSection>
        <CollapsibleSection
          icon={<FileText />}
          title="Comprovante (opcional)"
          description="O PDF ou a foto do comprovante, de até 1,2 MB."
        >
          <DocumentField
            variant="panel"
            label="Comprovante"
            value={file}
            onChange={setFile}
          />
        </CollapsibleSection>
        <CollapsibleSection icon={<StickyNote />} title="Observação (opcional)">
          <TextArea
            label="Observação"
            hideLabel
            rows={2}
            maxLength={MAX_PAYMENT_NOTE}
            placeholder="Ex.: pago por PIX da conta do condomínio."
            value={note}
            hint={`${note.length}/${MAX_PAYMENT_NOTE}`}
            onChange={(event) => setNote(event.target.value)}
          />
        </CollapsibleSection>
      </div>
    </Drawer>
  );
}
