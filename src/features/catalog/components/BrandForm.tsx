"use client";

import { useId, useState, type FormEvent } from "react";
import { Save, Tag } from "lucide-react";
import { Button, Field } from "@/design-system";
import { catalogClient } from "@/features/catalog/api/catalog.client";
import {
  CatalogFormShell,
  type CatalogFormVariant,
} from "@/features/catalog/components/CatalogFormShell";
import type { Brand } from "@/shared/contracts/catalog";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

// Registers a brand of the catalog or renames one: in a drawer on the
// Marcas page, in a modal with the "+" next to an item's brand (it comes
// back to be chosen right away). The parent mounts it when opening.
export function BrandForm({
  brand = null,
  variant = "drawer",
  onClose,
  onDone,
}: {
  /** The brand being renamed (null: a new one). */
  brand?: Brand | null;
  variant?: CatalogFormVariant;
  onClose: () => void;
  onDone: (brand: Brand) => void;
}) {
  const { showError, showSuccess } = useToast();
  // One id per form (a drawer and a modal may share the page).
  const formId = useId();
  const [name, setName] = useState(brand?.name ?? "");
  const [sending, setSending] = useState(false);
  const complete = name.trim().length >= 2;

  async function submit(event: FormEvent) {
    event.preventDefault();
    // React events bubble through portals: never reach the form this one
    // opened from (the request's drawer).
    event.stopPropagation();
    if (!complete) return;
    setSending(true);
    try {
      const saved = brand
        ? await catalogClient.renameBrand(brand.id, name.trim())
        : await catalogClient.createBrand(name.trim());
      showSuccess(brand ? "Marca atualizada." : "Marca cadastrada.");
      onDone(saved);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível salvar a marca.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <CatalogFormShell
      variant={variant}
      title={brand ? "Editar marca" : "Cadastrar marca"}
      subtitle="Fica no catálogo do condomínio para os itens das solicitações de compra."
      busy={sending}
      onClose={onClose}
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
              brand ? <Save className="size-4" /> : <Tag className="size-4" />
            }
          >
            {brand ? "Salvar alterações" : "Cadastrar marca"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="space-y-4">
        <Field
          label="Nome da marca"
          required
          maxLength={60}
          autoComplete="off"
          placeholder="Ex.: Philips"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </form>
    </CatalogFormShell>
  );
}
