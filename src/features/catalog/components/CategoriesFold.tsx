import { Badge } from "@/design-system";
import { categoryLabels } from "@/features/catalog/model/categories";
import type { Category } from "@/shared/contracts/catalog";

// The categories of a supplier or of a purchase request, inside a row's
// details: their own folding block ("3 categorias") that opens to the
// badges, so a long list doesn't push the other details down. Same markup
// on phones and desktop.
export function CategoriesFold({
  value,
}: {
  value: { categories: Category[]; categoryOther: string | null };
}) {
  const labels = categoryLabels(value);
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
