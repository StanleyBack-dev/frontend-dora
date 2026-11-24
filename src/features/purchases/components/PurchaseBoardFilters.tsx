import {
  AutoFilterForm,
  FilterActions,
  FilterCombobox,
  FilterPanel,
} from "@/design-system";
import {
  CATEGORIES,
  CATEGORY_LABELS,
} from "@/features/catalog/model/categories";
import {
  PRIORITY_LABELS,
  PURCHASE_PRIORITIES,
  requestCode,
} from "@/features/purchases/model/request-labels";
import type { Category } from "@/shared/contracts/catalog";
import type { PurchasePriority } from "@/shared/contracts/purchase-requests";
import { DEFAULT_PAGE_SIZE } from "@/shared/lib/search-params";

/**
 * The filters of the purchases boards (approvals, orders, deliveries):
 * the request (when given), category, priority and the page's "Situação"
 * stages; sent on change, read back from the address by the page.
 */
export function PurchaseBoardFilters({
  basePath,
  filtered,
  pageSize,
  requests,
  values,
  stages,
  stagePlaceholder,
}: {
  basePath: string;
  filtered: boolean;
  pageSize: number;
  /** The requests to pick (null: no request filter). */
  requests: { id: string; number: number; title: string }[] | null;
  values: {
    requestId?: string;
    category?: Category;
    priority?: PurchasePriority;
    /** The stage chosen ("" for the page's default). */
    stage: string;
  };
  stages: { value: string; label: string }[];
  /** The default stage's name (shown when none is chosen). */
  stagePlaceholder: string;
}) {
  return (
    <FilterPanel hasActiveFilters={filtered}>
      <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {pageSize !== DEFAULT_PAGE_SIZE && (
          <input type="hidden" name="por-pagina" value={pageSize} />
        )}
        {requests && (
          <FilterCombobox
            label="Solicitação"
            name="solicitacao"
            defaultValue={values.requestId ?? ""}
            placeholder="Todas"
            options={requests.map((request) => ({
              value: request.id,
              label: `${requestCode(request.number)} · ${request.title}`,
            }))}
          />
        )}
        <FilterCombobox
          label="Categoria"
          name="categoria"
          defaultValue={values.category ?? ""}
          placeholder="Todas"
          options={CATEGORIES.map((value) => ({
            value,
            label: CATEGORY_LABELS[value],
          }))}
        />
        <FilterCombobox
          label="Prioridade"
          name="prioridade"
          defaultValue={values.priority ?? ""}
          placeholder="Todas"
          options={PURCHASE_PRIORITIES.map((value) => ({
            value,
            label: PRIORITY_LABELS[value],
          }))}
        />
        <FilterCombobox
          label="Situação"
          name="situacao"
          defaultValue={values.stage}
          placeholder={stagePlaceholder}
          options={stages}
        />
        <FilterActions
          clearHref={basePath}
          hasActiveFilters={filtered}
          autoSubmit
        />
      </AutoFilterForm>
    </FilterPanel>
  );
}
