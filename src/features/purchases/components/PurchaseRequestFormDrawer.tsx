"use client";

import { useId, useState, type FormEvent } from "react";
import { ClipboardPlus, Save } from "lucide-react";
import {
  Button,
  Combobox,
  DraftNotice,
  Drawer,
  DrawerActions,
  Field,
  FormSection,
  Select,
  TextArea,
} from "@/design-system";
import { purchaseRequestsClient } from "@/features/purchases/api/purchase-requests.client";
import { CategoryChecklist } from "@/features/catalog/components/CategoryChecklist";
import {
  blankItem,
  itemComplete,
  parseQuantity,
  RequestItemsEditor,
  type RequestItemForm,
} from "@/features/purchases/components/RequestItemsEditor";
import { CATEGORIES } from "@/features/catalog/model/categories";
import {
  PRIORITY_LABELS,
  PURCHASE_PRIORITIES,
  requestCode,
} from "@/features/purchases/model/request-labels";
import type { CatalogOption, Category } from "@/shared/contracts/catalog";
import type {
  PurchasePriority,
  PurchaseRequest,
} from "@/shared/contracts/purchase-requests";
import { ApiClientError } from "@/shared/lib/api-client";
import { localDay } from "@/shared/lib/datetime";
import { sameShape } from "@/shared/lib/form-draft";
import { useFormDraft } from "@/shared/lib/use-form-draft";
import { useToast } from "@/shared/toast/useToast";

type RequestForm = {
  title: string;
  categories: Category[];
  /** With OTHER checked: what it is, typed ("Outros (digitar)"). */
  categoryOther: string;
  priority: PurchasePriority;
  /** A space of the condominium ("": another place or none). */
  spaceId: string;
  /** Another place, typed (without a space). */
  location: string;
  /** date input value ("": no date). */
  neededBy: string;
  description: string;
  items: RequestItemForm[];
};

const emptyForm = (): RequestForm => ({
  title: "",
  categories: [],
  categoryOther: "",
  priority: "NORMAL",
  spaceId: "",
  location: "",
  neededBy: "",
  description: "",
  items: [blankItem()],
});

const formOf = (request: PurchaseRequest): RequestForm => ({
  title: request.title,
  categories: request.categories,
  categoryOther: request.categoryOther ?? "",
  priority: request.priority,
  spaceId: request.spaceId ?? "",
  location: request.spaceId ? "" : (request.location ?? ""),
  neededBy: request.neededBy ?? "",
  description: request.description ?? "",
  items: request.items.map((item) => ({
    key: item.id,
    productId: item.productId,
    quantity: item.quantity.toLocaleString("pt-BR", {
      maximumFractionDigits: 2,
      useGrouping: false,
    }),
    unit: item.unit,
    brandId: item.brandId ?? "",
    note: item.note ?? "",
  })),
});

// Asks for a purchase (or edits one waiting for quotes): what is needed,
// its categories (as a supplier's, with "Outros (digitar)"), the priority,
// where and by when, and the items (products and brands of the catalog,
// which can be registered from here). A new request's form is kept as a
// draft until sent or cancelled; an edit starts from the request (the
// parent remounts it).
export function PurchaseRequestFormDrawer({
  open,
  request = null,
  spaces,
  products: initialProducts,
  brands: initialBrands,
  onClose,
  onDone,
}: {
  open: boolean;
  /** The request being edited (null: a new one). */
  request?: PurchaseRequest | null;
  /** The condominium's active spaces (where it will be used). */
  spaces: { id: string; name: string }[];
  /** The catalog (the selects offer the active ones). */
  products: CatalogOption[];
  brands: CatalogOption[];
  onClose: () => void;
  onDone: (request: PurchaseRequest) => void;
}) {
  const { showError, showSuccess } = useToast();
  // One id per drawer (a closed dialog stays in the DOM).
  const formId = useId();
  const [blank] = useState(emptyForm);
  const draft = useFormDraft<RequestForm>(
    "purchase-request-new",
    blank,
    (raw) => {
      const parsed = sameShape(blank, raw);
      if (!parsed) return null;
      parsed.categories = Array.isArray(parsed.categories)
        ? parsed.categories.filter((category) => CATEGORIES.includes(category))
        : [];
      parsed.items =
        Array.isArray(parsed.items) && parsed.items.length > 0
          ? parsed.items.map((item) => ({ ...blankItem(), ...item }))
          : [blankItem()];
      return parsed;
    },
    { open: open && request === null },
  );
  const [edited, setEdited] = useState<RequestForm | null>(() =>
    request ? formOf(request) : null,
  );
  const [sending, setSending] = useState(false);
  // The catalog, plus what is registered from this form.
  const [products, setProducts] = useState(initialProducts);
  const [brands, setBrands] = useState(initialBrands);
  // The earliest day the date field accepts, read on events (not in render).
  const [today, setToday] = useState("");
  const refreshToday = () => setToday(localDay(new Date()));

  const form = edited ?? draft.value;
  const update = (patch: Partial<RequestForm>) =>
    edited
      ? setEdited({ ...edited, ...patch })
      : draft.set((current) => ({ ...current, ...patch }));

  // The spaces, plus the request's own if it was deactivated since.
  const spaceOptions = [
    ...spaces.map((space) => ({ value: space.id, label: space.name })),
    ...(request?.spaceId &&
    !spaces.some((space) => space.id === request.spaceId)
      ? [{ value: request.spaceId, label: request.location ?? "Espaço" }]
      : []),
  ];

  /** A space picked, or another place typed ("Outro local (digitar)"). */
  function pickPlace(value: string | null) {
    const text = value?.trim() ?? "";
    const space = spaceOptions.find(
      (option) =>
        option.value === text ||
        option.label.toLowerCase() === text.toLowerCase(),
    );
    if (space) update({ spaceId: space.value, location: "" });
    else update({ spaceId: "", location: text });
  }

  const pastDate =
    form.neededBy !== "" &&
    today !== "" &&
    form.neededBy < today &&
    form.neededBy !== request?.neededBy;
  const complete =
    form.title.trim().length >= 3 &&
    form.categories.length > 0 &&
    (!form.categories.includes("OTHER") ||
      form.categoryOther.trim().length >= 2) &&
    !pastDate &&
    form.items.length > 0 &&
    form.items.every(itemComplete);

  // Only once something was typed (an empty field just keeps "Enviar" off).
  const otherProblem =
    form.categories.includes("OTHER") && form.categoryOther.trim().length === 1
      ? "Escreva ao menos 2 letras."
      : null;

  function cancel() {
    if (!request) draft.discard();
    onClose();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!complete) return;
    const input = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      categories: form.categories,
      categoryOther: form.categories.includes("OTHER")
        ? form.categoryOther.trim()
        : null,
      priority: form.priority,
      spaceId: form.spaceId || null,
      location: form.spaceId ? null : form.location.trim() || null,
      neededBy: form.neededBy || null,
      items: form.items.map((item) => ({
        productId: item.productId,
        quantity: parseQuantity(item.quantity) ?? 0,
        unit: item.unit.trim(),
        brandId: item.brandId || null,
        note: item.note.trim() || null,
      })),
    };
    setSending(true);
    try {
      const saved = request
        ? await purchaseRequestsClient.update(request.id, input)
        : await purchaseRequestsClient.create(input);
      showSuccess(
        request
          ? "Solicitação atualizada."
          : `Solicitação ${requestCode(saved.number)} enviada.`,
        request ? undefined : "A gestão foi avisada para começar as cotações.",
      );
      if (!request) draft.discard();
      onDone(saved);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível salvar a solicitação.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      busy={sending}
      title={
        request
          ? `Editar solicitação ${requestCode(request.number)}`
          : "Nova solicitação de compra"
      }
      subtitle="Diga o que precisa ser comprado ou contratado. A gestão é avisada e faz as cotações."
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
              request ? (
                <Save className="size-4" />
              ) : (
                <ClipboardPlus className="size-4" />
              )
            }
          >
            {request ? "Salvar alterações" : "Enviar solicitação"}
          </Button>
        </DrawerActions>
      }
    >
      <form id={formId} onSubmit={submit} className="space-y-6">
        {!request && draft.restored && (
          <DraftNotice onDiscard={draft.discard} />
        )}
        <FormSection title="O que precisa">
          <Field
            label="O que precisa ser comprado ou contratado"
            required
            maxLength={120}
            autoComplete="off"
            placeholder="Ex.: lâmpadas para o hall do bloco A"
            value={form.title}
            onChange={(event) => update({ title: event.target.value })}
          />
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <Select
              label="Prioridade"
              required
              value={form.priority}
              onChange={(event) =>
                update({ priority: event.target.value as PurchasePriority })
              }
              options={PURCHASE_PRIORITIES.map((priority) => ({
                value: priority,
                label: PRIORITY_LABELS[priority],
              }))}
            />
          </div>
        </FormSection>

        <FormSection
          title="Categorias"
          description="Marque uma ou mais: elas ajudam a escolher os fornecedores para as cotações. Não está na lista? Marque “Outros (digitar)” e escreva."
        >
          <CategoryChecklist
            label="Categorias da compra"
            value={form.categories}
            onChange={(categories) => update({ categories })}
          />
          {form.categories.includes("OTHER") && (
            <Field
              label="Qual?"
              required
              maxLength={60}
              autoComplete="off"
              placeholder="Ex.: brindes, decoração de Natal"
              value={form.categoryOther}
              error={otherProblem ?? undefined}
              onChange={(event) =>
                update({ categoryOther: event.target.value })
              }
            />
          )}
        </FormSection>

        <FormSection title="Onde e quando">
          <div className="grid items-start gap-3 sm:grid-cols-[1fr_12rem]">
            <Combobox
              label="Onde vai ser usado"
              placeholder="Escolha o espaço ou digite"
              freeText
              freeTextLabel="Outro local (digitar)"
              maxLength={80}
              options={spaceOptions}
              value={form.spaceId || form.location || null}
              onSelect={pickPlace}
            />
            <Field
              label="Precisa até"
              type="date"
              min={today || undefined}
              value={form.neededBy}
              error={pastDate ? "Não pode ser antes de hoje." : undefined}
              onFocus={refreshToday}
              onPointerDown={refreshToday}
              onChange={(event) => {
                refreshToday();
                update({ neededBy: event.target.value });
              }}
            />
          </div>
        </FormSection>

        <FormSection
          title="Itens"
          description="Escolha o produto do catálogo (ou cadastre com o +), a quantidade, a unidade e, se quiser, a marca e uma observação."
        >
          <RequestItemsEditor
            items={form.items}
            products={products}
            brands={brands}
            onProductCreated={(product) =>
              setProducts((current) => [...current, product])
            }
            onBrandCreated={(brand) =>
              setBrands((current) => [...current, brand])
            }
            onChange={(items) => update({ items })}
          />
        </FormSection>

        <FormSection title="Detalhes (opcional)">
          <TextArea
            label="Detalhes"
            hideLabel
            maxLength={1000}
            rows={3}
            placeholder="Ex.: marca de preferência, medidas, por que precisa."
            value={form.description}
            onChange={(event) => update({ description: event.target.value })}
          />
        </FormSection>
      </form>
    </Drawer>
  );
}
