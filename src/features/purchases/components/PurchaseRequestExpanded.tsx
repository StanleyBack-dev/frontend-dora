"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { Button } from "@/design-system";
import { CancelPurchaseRequestModal } from "@/features/purchases/components/CancelPurchaseRequestModal";
import { PurchaseRequestDetails } from "@/features/purchases/components/PurchaseRequestDetails";
import { isEditableRequest } from "@/features/purchases/model/request-labels";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";

// What a request's row opens to on Solicitações: the whole request (facts,
// categories, details and items) and, while it waits for quotes, cancelling
// it (with the reason).
export function PurchaseRequestExpanded({
  request,
  viewerId,
}: {
  request: PurchaseRequest;
  viewerId: string;
}) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const editable = isEditableRequest(request);

  return (
    <div className="space-y-4 border-t border-border bg-surface p-3 sm:mt-2 sm:rounded-xl sm:border sm:p-5">
      <PurchaseRequestDetails request={request} withHeader={false} />
      {editable && (
        <>
          <div className="flex justify-end border-t border-border pt-3">
            <Button
              size="sm"
              variant="ghost"
              className="text-danger"
              icon={<Ban className="size-4" />}
              onClick={() => setCancelling(true)}
            >
              Cancelar solicitação
            </Button>
          </div>
          <CancelPurchaseRequestModal
            request={request}
            open={cancelling}
            ownRequest={request.requestedById === viewerId}
            onClose={() => setCancelling(false)}
            onDone={() => {
              setCancelling(false);
              router.refresh();
            }}
          />
        </>
      )}
    </div>
  );
}
