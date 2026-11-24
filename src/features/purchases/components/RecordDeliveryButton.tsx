"use client";

import { useRouter } from "next/navigation";
import { PackageCheck } from "lucide-react";
import { Button } from "@/design-system";
import { ReceiptDrawer } from "@/features/purchases/components/ReceiptDrawer";
import { useOrderView } from "@/features/purchases/model/use-order-view";
import { localDay } from "@/shared/lib/datetime";

const LABEL = "Registrar entrega";

/**
 * "Registrar entrega" from a list: loads what is still to arrive of the
 * order, then opens the delivery drawer. `iconOnly` for a phone card.
 */
export function RecordDeliveryButton({
  requestId,
  iconOnly = false,
}: {
  requestId: string;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const { view, loading, load, prefetch, clear } = useOrderView(requestId);

  return (
    <>
      <Button
        variant="primary"
        size={iconOnly ? "icon" : "sm"}
        loading={loading}
        icon={<PackageCheck className="size-4" />}
        aria-label={iconOnly ? LABEL : undefined}
        title={iconOnly ? LABEL : undefined}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        onClick={() => void load()}
      >
        {iconOnly ? null : LABEL}
      </Button>
      {view?.order && (
        <ReceiptDrawer
          requestId={requestId}
          lines={view.lines.filter((line) => line.pending > 0)}
          orderedOn={localDay(view.order.orderedAt)}
          onClose={clear}
          onDone={() => {
            clear();
            router.refresh();
          }}
        />
      )}
    </>
  );
}
