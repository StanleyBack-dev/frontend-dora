"use client";

import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { cn, Field } from "@/design-system";
import {
  CATEGORIES,
  CATEGORY_LABELS,
} from "@/features/catalog/model/categories";
import type { Category } from "@/shared/contracts/catalog";

/** Lower case, without accents: "Elétrica" matches "eletrica". */
const plain = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const labelOf = (category: Category) =>
  category === "OTHER" ? "Outros (digitar)" : CATEGORY_LABELS[category];

/** One option of the list (the whole row toggles it). */
function Option({
  category,
  checked,
  onToggle,
}: {
  category: Category;
  checked: boolean;
  onToggle: (category: Category) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        checked
          ? "bg-brand-soft font-medium text-brand-ink"
          : "text-fg hover:bg-surface-muted",
      )}
    >
      <input
        type="checkbox"
        className="size-4 shrink-0 accent-[var(--brand)]"
        checked={checked}
        onChange={() => onToggle(category)}
      />
      <span className="min-w-0 flex-1">{labelOf(category)}</span>
      {checked && <Check aria-hidden className="size-4 shrink-0" />}
    </label>
  );
}

// The categories of a supplier or a purchase request, as a checklist: a
// search on top filters the
// options as it is typed (accents ignored), the chosen ones show as chips
// (removable, even when hidden by the search) and "Outros (digitar)"
// always stays at the end, for what is not on the list.
export function CategoryChecklist({
  value,
  label = "Categorias que o fornecedor atende",
  onChange,
}: {
  value: Category[];
  /** What the group is, for screen readers. */
  label?: string;
  onChange: (value: Category[]) => void;
}) {
  const [search, setSearch] = useState("");
  const term = plain(search);
  // "Outros" stays apart, at the end, whatever the search.
  const shown = CATEGORIES.filter(
    (category) =>
      category !== "OTHER" &&
      (!term || plain(labelOf(category)).includes(term)),
  );

  /** Checks or unchecks one, keeping the list's order. */
  const toggle = (category: Category) =>
    onChange(
      value.includes(category)
        ? value.filter((item) => item !== category)
        : CATEGORIES.filter(
            (item) => item === category || value.includes(item),
          ),
    );

  return (
    <div className="space-y-3">
      <Field
        label="Buscar categoria"
        hideLabel
        icon={<Search className="size-4" />}
        autoComplete="off"
        placeholder="Buscar categoria (ex.: elétrica, alimentação)"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {value.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-soft">
            {value.length === 1 ? "1 marcada:" : `${value.length} marcadas:`}
          </span>
          {value.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggle(category)}
              aria-label={`Desmarcar ${CATEGORY_LABELS[category]}`}
              className="inline-flex items-center gap-1 rounded-full border border-brand bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-ink hover:opacity-80"
            >
              {CATEGORY_LABELS[category]}
              <X aria-hidden className="size-3" />
            </button>
          ))}
        </div>
      )}

      <div
        role="group"
        aria-label={label}
        className="max-h-72 overflow-y-auto rounded-xl border border-border p-1.5"
      >
        {shown.length > 0 ? (
          <div className="grid gap-1 sm:grid-cols-2">
            {shown.map((category) => (
              <Option
                key={category}
                category={category}
                checked={value.includes(category)}
                onToggle={toggle}
              />
            ))}
          </div>
        ) : (
          <p className="px-3 py-2 text-sm text-soft">
            Nenhuma categoria com “{search.trim()}”. Marque “Outros (digitar)”
            abaixo e escreva o que ele atende.
          </p>
        )}
        <div className="mt-1.5 border-t border-border pt-1.5">
          <Option
            category="OTHER"
            checked={value.includes("OTHER")}
            onToggle={toggle}
          />
        </div>
      </div>
    </div>
  );
}
