"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  ClipboardPlus,
  FileText,
  Layers,
  ListChecks,
  MapPin,
  Save,
} from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Combobox,
  DraftNotice,
  Field,
  FormActions,
  FormIssues,
  FormTabs,
  type FormTab,
  Select,
  TextArea,
} from "@/design-system";
import { purchaseRequestsClient } from "@/features/purchases/api/purchase-requests.client";
import { CategoryChecklist } from "@/features/catalog/components/CategoryChecklist";
import { categoryLabels } from "@/features/catalog/model/categories";
import { RequestItemsList } from "@/features/purchases/components/RequestItemsList";
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
import { startNavigation } from "@/shared/lib/navigation-progress";
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

/** The form's tabs, in order. */
type RequestTab = "what" | "where" | "items" | "categories";

// Asks for a purchase (or edits one waiting for quotes): what is needed,
// its categories (as a supplier's, with "Outros (digitar)"), the priority,
// where and by when, and the items (products and brands of the catalog,
// which can be registered from here). A new request's form is kept as a
// draft until sent or cancelled; an edit starts from the request. A page
// form (as the event's): saving opens the request.
export function PurchaseRequestForm({
  request = null,
  spaces,
  products: initialProducts,
  brands: initialBrands,
}: {
  /** The request being edited (null: a new one). */
  request?: PurchaseRequest | null;
  /** The condominium's active spaces (where it will be used). */
  spaces: { id: string; name: string }[];
  /** The catalog (the selects offer the active ones). */
  products: CatalogOption[];
  brands: CatalogOption[];
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
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
    { open: request === null },
  );
  const [edited, setEdited] = useState<RequestForm | null>(() =>
    request ? formOf(request) : null,
  );
  const [sending, setSending] = useState(false);
  const [tried, setTried] = useState(false);
  const [tab, setTab] = useState<RequestTab>("what");
  const [error, setError] = useState<string | null>(null);
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
  // What blocks sending, and the tab where it is fixed.
  const issues = (
    [
      [
        "what",
        form.title.trim().length < 3 && "O que precisa (ao menos 3 letras)",
      ],
      ["where", pastDate && "Uma data a partir de hoje"],
      [
        "items",
        (form.items.length === 0 || !form.items.every(itemComplete)) &&
          "Os itens (produto, quantidade e unidade)",
      ],
      ["categories", form.categories.length === 0 && "Ao menos uma categoria"],
      [
        "categories",
        form.categories.includes("OTHER") &&
          form.categoryOther.trim().length < 2 &&
          "Qual a outra categoria",
      ],
    ] as [RequestTab, string | false][]
  ).filter((issue): issue is [RequestTab, string] => Boolean(issue[1]));
  const problems = issues.map(([, problem]) => problem);
  const invalid = (id: RequestTab) =>
    tried && issues.some(([issueTab]) => issueTab === id);

  // Only once something was typed (an empty field just keeps "Enviar" off).
  const otherProblem =
    form.categories.includes("OTHER") && form.categoryOther.trim().length === 1
      ? "Escreva ao menos 2 letras."
      : null;

  function cancel() {
    if (!request) draft.discard();
    router.push("/compras/solicitacoes");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    if (issues.length) {
      setTab(issues[0][0]);
      return;
    }
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
    setError(null);
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
      startNavigation();
      // The list, showing the request just saved (opened).
      router.push(
        `/compras/solicitacoes?solicitacao=${saved.id}&situacao=todas`,
      );
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível salvar a solicitação.";
      setError(message);
      showError(message);
      setSending(false);
    }
  }

  // In quotes the title, details, items and categories are kept (the API refuses
  // changes).
  const scopeLocked = request?.status === "QUOTING";
  const lockedNote = (
    <Alert tone="info">
      <strong>Em cotação:</strong> o título, os detalhes, os itens e as
      categorias não mudam mais, porque as cotações foram feitas sobre eles.
      Ainda dá para mudar a prioridade, o local e a data.
    </Alert>
  );

  const tabs: FormTab[] = [
    {
      id: "what",
      label: "O que precisa",
      icon: <ClipboardList />,
      invalid: invalid("what"),
      description:
        "O que precisa ser comprado ou contratado, a prioridade e, se quiser, mais detalhes.",
      content: (
        <>
          {scopeLocked && lockedNote}
          <Field
            label="O que precisa ser comprado ou contratado"
            required
            maxLength={120}
            autoComplete="off"
            placeholder="Ex.: lâmpadas para o hall do bloco A"
            value={form.title}
            disabled={scopeLocked}
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
          <TextArea
            label="Detalhes (opcional)"
            maxLength={1000}
            rows={4}
            placeholder="Ex.: marca de preferência, medidas, por que precisa."
            value={form.description}
            disabled={scopeLocked}
            onChange={(event) => update({ description: event.target.value })}
          />
        </>
      ),
    },
    {
      id: "where",
      label: "Onde e quando",
      icon: <MapPin />,
      invalid: invalid("where"),
      description: "Onde vai ser usado e até quando precisa.",
      content: (
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
      ),
    },
    {
      id: "items",
      label: `Itens (${form.items.length})`,
      icon: <ListChecks />,
      invalid: invalid("items"),
      description: scopeLocked
        ? "Os itens que foram cotados (somente leitura)."
        : "Escolha o produto do catálogo (ou cadastre com o +), a quantidade, a unidade e, se quiser, a marca e uma observação.",
      content: scopeLocked ? (
        <>
          {lockedNote}
          <RequestItemsList items={request.items} />
        </>
      ) : (
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
      ),
    },
    {
      id: "categories",
      label: "Categorias",
      icon: <Layers />,
      invalid: invalid("categories"),
      description: scopeLocked
        ? "As categorias da solicitação (somente leitura)."
        : "Marque uma ou mais: elas ajudam a escolher os fornecedores para as cotações. Não está na lista? Marque “Outros (digitar)” e escreva.",
      content: scopeLocked ? (
        <>
          {lockedNote}
          <div className="flex flex-wrap gap-1.5">
            {categoryLabels(request).map((label) => (
              <Badge
                key={label}
                tone="neutral"
                className="max-w-full whitespace-normal"
              >
                {label}
              </Badge>
            ))}
          </div>
        </>
      ) : (
        <>
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
        </>
      ),
    },
  ];

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {!request && draft.restored && <DraftNotice onDiscard={draft.discard} />}
      <FormIssues missing={tried ? problems : []} error={error} />

      <FormTabs
        label="Partes da solicitação"
        tabs={tabs}
        value={tab}
        onChange={(id) => setTab(id as RequestTab)}
      />

      <FormActions>
        <Button
          type="button"
          variant="cancel"
          onClick={cancel}
          disabled={sending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={sending}
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
      </FormActions>
    </form>
  );
}
