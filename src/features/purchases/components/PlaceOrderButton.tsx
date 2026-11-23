"use client";

import { ClipboardCheck } from "lucide-react";
import { Button } from "@/design-system";
import { PlaceOrderDrawer } from "@/features/purchases/components/PlaceOrderDrawer";
import { useOrderView } from "@/features/purchases/model/use-order-view";

const LABEL = "Fazer pedido";

/**
 * "Fazer pedido" from a list: loads the chosen quote's plan, then opens the
 * order's drawer. `iconOnly` for a phone card.
 */
export function PlaceOrderButton({
  requestId,
  iconOnly = false,
}: {
  requestId: string;
  iconOnly?: boolean;
}) {
  const { view, loading, load, prefetch, clear } = useOrderView(requestId);

  return (
    <>
      <Button
        variant="primary"
        size={iconOnly ? "icon" : "sm"}
        loading={loading}
        icon={<ClipboardCheck className="size-4" />}
        aria-label={iconOnly ? LABEL : undefined}
        title={iconOnly ? LABEL : undefined}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        onClick={() => void load()}
      >
        {iconOnly ? null : LABEL}
      </Button>
      {view?.plan && (
        <PlaceOrderDrawer
          requestId={requestId}
          plan={view.plan}
          onClose={clear}
        />
      )}
    </>
  );
}
