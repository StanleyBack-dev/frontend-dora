"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, Combobox } from "@/design-system";
import { BrandForm } from "@/features/catalog/components/BrandForm";
import { ProductForm } from "@/features/catalog/components/ProductForm";
import type { CatalogOption } from "@/shared/contracts/catalog";

/**
 * A searchable select of the catalog (products or brands) with a "+" beside
 * it: not on the list? Register it in a modal and it comes back chosen.
 * New choices offer only the active ones; the one already chosen stays
 * even if deactivated since.
 */
export function CatalogPicker({
  kind,
  label,
  required = false,
  placeholder,
  options,
  value,
  onSelect,
  onCreated,
}: {
  kind: "product" | "brand";
  label: string;
  required?: boolean;
  placeholder: string;
  options: CatalogOption[];
  value: string | null;
  onSelect: (option: CatalogOption | null) => void;
  /** A new product or brand, to add to the lists of the form. */
  onCreated: (option: CatalogOption) => void;
}) {
  const [creating, setCreating] = useState(false);
  const shown = options.filter(
    (option) => option.active || option.id === value,
  );
  const pick = (id: string | null) =>
    onSelect(options.find((option) => option.id === id) ?? null);

  function created(option: CatalogOption) {
    setCreating(false);
    onCreated(option);
    onSelect(option);
  }

  const what = kind === "product" ? "produto" : "marca";
  return (
    <div className="flex items-end gap-2">
      <Combobox
        className="min-w-0 flex-1"
        label={label}
        required={required}
        placeholder={placeholder}
        emptyText={`${kind === "product" ? "Nenhum produto" : "Nenhuma marca"} com este nome. Use o “+” para cadastrar.`}
        options={shown.map((option) => ({
          value: option.id,
          label: option.name,
        }))}
        value={value}
        onSelect={pick}
      />
      <Button
        variant="secondary"
        size="icon"
        icon={<Plus className="size-4" />}
        aria-label={`Cadastrar ${what}`}
        title={`Cadastrar ${what}`}
        onClick={() => setCreating(true)}
      />
      {creating && kind === "product" && (
        <ProductForm
          variant="modal"
          onClose={() => setCreating(false)}
          onDone={(product) =>
            created({
              id: product.id,
              name: product.name,
              active: product.active,
              unit: product.unit,
            })
          }
        />
      )}
      {creating && kind === "brand" && (
        <BrandForm
          variant="modal"
          onClose={() => setCreating(false)}
          onDone={(brand) =>
            created({ id: brand.id, name: brand.name, active: brand.active })
          }
        />
      )}
    </div>
  );
}
