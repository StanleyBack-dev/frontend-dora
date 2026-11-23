import { formatQuantity } from "@/features/purchases/model/request-labels";
import type { PurchaseRequestItem } from "@/shared/contracts/purchase-requests";

/**
 * A request's items, read only: number, product, brand (or any) and note,
 * and the quantity.
 */
export function RequestItemsList({ items }: { items: PurchaseRequestItem[] }) {
  return (
    <ol className="divide-y divide-border rounded-xl border border-border">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm"
        >
          <span className="flex min-w-0 gap-2">
            <span className="w-5 shrink-0 text-right text-soft">
              {index + 1}.
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="break-words text-fg">{item.productName}</span>
              <span className="text-xs break-words text-soft">
                {item.brandName ?? "Qualquer marca"}
                {item.note ? ` · ${item.note}` : ""}
              </span>
            </span>
          </span>
          <span className="shrink-0 font-medium whitespace-nowrap text-fg">
            {formatQuantity(item.quantity, item.unit)}
          </span>
        </li>
      ))}
    </ol>
  );
}
