"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Undo2, Wallet } from "lucide-react";
import { Button, cn, ConfirmModal } from "@/design-system";
import { purchasePaymentsClient } from "@/features/purchases/api/purchase-payments.client";
import { PaymentDrawer } from "@/features/purchases/components/PaymentDrawer";
import { RescheduleModal } from "@/features/purchases/components/RescheduleModal";
import {
  installmentName,
  installmentState,
} from "@/features/purchases/model/order-labels";
import type { PurchaseInstallment } from "@/shared/contracts/purchase-orders";
import { errorMessage } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

/**
 * What the management does with an installment, wherever it is shown (the
 * order page, the payments page): pay it or move its due day while open,
 * undo the payment once paid. The page reloads after each. A phone card
 * splits them: "pay" (an icon, on the card's title) and "others" (in it).
 */
export function InstallmentActions({
  requestId,
  installment,
  count,
  orderedOn,
  context,
  part = "all",
}: {
  requestId: string;
  installment: PurchaseInstallment;
  /** The order's installments (1: paid at once). */
  count: number;
  orderedOn: string;
  /** The order and its supplier, "OC-0002 · Casa & Cia". */
  context: string;
  part?: "all" | "pay" | "others";
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [open, setOpen] = useState<"pay" | "reschedule" | "undo" | null>(null);
  const [pending, setPending] = useState(false);
  const name = installmentName(installment.number, count);
  const done = () => {
    setOpen(null);
    router.refresh();
  };

  async function undo() {
    setPending(true);
    try {
      await purchasePaymentsClient.unpay(requestId, installment.id);
      showSuccess("Pagamento desfeito.");
      done();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível desfazer o pagamento."));
    } finally {
      setPending(false);
    }
  }

  const overdue = installmentState(installment) === "overdue";
  const payOnly = part === "pay";
  const withPay = !installment.paidOn && part !== "others";
  const withOthers = part !== "pay";

  return (
    <div
      className={
        payOnly ? "contents" : "grid grid-cols-2 gap-2 sm:flex sm:justify-end"
      }
    >
      {withOthers &&
        (installment.paidOn ? (
          <Button
            variant="ghost"
            size="sm"
            className="col-span-2 justify-center"
            icon={<Undo2 className="size-4" />}
            onClick={() => setOpen("undo")}
          >
            Desfazer
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className={cn("justify-center", !withPay && "col-span-2")}
            icon={<CalendarClock className="size-4" />}
            onClick={() => setOpen("reschedule")}
          >
            Vencimento
          </Button>
        ))}
      {withPay && (
        <Button
          variant={overdue ? "danger" : payOnly ? "primary" : "secondary"}
          size={payOnly ? "icon" : "sm"}
          className="justify-center"
          icon={<Wallet className="size-4" />}
          aria-label={payOnly ? `Pagar ${name.toLowerCase()}` : undefined}
          title={payOnly ? "Pagar" : undefined}
          onClick={() => setOpen("pay")}
        >
          {payOnly ? null : "Pagar"}
        </Button>
      )}

      {open === "pay" && (
        <PaymentDrawer
          requestId={requestId}
          installment={installment}
          count={count}
          context={context}
          onClose={() => setOpen(null)}
          onDone={done}
        />
      )}
      {open === "reschedule" && (
        <RescheduleModal
          requestId={requestId}
          installment={installment}
          label={name}
          orderedOn={orderedOn}
          onClose={() => setOpen(null)}
          onDone={done}
        />
      )}
      <ConfirmModal
        open={open === "undo"}
        onClose={() => setOpen(null)}
        title="Desfazer pagamento"
        confirmLabel="Desfazer"
        pending={pending}
        onConfirm={() => void undo()}
      >
        {`${name} volta a ficar em aberto (o comprovante anexado é removido).`}
      </ConfirmModal>
    </div>
  );
}
