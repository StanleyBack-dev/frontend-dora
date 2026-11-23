"use client";

import { useId, useState, type FormEvent } from "react";
import { Package, PackagePlus, Save } from "lucide-react";
import { Button, Combobox, Field, TextArea } from "@/design-system";
import { catalogClient } from "@/features/catalog/api/catalog.client";
import {
  CatalogFormShell,
  type CatalogFormVariant,
} from "@/features/catalog/components/CatalogFormShell";
import { UNIT_OPTIONS } from "@/features/catalog/model/units";
import type { Product } from "@/shared/contracts/catalog";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

// Registers a product of the catalog or edits one: in a drawer on the
// Produtos page, in a modal with the "+" next to an item's product (it
// comes back to be chosen right away). The parent mounts it when opening,
// so each opening starts from `product`.
export function ProductForm({
  product = null,
  variant = "drawer",
  onClose,
  onDone,
}: {
  /** The product being edited (null: a new one). */
  product?: Product | null;
  variant?: CatalogFormVariant;
  onClose: () => void;
  onDone: (product: Product) => void;
}) {
  const { showError, showSuccess } = useToast();
  // One id per form (a drawer and a modal may share the page).
  const formId = useId();
  const [name, setName] = useState(product?.name ?? "");
  const [unit, setUnit] = useState(product?.unit ?? "un");
  const [description, setDescription] = useState(product?.description ?? "");
  const [sending, setSending] = useState(false);
  const complete = name.trim().length >= 2 && unit.trim() !== "";

  async function submit(event: FormEvent) {
    event.preventDefault();
    // React events bubble through portals: never reach the form this one
    // opened from (the request's drawer).
    event.stopPropagation();
    if (!complete) return;
    const input = {
      name: name.trim(),
      unit: unit.trim(),
      description: description.trim() || null,
    };
    setSending(true);
    try {
      const saved = product
        ? await catalogClient.updateProduct(product.id, input)
        : await catalogClient.createProduct(input);
      showSuccess(product ? "Produto atualizado." : "Produto cadastrado.");
      onDone(saved);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível salvar o produto.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <CatalogFormShell
      variant={variant}
      title={product ? "Editar produto" : "Cadastrar produto"}
      subtitle="Fica no catálogo do condomínio para as solicitações de compra. Marca e detalhes de cada pedido vão no item."
      busy={sending}
      onClose={onClose}
      section={{
        icon: <Package />,
        title: "Produto",
        description: "Nome, unidade de costume e o que o identifica.",
      }}
      actions={
        <>
          <Button variant="cancel" onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={sending}
            disabled={!complete}
            icon={
              product ? (
                <Save className="size-4" />
              ) : (
                <PackagePlus className="size-4" />
              )
            }
          >
            {product ? "Salvar alterações" : "Cadastrar produto"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="space-y-4">
        <div className="grid items-start gap-3 sm:grid-cols-[1fr_9rem]">
          <Field
            label="Nome do produto"
            required
            maxLength={120}
            autoComplete="off"
            placeholder="Ex.: lâmpada LED 9W"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Combobox
            label="Unidade"
            required
            placeholder="un"
            freeText
            freeTextLabel="Outra (digitar)"
            maxLength={12}
            options={UNIT_OPTIONS}
            value={unit || null}
            onSelect={(value) => setUnit(value ?? "")}
          />
        </div>
        <TextArea
          label="Descrição (opcional)"
          maxLength={300}
          rows={2}
          placeholder="O que identifica o produto: medida, modelo, voltagem…"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </form>
    </CatalogFormShell>
  );
}
