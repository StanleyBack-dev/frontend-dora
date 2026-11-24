"use client";

import { useId, useState, type FormEvent } from "react";
import {
  IdCard,
  Layers,
  Phone,
  Save,
  StickyNote,
  Truck,
  Wallet,
} from "lucide-react";
import {
  Button,
  DraftNotice,
  Drawer,
  DrawerActions,
  Field,
  CollapsibleSection,
  Select,
  TextArea,
} from "@/design-system";
import { suppliersClient } from "@/features/suppliers/api/suppliers.client";
import { CategoryChecklist } from "@/features/catalog/components/CategoryChecklist";
import { CATEGORIES } from "@/features/catalog/model/categories";
import { maskSupplierDocument } from "@/features/suppliers/model/supplier-labels";
import type { Category } from "@/shared/contracts/catalog";
import type {
  Supplier,
  SupplierDocumentType,
} from "@/shared/contracts/suppliers";
import { errorMessage } from "@/shared/lib/api-client";
import { BRAZILIAN_STATES } from "@/shared/lib/brazilian-states";
import { sameShape } from "@/shared/lib/form-draft";
import { cpfError } from "@/shared/lib/identity-document";
import { maskPhone, phoneError } from "@/shared/lib/masks";
import {
  isCnpj,
  maskPixKey,
  PIX_KEY_TYPES,
  pixKeyError,
  type PixKeyType,
} from "@/shared/lib/pix-key";
import { useFormDraft } from "@/shared/lib/use-form-draft";
import { useToast } from "@/shared/toast/useToast";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SupplierForm = {
  documentType: SupplierDocumentType;
  document: string;
  name: string;
  tradeName: string;
  categories: Category[];
  /** With OTHER checked: what it serves, typed ("Outros (digitar)"). */
  categoryOther: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pixKeyType: PixKeyType | "";
  pixKey: string;
  notes: string;
};

const EMPTY: SupplierForm = {
  documentType: "CNPJ",
  document: "",
  name: "",
  tradeName: "",
  categories: [],
  categoryOther: "",
  contactName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  pixKeyType: "",
  pixKey: "",
  notes: "",
};

const formOf = (supplier: Supplier): SupplierForm => ({
  documentType: supplier.documentType,
  document: maskSupplierDocument(supplier.documentType, supplier.document),
  name: supplier.name,
  tradeName: supplier.tradeName ?? "",
  categories: supplier.categories,
  categoryOther: supplier.categoryOther ?? "",
  contactName: supplier.contactName ?? "",
  email: supplier.email ?? "",
  phone: supplier.phone ? maskPhone(supplier.phone) : "",
  city: supplier.city ?? "",
  state: supplier.state ?? "",
  pixKeyType: supplier.pixKeyType ?? "",
  pixKey: supplier.pixKey
    ? maskPixKey(supplier.pixKeyType ?? "", supplier.pixKey)
    : "",
  notes: supplier.notes ?? "",
});

const parseDraft = (raw: unknown) => {
  const draft = sameShape(EMPTY, raw);
  if (draft) {
    draft.categories = Array.isArray(draft.categories)
      ? draft.categories.filter((category) => CATEGORIES.includes(category))
      : [];
  }
  return draft;
};

/** What is wrong with the document (null: fine or still empty). */
function documentProblem(form: SupplierForm): string | null {
  if (!form.document.trim()) return null;
  if (form.documentType === "CPF") return cpfError(form.document);
  const digits = form.document.replace(/\D/g, "");
  if (digits.length !== 14) return "O CNPJ tem 14 números.";
  return isCnpj(digits) ? null : "CNPJ inválido. Confira os números.";
}

/**
 * Registers or edits a supplier (Compras > Fornecedores): CNPJ or CPF,
 * name, what it serves, contact, city and, optionally, the PIX to pay it.
 * A new supplier's form is kept as a draft until saved or cancelled; an
 * edit starts from the supplier (the parent remounts it for each one).
 */
export function SupplierFormDrawer({
  open,
  supplier = null,
  onClose,
  onDone,
}: {
  open: boolean;
  /** The supplier being edited (null: a new one). */
  supplier?: Supplier | null;
  onClose: () => void;
  onDone: (supplier: Supplier) => void;
}) {
  const { showError, showSuccess } = useToast();
  /**
   * One id per drawer: the register and the edit drawers live on the same
   * page (a closed dialog stays in the DOM), and the footer button submits
   * the form by id.
   */
  const formId = useId();
  const draft = useFormDraft<SupplierForm>("supplier-new", EMPTY, parseDraft, {
    open: open && supplier === null,
  });
  const [edited, setEdited] = useState<SupplierForm | null>(() =>
    supplier ? formOf(supplier) : null,
  );
  const [sending, setSending] = useState(false);
  const form = edited ?? draft.value;
  const update = (patch: Partial<SupplierForm>) =>
    edited
      ? setEdited({ ...edited, ...patch })
      : draft.set((current) => ({ ...current, ...patch }));

  const docProblem = documentProblem(form);
  const emailProblem =
    form.email.trim() && !EMAIL.test(form.email.trim())
      ? "E-mail inválido."
      : null;
  const phoneProblem = form.phone.trim() ? phoneError(form.phone) : null;
  // Only once something was typed (an empty field just keeps "Salvar" off).
  const otherProblem =
    form.categories.includes("OTHER") && form.categoryOther.trim().length === 1
      ? "Escreva ao menos 2 letras."
      : null;
  const pixProblem =
    form.pixKeyType && form.pixKey.trim()
      ? pixKeyError(form.pixKeyType, form.pixKey)
      : null;
  const complete =
    form.document.trim() !== "" &&
    !docProblem &&
    form.name.trim().length >= 2 &&
    form.categories.length > 0 &&
    (!form.categories.includes("OTHER") ||
      form.categoryOther.trim().length >= 2) &&
    !emailProblem &&
    !phoneProblem &&
    !pixProblem &&
    (form.pixKeyType === "" || form.pixKey.trim() !== "");

  function cancel() {
    if (!supplier) draft.discard();
    onClose();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!complete) return;
    const input = {
      documentType: form.documentType,
      document: form.document.replace(/\D/g, ""),
      name: form.name.trim(),
      tradeName: form.tradeName.trim() || null,
      categories: form.categories,
      categoryOther: form.categories.includes("OTHER")
        ? form.categoryOther.trim()
        : null,
      contactName: form.contactName.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.replace(/\D/g, "") || null,
      city: form.city.trim() || null,
      state: form.state || null,
      pixKeyType: form.pixKeyType || null,
      pixKey: form.pixKeyType ? form.pixKey.trim() : null,
      notes: form.notes.trim() || null,
    };
    setSending(true);
    try {
      const saved = supplier
        ? await suppliersClient.updateSupplier(supplier.id, input)
        : await suppliersClient.createSupplier(input);
      showSuccess(
        supplier ? "Fornecedor atualizado." : "Fornecedor cadastrado.",
      );
      if (!supplier) draft.discard();
      onDone(saved);
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível salvar o fornecedor."));
    } finally {
      setSending(false);
    }
  }

  const pixType = PIX_KEY_TYPES.find((item) => item.value === form.pixKeyType);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      busy={sending}
      title={supplier ? "Editar fornecedor" : "Cadastrar fornecedor"}
      subtitle="Quem o condomínio contrata ou de quem compra. Ele aparece nas cotações das compras."
      footer={
        <DrawerActions>
          <Button variant="cancel" onClick={cancel} disabled={sending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={sending}
            disabled={!complete}
            icon={
              supplier ? (
                <Save className="size-4" />
              ) : (
                <Truck className="size-4" />
              )
            }
          >
            {supplier ? "Salvar alterações" : "Cadastrar fornecedor"}
          </Button>
        </DrawerActions>
      }
    >
      <form id={formId} onSubmit={submit} className="space-y-4">
        {!supplier && draft.restored && (
          <DraftNotice onDiscard={draft.discard} />
        )}
        <CollapsibleSection icon={<IdCard />} title="Identificação">
          <div className="grid items-start gap-3 sm:grid-cols-[12rem_1fr]">
            <Select
              label="Documento"
              required
              value={form.documentType}
              onChange={(event) =>
                update({
                  documentType: event.target.value as SupplierDocumentType,
                  document: "",
                })
              }
              options={[
                { value: "CNPJ", label: "CNPJ (empresa)" },
                { value: "CPF", label: "CPF (autônomo)" },
              ]}
            />
            <Field
              label={form.documentType}
              required
              inputMode="numeric"
              autoComplete="off"
              placeholder={
                form.documentType === "CNPJ"
                  ? "00.000.000/0000-00"
                  : "000.000.000-00"
              }
              value={form.document}
              error={docProblem ?? undefined}
              onChange={(event) =>
                update({
                  document: maskSupplierDocument(
                    form.documentType,
                    event.target.value,
                  ),
                })
              }
            />
          </div>
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <Field
              label={form.documentType === "CNPJ" ? "Razão social" : "Nome"}
              required
              maxLength={120}
              autoComplete="off"
              value={form.name}
              onChange={(event) => update({ name: event.target.value })}
            />
            <Field
              label="Nome fantasia"
              maxLength={120}
              autoComplete="off"
              placeholder="Como é conhecido"
              value={form.tradeName}
              onChange={(event) => update({ tradeName: event.target.value })}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<Layers />}
          title="O que atende"
          description="Marque uma ou mais categorias: elas ajudam a encontrar o fornecedor ao cotar uma compra. Não está na lista? Marque “Outros (digitar)” e escreva."
        >
          <CategoryChecklist
            value={form.categories}
            onChange={(categories) => update({ categories })}
          />
          {form.categories.includes("OTHER") && (
            <Field
              label="Qual?"
              required
              maxLength={60}
              autoComplete="off"
              placeholder="Ex.: dedetização, elevadores, piscina"
              value={form.categoryOther}
              error={otherProblem ?? undefined}
              onChange={(event) =>
                update({ categoryOther: event.target.value })
              }
            />
          )}
        </CollapsibleSection>

        <CollapsibleSection icon={<Phone />} title="Contato">
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <Field
              label="Falar com"
              maxLength={80}
              autoComplete="off"
              placeholder="Nome do contato"
              value={form.contactName}
              onChange={(event) => update({ contactName: event.target.value })}
            />
            <Field
              label="Telefone ou WhatsApp"
              inputMode="tel"
              autoComplete="off"
              placeholder="(62) 99999-0000"
              value={form.phone}
              error={phoneProblem ?? undefined}
              onChange={(event) =>
                update({ phone: maskPhone(event.target.value) })
              }
            />
          </div>
          <Field
            label="E-mail"
            type="email"
            maxLength={160}
            autoComplete="off"
            autoCapitalize="none"
            placeholder="compras@fornecedor.com.br"
            value={form.email}
            error={emailProblem ?? undefined}
            onChange={(event) => update({ email: event.target.value })}
          />
          <div className="grid items-start gap-3 sm:grid-cols-[1fr_8rem]">
            <Field
              label="Cidade"
              maxLength={60}
              autoComplete="off"
              value={form.city}
              onChange={(event) => update({ city: event.target.value })}
            />
            <Select
              label="UF"
              value={form.state}
              onChange={(event) => update({ state: event.target.value })}
              options={[
                { value: "", label: "—" },
                ...BRAZILIAN_STATES.map((state) => ({
                  value: state,
                  label: state,
                })),
              ]}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          icon={<Wallet />}
          title="PIX para pagamento (opcional)"
          description="Fica à mão quando a compra for paga."
        >
          <div className="grid items-start gap-3 sm:grid-cols-[12rem_1fr]">
            <Select
              label="Tipo de chave"
              value={form.pixKeyType}
              onChange={(event) =>
                update({
                  pixKeyType: event.target.value as PixKeyType | "",
                  pixKey: "",
                })
              }
              options={[
                { value: "", label: "Sem PIX" },
                ...PIX_KEY_TYPES.map((item) => ({
                  value: item.value,
                  label: item.label,
                })),
              ]}
            />
            <Field
              label="Chave PIX"
              required={form.pixKeyType !== ""}
              disabled={!form.pixKeyType}
              inputMode={pixType?.inputMode}
              autoCapitalize="none"
              spellCheck={false}
              placeholder={pixType?.placeholder ?? "Escolha o tipo primeiro"}
              value={form.pixKey}
              error={pixProblem ?? undefined}
              onChange={(event) =>
                update({
                  pixKey: maskPixKey(form.pixKeyType, event.target.value),
                })
              }
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection icon={<StickyNote />} title="Observações">
          <TextArea
            label="Observações"
            hideLabel
            maxLength={500}
            rows={3}
            placeholder="Ex.: atende só em horário comercial; pede 50% adiantado."
            value={form.notes}
            onChange={(event) => update({ notes: event.target.value })}
          />
        </CollapsibleSection>
      </form>
    </Drawer>
  );
}
