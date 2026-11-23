"use client";

import { Scale } from "lucide-react";
import { CollapsibleSection } from "@/design-system";
import type { QuoteMapActions } from "@/features/purchases/components/QuoteActions";
import { QuoteComparison } from "@/features/purchases/components/QuoteComparison";
import { ShareQuoteMapMenu } from "@/features/purchases/components/ShareQuoteMapMenu";
import { quoteMapFileName } from "@/features/purchases/model/quote-share";
import { ReceiptPdfButton } from "@/features/signature/components/ReceiptPdfButton";
import type { PurchaseQuote } from "@/shared/contracts/purchase-quotes";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";

/** On the approval page the map is read only. */
const READ_ONLY: QuoteMapActions = {
  editable: false,
  choosable: false,
  onEdit: () => undefined,
  onRemove: () => undefined,
  onChoose: () => undefined,
};

// The comparison map on the approval page, folded: to check the chosen
// quote against the others before deciding (the PDF and sharing too).
export function ApprovalQuoteMap({
  request,
  quotes,
}: {
  request: PurchaseRequest;
  quotes: PurchaseQuote[];
}) {
  return (
    <CollapsibleSection
      icon={<Scale className="size-4" />}
      title={`Mapa de cotação (${quotes.length})`}
      description={
        request.status === "AWAITING_APPROVAL"
          ? "Compare a escolhida com as outras cotações antes de decidir."
          : "As cotações desta compra, lado a lado."
      }
      defaultOpen={false}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <ReceiptPdfButton
            path={`/purchases/requests/${request.id}/quote-map`}
            fallbackName={quoteMapFileName(request)}
            label="Mapa em PDF"
            variant="brand"
            className="w-full justify-center sm:w-auto"
          />
          <ShareQuoteMapMenu
            request={request}
            quotes={quotes}
            className="w-full sm:w-auto"
          />
        </div>
        <QuoteComparison
          request={request}
          quotes={quotes}
          actions={READ_ONLY}
        />
      </div>
    </CollapsibleSection>
  );
}
