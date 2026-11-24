"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, StickyNote, Truck, Wallet } from "lucide-react";
import {
  Button,
  CollapsibleSection,
  Drawer,
  DrawerActions,
  Field,
  TextArea,
} from "@/design-system";
import { purchaseOrdersClient } from "@/features/purchases/api/purchase-orders.client";
import {
  installmentName,
  MAX_ORDER_NOTES,
  monthlyDueDays,
  paymentLabel,
} from "@/features/purchases/model/order-labels";
import { formatRequestDay } from "@/features/purchases/model/request-labels";
import type { PurchaseOrderPlan } from "@/shared/contracts/purchase-orders";
import { errorMessage } from "@/shared/lib/api-client";
import { addDays, localDay } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

/**
 * Places the order of an approved purchase, in a drawer: the delivery
 * expected (from the quote's term), the first due day with each
 * installment shown month by month, and notes for the supplier.
 */
export function PlaceOrderDrawer({
  requestId,
  plan,
  onClose,
}: {
  requestId: string;
  plan: PurchaseOrderPlan;
  onClose: () => void;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const today = localDay(new Date());
  const [expectedOn, setExpectedOn] = useState(
    plan.deliveryDays !== null ? addDays(today, plan.deliveryDays) : "",
  );
  const [firstDueOn, setFirstDueOn] = useState(today);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [tried, setTried] = useState(false);

  const count = plan.installmentValues.length;
  const days = firstDueOn ? monthlyDueDays(firstDueOn, count) : [];
  const dueProblem =
    !firstDueOn || firstDueOn < today
      ? "O vencimento deve ser de hoje em diante."
      : null;
  const expectedProblem =
    expectedOn && expectedOn < today
      ? "A entrega prevista deve ser de hoje em diante."
      : null;

  async function place() {
    setTried(true);
    if (dueProblem || expectedProblem) return;
    setPending(true);
    try {
      await purchaseOrdersClient.place(requestId, {
        expectedOn: expectedOn || null,
        firstDueOn,
        notes: notes.trim() || null,
      });
      showSuccess("Pedido feito.", "A ordem de compra já pode ser baixada.");
      onClose();
      router.refresh();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível fazer o pedido."));
      setPending(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title="Fazer o pedido"
      subtitle={`${plan.supplierName} · ${formatCents(plan.totalCents)} · ${paymentLabel(plan, count)}`}
      busy={pending}
      footer={
        <DrawerActions>
          <Button variant="cancel" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={<ClipboardCheck className="size-4" />}
            loading={pending}
            onClick={() => void place()}
          >
            Fazer pedido
          </Button>
        </DrawerActions>
      }
    >
      <div className="space-y-4">
        <CollapsibleSection
          icon={<Truck />}
          title="Entrega"
          description="Vem do prazo da cotação; ajuste se combinou outro."
        >
          <Field
            label="Entrega prevista"
            type="date"
            min={today}
            value={expectedOn}
            error={tried && expectedProblem ? expectedProblem : undefined}
            onChange={(event) => setExpectedOn(event.target.value)}
          />
        </CollapsibleSection>

        <CollapsibleSection
          icon={<Wallet />}
          title="Pagamento"
          description={
            count > 1
              ? "Informe o 1º vencimento: as demais parcelas vencem mês a mês."
              : "Quando o pagamento vence."
          }
        >
          <div className="space-y-3">
            <Field
              label={count > 1 ? "Vencimento da 1ª parcela" : "Vencimento"}
              type="date"
              required
              min={today}
              value={firstDueOn}
              error={tried && dueProblem ? dueProblem : undefined}
              onChange={(event) => setFirstDueOn(event.target.value)}
            />
            {days.length > 0 && (
              <ul className="divide-y divide-border rounded-xl border border-border text-sm">
                {plan.installmentValues.map((value, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-3 px-4 py-2"
                  >
                    <span className="text-muted">
                      {installmentName(index + 1, count)} · vence{" "}
                      {formatRequestDay(days[index])}
                    </span>
                    <span className="font-medium text-fg tabular-nums">
                      {formatCents(value)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<StickyNote />}
          title="Observações para o fornecedor (opcional)"
          description="Saem na ordem de compra."
        >
          <TextArea
            label="Observações"
            hideLabel
            rows={3}
            maxLength={MAX_ORDER_NOTES}
            placeholder="Ex.: entregar na portaria, das 8h às 17h; nota fiscal no CNPJ do condomínio."
            value={notes}
            hint={`${notes.length}/${MAX_ORDER_NOTES}`}
            onChange={(event) => setNotes(event.target.value)}
          />
        </CollapsibleSection>
      </div>
    </Drawer>
  );
}
