import { Badge } from "@/design-system";
import { supplierCategoryLabels } from "@/features/purchases/model/purchase-labels";
import type { Supplier } from "@/shared/contracts/purchases";

// What a supplier serves, inside the row's details: its own folding block
// ("3 categorias") that opens to the badges, so a long list doesn't push
// the other details down. Same markup on phones and desktop.
export function SupplierCategories({
  supplier,
}: {
  supplier: Pick<Supplier, "categories" | "categoryOther">;
}) {
  const labels = supplierCategoryLabels(supplier);
  return (
    <details className="group w-full rounded-xl border border-border px-3 py-2 text-left">
      <summary className="cursor-pointer text-[13px] font-medium text-muted">
        {labels.length === 1 ? "1 categoria" : `${labels.length} categorias`}
      </summary>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {labels.map((label) => (
          <Badge
            key={label}
            tone="neutral"
            className="max-w-full whitespace-normal"
          >
            {label}
          </Badge>
        ))}
      </div>
    </details>
  );
}
