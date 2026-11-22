"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button, Combobox, Field } from "@/design-system";
import { CatalogPicker } from "@/features/catalog/components/CatalogPicker";
import { UNIT_OPTIONS } from "@/features/catalog/model/units";
import type { CatalogOption } from "@/shared/contracts/catalog";

/** An item as the form edits it (quantity as typed: "2,5"). */
export type RequestItemForm = {
  /** Stable key while editing (not sent). */
  key: string;
  /** A product of the catalog ("": not chosen yet). */
  productId: string;
  quantity: string;
  unit: string;
  /** "": any brand. */
  brandId: string;
  note: string;
};

export const MAX_REQUEST_ITEMS = 50;

let counter = 0;
/** A blank item with a fresh key. */
export const blankItem = (): RequestItemForm => ({
  key: `item-${Date.now()}-${(counter += 1)}`,
  productId: "",
  quantity: "1",
  unit: "un",
  brandId: "",
  note: "",
});

/**
 * "2,5" or "2.5" → 2.5 ("1.000,5" → 1000.5); null when not a positive
 * number with up to 2 decimals.
 */
export function parseQuantity(value: string): number | null {
  const raw = value.trim();
  // With a comma, dots group thousands; without one, a dot is the decimal.
  const text = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const quantity = Number(text);
  return quantity > 0 && quantity <= 1_000_000 ? quantity : null;
}

/** Whether an item is filled in well enough to send. */
export const itemComplete = (item: RequestItemForm) =>
  item.productId !== "" &&
  parseQuantity(item.quantity) !== null &&
  item.unit.trim() !== "";

// The items of a purchase request: a product of the catalog (or a new one,
// with the "+"), how many and in which unit (the product's usual one comes
// filled in), the brand (or any brand) and a note. Each item is its own
// small card; there is always at least one.
export function RequestItemsEditor({
  items,
  products,
  brands,
  onChange,
  onProductCreated,
  onBrandCreated,
}: {
  items: RequestItemForm[];
  products: CatalogOption[];
  brands: CatalogOption[];
  onChange: (items: RequestItemForm[]) => void;
  onProductCreated: (product: CatalogOption) => void;
  onBrandCreated: (brand: CatalogOption) => void;
}) {
  const update = (key: string, patch: Partial<RequestItemForm>) =>
    onChange(
      items.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  const remove = (key: string) =>
    onChange(items.filter((item) => item.key !== key));

  return (
    <div className="space-y-3">
      <ol className="space-y-3">
        {items.map((item, index) => {
          const quantityProblem =
            item.quantity.trim() && parseQuantity(item.quantity) === null
              ? "Maior que zero, até 2 casas."
              : undefined;
          return (
            <li
              key={item.key}
              className="space-y-3 rounded-xl border border-border bg-surface-muted/40 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wide text-soft uppercase">
                  Item {index + 1}
                </span>
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="size-4" />}
                    onClick={() => remove(item.key)}
                    aria-label={`Remover item ${index + 1}`}
                  >
                    Remover
                  </Button>
                )}
              </div>
              <CatalogPicker
                kind="product"
                label="Produto"
                required
                placeholder="Busque ou cadastre com o +"
                options={products}
                value={item.productId || null}
                onCreated={onProductCreated}
                // The product's usual unit comes filled in (it can change).
                onSelect={(product) =>
                  update(item.key, {
                    productId: product?.id ?? "",
                    ...(product?.unit ? { unit: product.unit } : {}),
                  })
                }
              />
              <div className="grid items-start gap-3 sm:grid-cols-2">
                <Field
                  label="Quantidade"
                  required
                  inputMode="decimal"
                  autoComplete="off"
                  value={item.quantity}
                  error={quantityProblem}
                  onChange={(event) =>
                    update(item.key, {
                      quantity: event.target.value.replace(/[^\d.,]/g, ""),
                    })
                  }
                />
                <Combobox
                  label="Unidade"
                  required
                  placeholder="un"
                  freeText
                  freeTextLabel="Outra (digitar)"
                  maxLength={12}
                  options={UNIT_OPTIONS}
                  value={item.unit || null}
                  onSelect={(value) => update(item.key, { unit: value ?? "" })}
                />
              </div>
              <CatalogPicker
                kind="brand"
                label="Marca"
                placeholder="Qualquer marca"
                options={brands}
                value={item.brandId || null}
                onCreated={onBrandCreated}
                onSelect={(brand) =>
                  update(item.key, { brandId: brand?.id ?? "" })
                }
              />
              <Field
                label="Observação (opcional)"
                maxLength={200}
                autoComplete="off"
                placeholder="Ex.: branca fria, bocal E27"
                value={item.note}
                onChange={(event) =>
                  update(item.key, { note: event.target.value })
                }
              />
            </li>
          );
        })}
      </ol>
      {items.length < MAX_REQUEST_ITEMS && (
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus className="size-4" />}
          onClick={() => onChange([...items, blankItem()])}
        >
          Adicionar item
        </Button>
      )}
    </div>
  );
}
