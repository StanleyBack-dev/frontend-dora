"use client";

import { Award, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/design-system";
import type { PurchaseQuote } from "@/shared/contracts/purchase-quotes";

export type QuoteMapActions = {
  /** Quotes can be changed (the request is in quotes). */
  editable: boolean;
  /** A winner can be chosen now. */
  choosable: boolean;
  onEdit: (quote: PurchaseQuote) => void;
  onRemove: (quote: PurchaseQuote) => void;
  onChoose: (quote: PurchaseQuote) => void;
};

// A quote's buttons in the map: choose it (the main one, full width),
// then edit and remove side by side.
export function QuoteActions({
  quote,
  actions,
}: {
  quote: PurchaseQuote;
  actions: QuoteMapActions;
}) {
  if (!actions.editable && !actions.choosable) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.choosable && (
        <Button
          size="sm"
          variant="primary"
          className="col-span-2"
          icon={<Award className="size-4" />}
          onClick={() => actions.onChoose(quote)}
        >
          Escolher esta cotação
        </Button>
      )}
      {actions.editable && (
        <>
          <Button
            size="sm"
            variant="secondary"
            icon={<Pencil className="size-4" />}
            onClick={() => actions.onEdit(quote)}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Trash2 className="size-4" />}
            onClick={() => actions.onRemove(quote)}
          >
            Remover
          </Button>
        </>
      )}
    </div>
  );
}
