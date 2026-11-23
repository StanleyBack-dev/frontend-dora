"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  CalendarClock,
  FileText,
  Hash,
  ListChecks,
  Percent,
  Plus,
  Receipt,
  Save,
  Tag,
  Trash2,
  Truck,
  Wallet,
} from "lucide-react";
import {
  Badge,
  Button,
  cn,
  Combobox,
  DraftNotice,
  Field,
  FormActions,
  FormIssues,
  FormSection,
  FormTabs,
  type FormTab,
  Select,
  TextArea,
} from "@/design-system";
import { categoryLabels } from "@/features/catalog/model/categories";
import {
  DocumentField,
  type PickedDocument,
} from "@/features/documents/components/DocumentField";
import { DocumentPreview } from "@/features/documents/components/DocumentPreview";
import { purchaseQuotesClient } from "@/features/purchases/api/purchase-quotes.client";
import { InstallmentSchedule } from "@/features/purchases/components/InstallmentSchedule";
import { QuoteStatement } from "@/features/purchases/components/QuoteStatement";
import {
  CHARGE_LABELS,
  INSTALLMENT_METHODS,
  installmentPlan,
  interestLabel,
  MAX_INSTALLMENTS,
  MAX_INTEREST_BP,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  percentLabel,
} from "@/features/purchases/model/quote-labels";
import { formatQuantity } from "@/features/purchases/model/request-labels";
import type {
  PaymentMethod,
  PurchaseQuote,
  QuoteSupplierOption,
} from "@/shared/contracts/purchase-quotes";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatCents } from "@/shared/lib/format";
import { sameShape } from "@/shared/lib/form-draft";
import { centsOf, maskMoney, moneyField } from "@/shared/lib/masks";
import { startNavigation } from "@/shared/lib/navigation-progress";
import { useFormDraft } from "@/shared/lib/use-form-draft";
import { useToast } from "@/shared/toast/useToast";

type ChargeField = { label: string; amount: string };
type DiscountMode = "fixed" | "percent";

const blankCharge = (): ChargeField => ({ label: "", amount: "" });

/** The quote as the form edits it (money masked, numbers as typed). */
type QuoteFormValue = {
  supplierId: string;
  /** Unit price per request item ("" : not quoted). */
  prices: Record<string, string>;
  shipping: string;
  /** Other charges: what each is and its value as typed. */
  charges: ChargeField[];
  /** A fixed value (R$) or a percent of items + shipping + charges. */
  discountMode: DiscountMode;
  discount: string;
  /** The percent as typed ("5"; "2,5"). */
  discountPercent: string;
  deliveryDays: string;
  /** "": not said. */
  paymentMethod: PaymentMethod | "";
  /** With OTHER: the terms typed ("Outro (digitar)"). */
  paymentOther: string;
  /** "1": at once. */
  installments: string;
  /** Monthly interest as typed ("1,99"; "": none). */
  interest: string;
  validUntil: string;
  notes: string;
};

const emptyForm = (request: PurchaseRequest): QuoteFormValue => ({
  supplierId: "",
  prices: Object.fromEntries(request.items.map((item) => [item.id, ""])),
  shipping: "",
  charges: [blankCharge()],
  discountMode: "fixed",
  discount: "",
  discountPercent: "",
  deliveryDays: "",
  paymentMethod: "",
  paymentOther: "",
  installments: "1",
  interest: "",
  validUntil: "",
  notes: "",
});

/** "1,99" from 199 basis points. */
const percentField = (bp: number | null) =>
  bp ? (bp / 100).toFixed(2).replace(".", ",") : "";

/** Digits and one comma, two decimals at most ("1,99"; up to 100). */
const maskPercent = (value: string, digits = 2) => {
  const [whole, ...rest] = value.replace(/[^\d,]/g, "").split(",");
  const decimals = rest.join("").slice(0, 2);
  return rest.length
    ? `${whole.slice(0, digits)},${decimals}`
    : whole.slice(0, digits);
};

/** Basis points of "1,99" (null: empty or zero). */
const bpOf = (value: string) => {
  const number = Number(value.replace(",", "."));
  return value.trim() && Number.isFinite(number) && number > 0
    ? Math.round(number * 100)
    : null;
};

const formOf = (
  request: PurchaseRequest,
  quote: PurchaseQuote,
): QuoteFormValue => ({
  supplierId: quote.supplierId,
  prices: Object.fromEntries(
    request.items.map((item) => [
      item.id,
      moneyField(
        quote.lines.find((line) => line.requestItemId === item.id)
          ?.unitPriceCents ?? null,
      ),
    ]),
  ),
  shipping: quote.shippingCents > 0 ? moneyField(quote.shippingCents) : "",
  charges: quote.charges.length
    ? quote.charges.map((charge) => ({
        label: charge.label,
        amount: moneyField(charge.amountCents),
      }))
    : [blankCharge()],
  discountMode: quote.discountPercentBp ? "percent" : "fixed",
  discount:
    !quote.discountPercentBp && quote.discountCents > 0
      ? moneyField(quote.discountCents)
      : "",
  discountPercent: percentField(quote.discountPercentBp),
  deliveryDays: quote.deliveryDays?.toString() ?? "",
  paymentMethod: quote.paymentMethod ?? "",
  paymentOther: quote.paymentTerms ?? "",
  installments: String(quote.installments ?? 1),
  interest: percentField(quote.interestRateBp),
  validUntil: quote.validUntil ?? "",
  notes: quote.notes ?? "",
});

/** The form's tabs, in order. */
type QuoteTab = "supplier" | "items" | "payment" | "terms" | "values";

const PAYMENT_OPTIONS = PAYMENT_METHODS.filter(
  (method) => method !== "OTHER",
).map((method) => ({ value: method, label: PAYMENT_METHOD_LABELS[method] }));

const MAX_CHARGES = 10;

const DISCOUNT_MODES: { value: DiscountMode; label: string }[] = [
  { value: "fixed", label: "Valor (R$)" },
  { value: "percent", label: "Porcentagem (%)" },
];

const CHARGE_OPTIONS = CHARGE_LABELS.map((label) => ({
  value: label,
  label,
}));

const INSTALLMENT_OPTIONS = Array.from(
  { length: MAX_INSTALLMENTS },
  (_, index) => ({
    value: String(index + 1),
    label: index === 0 ? "À vista" : `${index + 1}x`,
  }),
);

// The page form of a supplier's quote for a request (new or editing): the
// supplier (those serving the request's categories first), each item's unit
// price (empty: the supplier doesn't have it), how it is paid (a method or
// "Outro (digitar)", installments and the monthly interest, Price table,
// simulated here), shipping, other charges, discount, delivery, validity,
// notes and the supplier's document, in tabs (Fornecedor, Itens e preços,
// Pagamento, Condições, Valores e extrato: the values beside the statement).
// A new quote is kept as a draft
// per request (the document isn't) until saved or cancelled.
export function QuoteForm({
  request,
  quote = null,
  suppliers,
  takenSupplierIds,
}: {
  request: PurchaseRequest;
  /** The quote being edited (null: a new one). */
  quote?: PurchaseQuote | null;
  /** The active suppliers. */
  suppliers: QuoteSupplierOption[];
  /** Suppliers already quoting this request (one quote each). */
  takenSupplierIds: string[];
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const back = `/compras/cotacoes/${request.id}`;
  const [blank] = useState(() => emptyForm(request));
  const draft = useFormDraft<QuoteFormValue>(
    `purchase-quote-new:${request.id}`,
    blank,
    (raw) => {
      const parsed = sameShape(blank, raw);
      if (!parsed) return null;
      // Only this request's items, as typed.
      const prices =
        parsed.prices && typeof parsed.prices === "object" ? parsed.prices : {};
      parsed.prices = Object.fromEntries(
        request.items.map((item) => [
          item.id,
          typeof prices[item.id] === "string" ? prices[item.id] : "",
        ]),
      );
      parsed.charges = Array.isArray(parsed.charges)
        ? parsed.charges
            .filter(
              (charge): charge is ChargeField =>
                Boolean(charge) &&
                typeof charge.label === "string" &&
                typeof charge.amount === "string",
            )
            .slice(0, MAX_CHARGES)
        : [];
      if (parsed.charges.length === 0) parsed.charges = [blankCharge()];
      if (parsed.discountMode !== "percent") parsed.discountMode = "fixed";
      if (
        parsed.paymentMethod &&
        !PAYMENT_METHODS.includes(parsed.paymentMethod)
      ) {
        parsed.paymentMethod = "";
      }
      return parsed;
    },
    { open: quote === null },
  );
  const [edited, setEdited] = useState<QuoteFormValue | null>(() =>
    quote ? formOf(request, quote) : null,
  );
  const [file, setFile] = useState<PickedDocument | null>(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<QuoteTab>("supplier");

  const form = edited ?? draft.value;
  const update = (patch: Partial<QuoteFormValue>) =>
    edited
      ? setEdited({ ...edited, ...patch })
      : draft.set((current) => ({ ...current, ...patch }));

  const setCharge = (index: number, patch: Partial<ChargeField>) =>
    update({
      charges: form.charges.map((charge, at) =>
        at === index ? { ...charge, ...patch } : charge,
      ),
    });
  const removeCharge = (index: number) => {
    const rest = form.charges.filter((_, at) => at !== index);
    update({ charges: rest.length ? rest : [blankCharge()] });
  };

  // Suppliers serving one of the request's categories come first.
  const serves = (supplier: QuoteSupplierOption) =>
    supplier.categories.filter((category) =>
      request.categories.includes(category),
    );
  const available = suppliers.filter(
    (supplier) =>
      supplier.id === quote?.supplierId ||
      !takenSupplierIds.includes(supplier.id),
  );
  const supplierOptions = [
    ...available.filter((supplier) => serves(supplier).length > 0),
    ...available.filter((supplier) => serves(supplier).length === 0),
  ].map((supplier) => {
    const matching = serves(supplier);
    return {
      value: supplier.id,
      label: matching.length
        ? `${supplier.name} — atende ${categoryLabels({ categories: matching, categoryOther: supplier.categoryOther }).join(", ")}`
        : supplier.name,
    };
  });

  const lines = request.items.map((item) => {
    const unit = centsOf(form.prices[item.id] ?? "");
    return {
      item,
      unit,
      total: unit === null ? null : Math.round(item.quantity * unit),
    };
  });
  const priced = lines.filter((line) => line.unit !== null).length;
  const itemsCents = lines.reduce((sum, line) => sum + (line.total ?? 0), 0);
  const shippingCents = centsOf(form.shipping) ?? 0;
  // Charges count once picked and valued; a picked one without a value
  // blocks saving.
  const charges = form.charges
    .map((charge) => ({
      label: charge.label.trim(),
      amountCents: centsOf(charge.amount) ?? 0,
    }))
    .filter((charge) => charge.label && charge.amountCents > 0);
  const chargeMissing = form.charges.some(
    (charge) => charge.label.trim() && !((centsOf(charge.amount) ?? 0) > 0),
  );
  const chargesCents = charges.reduce(
    (sum, charge) => sum + charge.amountCents,
    0,
  );
  const grossCents = itemsCents + shippingCents + chargesCents;
  const discountPercentBp =
    form.discountMode === "percent" ? bpOf(form.discountPercent) : null;
  const discountCents =
    discountPercentBp !== null
      ? Math.round((grossCents * discountPercentBp) / 10_000)
      : form.discountMode === "fixed"
        ? (centsOf(form.discount) ?? 0)
        : 0;
  const cashCents = Math.max(0, grossCents - discountCents);

  const splittable =
    form.paymentMethod !== "" &&
    INSTALLMENT_METHODS.includes(form.paymentMethod);
  const installments = splittable ? Number(form.installments) || 1 : 1;
  const interestRateBp = installments > 1 ? bpOf(form.interest) : null;
  const installmentValues =
    installments > 1 && cashCents > 0
      ? installmentPlan(cashCents, installments, interestRateBp)
      : [];
  const totalCents = installmentValues.length
    ? installmentValues.reduce((sum, part) => sum + part, 0)
    : cashCents;

  const days =
    form.deliveryDays.trim() === "" ? null : Number(form.deliveryDays);
  const daysProblem =
    days !== null && (!Number.isInteger(days) || days < 0 || days > 365)
      ? "De 0 a 365 dias."
      : undefined;
  const percentProblem =
    discountPercentBp !== null && discountPercentBp > 10_000
      ? "Até 100%."
      : undefined;
  const discountProblem =
    !percentProblem && discountCents > grossCents
      ? "O desconto não pode passar do valor da cotação."
      : undefined;
  const interestProblem =
    interestRateBp !== null && interestRateBp > MAX_INTEREST_BP
      ? "Até 20% ao mês."
      : undefined;
  const otherMissing =
    form.paymentMethod === "OTHER" && form.paymentOther.trim().length < 2;

  // What blocks saving, and the tab where it is fixed.
  const issues = (
    [
      ["supplier", !form.supplierId && "Fornecedor"],
      ["items", priced === 0 && "O preço de ao menos um item"],
      ["payment", otherMissing && "A forma de pagamento (Outro)"],
      ["payment", interestProblem && "Juros até 20% ao mês"],
      ["terms", daysProblem && "Prazo de entrega válido"],
      ["values", chargeMissing && "O valor de cada encargo escolhido"],
      ["values", percentProblem && "Desconto até 100%"],
      ["values", discountProblem && "Desconto até o valor da cotação"],
    ] as [QuoteTab, string | false | undefined][]
  ).filter((issue): issue is [QuoteTab, string] => Boolean(issue[1]));
  const problems = issues.map(([, problem]) => problem);
  const invalid = (id: QuoteTab) =>
    tried && issues.some(([issueTab]) => issueTab === id);
  const hasFile = Boolean(quote?.fileUrl) && !removeFile && !file;

  /** A method picked, or a text typed ("Outro (digitar)"). */
  function pickPayment(value: string | null) {
    const text = value?.trim() ?? "";
    const known = PAYMENT_METHODS.find(
      (method) =>
        method === text ||
        PAYMENT_METHOD_LABELS[method].toLowerCase() === text.toLowerCase(),
    );
    if (!text)
      update({
        paymentMethod: "",
        paymentOther: "",
        installments: "1",
        interest: "",
      });
    else if (known && known !== "OTHER") {
      const split = INSTALLMENT_METHODS.includes(known);
      update({
        paymentMethod: known,
        paymentOther: "",
        installments: split ? form.installments : "1",
        interest: split ? form.interest : "",
      });
    } else update({ paymentMethod: "OTHER", paymentOther: text });
  }

  function cancel() {
    if (!quote) draft.discard();
    router.push(back);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    if (issues.length) {
      setTab(issues[0][0]);
      return;
    }
    const input = {
      items: lines.map((line) => ({
        requestItemId: line.item.id,
        unitPriceCents: line.unit,
      })),
      shippingCents: shippingCents || null,
      charges,
      discountCents: discountPercentBp === null ? discountCents || null : null,
      discountPercentBp,
      interestRateBp,
      deliveryDays: days,
      paymentMethod: form.paymentMethod || null,
      installments: installments > 1 ? installments : null,
      paymentTerms:
        form.paymentMethod === "OTHER" ? form.paymentOther.trim() : null,
      validUntil: form.validUntil || null,
      notes: form.notes.trim() || null,
    };
    setPending(true);
    setError(null);
    try {
      if (quote) {
        await purchaseQuotesClient.update(
          quote.id,
          input,
          file?.base64 ?? null,
          removeFile && !file,
        );
      } else {
        await purchaseQuotesClient.add(
          request.id,
          form.supplierId,
          input,
          file?.base64 ?? null,
        );
        draft.discard();
      }
      showSuccess(quote ? "Cotação atualizada." : "Cotação registrada.");
      startNavigation();
      router.push(back);
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível salvar a cotação.";
      setError(message);
      showError(message);
      setPending(false);
    }
  }

  const supplierName =
    quote?.supplierName ??
    suppliers.find((supplier) => supplier.id === form.supplierId)?.name ??
    null;

  const tabs: FormTab[] = [
    {
      id: "supplier",
      label: "Fornecedor",
      icon: <Truck />,
      invalid: invalid("supplier"),
      description:
        "Quem enviou o orçamento e o arquivo que ele mandou. Os fornecedores que atendem as categorias da solicitação vêm primeiro.",
      content: (
        <>
          <FormSection icon={<Truck />} title="Fornecedor">
            {quote ? (
              <p className="text-sm font-medium text-fg">
                {quote.supplierName}
              </p>
            ) : (
              <Combobox
                label="Fornecedor"
                required
                placeholder="Busque pelo nome"
                emptyText="Nenhum fornecedor ativo com este nome. Cadastre em Compras > Fornecedores."
                options={supplierOptions}
                value={form.supplierId || null}
                onSelect={(value) => update({ supplierId: value ?? "" })}
              />
            )}
          </FormSection>
          <FormSection
            icon={<FileText />}
            title="Orçamento do fornecedor (opcional)"
            description="O PDF ou a foto do orçamento enviado pelo fornecedor."
          >
            {hasFile && quote?.fileUrl ? (
              <DocumentPreview
                url={quote.fileUrl}
                pdf={quote.fileIsPdf ?? false}
                name={
                  quote.fileIsPdf
                    ? "Orçamento anexado (PDF)"
                    : "Orçamento anexado"
                }
              >
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="size-4" />}
                  onClick={() => setRemoveFile(true)}
                >
                  Remover
                </Button>
              </DocumentPreview>
            ) : (
              <DocumentField
                variant="panel"
                label="Orçamento"
                hint="PDF ou imagem de até 1,2 MB."
                value={file}
                onChange={setFile}
              />
            )}
          </FormSection>
        </>
      ),
    },
    {
      id: "items",
      label: `Itens e preços (${priced}/${request.items.length})`,
      icon: <ListChecks />,
      invalid: invalid("items"),
      description:
        "O preço unitário de cada item. Deixe vazio o que o fornecedor não tem: a cotação fica parcial.",
      content: (
        <ol className="@container space-y-3">
          {lines.map(({ item, unit, total }, index) => (
            <li
              key={item.id}
              className={cn(
                "rounded-xl border bg-surface p-3 transition-colors sm:p-4",
                unit === null ? "border-border" : "border-brand-border",
              )}
            >
              <div className="flex flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span
                    aria-hidden
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-muted text-xs font-semibold text-muted"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-sm font-semibold break-words text-fg">
                      {item.productName}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone="info" className="gap-1">
                        <Hash aria-hidden className="size-3" />
                        {formatQuantity(item.quantity, item.unit)}
                      </Badge>
                      <Badge
                        tone={item.brandName ? "brand" : "neutral"}
                        className="max-w-full gap-1 whitespace-normal"
                      >
                        <Tag aria-hidden className="size-3" />
                        {item.brandName ?? "Qualquer marca"}
                      </Badge>
                    </div>
                    {item.note && (
                      <p className="text-xs break-words text-muted">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid shrink-0 grid-cols-2 items-end gap-3 @xl:w-72">
                  <Field
                    label="Preço unitário (R$)"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Não tem"
                    value={form.prices[item.id] ?? ""}
                    onChange={(event) =>
                      update({
                        prices: {
                          ...form.prices,
                          [item.id]: maskMoney(event.target.value),
                        },
                      })
                    }
                  />
                  <div className="pb-2.5 text-right">
                    <p className="text-xs text-soft">
                      {unit === null ? "Sem preço" : "Total do item"}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        total === null ? "text-soft" : "text-fg",
                      )}
                    >
                      {total === null ? "—" : formatCents(total)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ),
    },
    {
      id: "payment",
      label: "Pagamento",
      icon: <Wallet />,
      invalid: invalid("payment"),
      description:
        "A forma de pagamento, as parcelas e os juros ao mês, com a simulação de cada parcela.",
      content: (
        <>
          <Combobox
            label="Forma de pagamento"
            placeholder="Busque ou escolha"
            freeText
            freeTextLabel="Outro (digitar)"
            maxLength={120}
            options={PAYMENT_OPTIONS}
            value={
              form.paymentMethod === "OTHER"
                ? form.paymentOther || null
                : form.paymentMethod || null
            }
            onSelect={pickPayment}
          />
          {splittable && (
            <div className="grid items-start gap-3 sm:grid-cols-2">
              <Select
                label="Parcelas"
                value={form.installments}
                onChange={(event) =>
                  update({ installments: event.target.value })
                }
                options={INSTALLMENT_OPTIONS}
              />
              {installments > 1 && (
                <Field
                  label="Juros (% ao mês)"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="Sem juros"
                  value={form.interest}
                  error={interestProblem}
                  onChange={(event) =>
                    update({ interest: maskPercent(event.target.value) })
                  }
                />
              )}
            </div>
          )}
          {splittable && installments > 1 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted">
                Simulação: {installments}x{" "}
                {interestRateBp
                  ? `com juros de ${interestLabel(interestRateBp)} (Tabela Price)`
                  : "sem juros"}{" "}
                sobre {formatCents(cashCents)}
                {interestRateBp && cashCents > 0
                  ? ` · total a prazo ${formatCents(totalCents)}`
                  : ""}
              </p>
              {cashCents > 0 ? (
                <InstallmentSchedule values={installmentValues} />
              ) : (
                <p className="text-xs text-soft">
                  Informe os preços para ver o valor de cada parcela.
                </p>
              )}
            </div>
          )}
        </>
      ),
    },
    {
      id: "terms",
      label: "Condições",
      icon: <CalendarClock />,
      invalid: invalid("terms"),
      description: "Prazo de entrega, validade da cotação e observações.",
      content: (
        <>
          <div className="grid items-start gap-3 sm:grid-cols-2">
            <Field
              label="Prazo de entrega (dias)"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ex.: 5"
              value={form.deliveryDays}
              error={daysProblem}
              onChange={(event) =>
                update({
                  deliveryDays: event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 3),
                })
              }
            />
            <Field
              label="Validade da cotação"
              type="date"
              value={form.validUntil}
              onChange={(event) => update({ validUntil: event.target.value })}
            />
          </div>
          <TextArea
            label="Observações"
            maxLength={500}
            rows={4}
            placeholder="Ex.: garantia de 1 ano; instalação inclusa."
            value={form.notes}
            onChange={(event) => update({ notes: event.target.value })}
          />
        </>
      ),
    },
    {
      id: "values",
      label: "Valores e extrato",
      icon: <Receipt />,
      invalid: invalid("values"),
      description:
        "Frete, encargos e desconto, e o extrato da cotação: produtos, juros, total e parcelas.",
      content: (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
          <FormSection
            icon={<Percent />}
            title="Frete, encargos e desconto"
            description="O que soma ou desconta do valor dos itens."
          >
            <Field
              label="Frete (R$)"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0,00"
              value={form.shipping}
              onChange={(event) =>
                update({ shipping: maskMoney(event.target.value) })
              }
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-fg">Outros encargos</p>
              <ul className="space-y-2">
                {form.charges.map((charge, index) => (
                  <li
                    key={index}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 rounded-xl border border-border p-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto]"
                  >
                    <Combobox
                      label={`Encargo ${index + 1}`}
                      placeholder="Escolha ou digite"
                      freeText
                      freeTextLabel="Outro (digitar)"
                      maxLength={60}
                      options={CHARGE_OPTIONS}
                      value={charge.label || null}
                      onSelect={(value) =>
                        setCharge(index, {
                          label: value?.trim() ?? "",
                          ...(value?.trim() ? {} : { amount: "" }),
                        })
                      }
                      className="col-span-2 sm:col-span-1"
                    />
                    <Field
                      label="Valor (R$)"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder={
                        charge.label.trim() ? "0,00" : "Escolha antes"
                      }
                      value={charge.amount}
                      disabled={!charge.label.trim()}
                      error={
                        tried &&
                        charge.label.trim() &&
                        !((centsOf(charge.amount) ?? 0) > 0)
                          ? "Informe o valor."
                          : undefined
                      }
                      onChange={(event) =>
                        setCharge(index, {
                          amount: maskMoney(event.target.value),
                        })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mb-1"
                      aria-label={`Remover encargo ${index + 1}`}
                      icon={<Trash2 className="size-4" />}
                      onClick={() => removeCharge(index)}
                      disabled={
                        form.charges.length === 1 &&
                        !charge.label &&
                        !charge.amount
                      }
                    />
                  </li>
                ))}
              </ul>
              {form.charges.length < MAX_CHARGES && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus className="size-4" />}
                  onClick={() =>
                    update({ charges: [...form.charges, blankCharge()] })
                  }
                >
                  Adicionar encargo
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-fg">Desconto</p>
              <div
                role="radiogroup"
                aria-label="Tipo de desconto"
                className="inline-flex rounded-md border border-border-strong bg-surface p-1"
              >
                {DISCOUNT_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    role="radio"
                    aria-checked={form.discountMode === mode.value}
                    onClick={() => update({ discountMode: mode.value })}
                    className={cn(
                      "rounded-sm px-3 py-1.5 text-[13px] font-semibold transition-colors",
                      form.discountMode === mode.value
                        ? "bg-brand text-brand-fg"
                        : "text-muted hover:bg-surface-muted hover:text-fg",
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              {form.discountMode === "fixed" ? (
                <Field
                  label="Desconto (R$)"
                  hideLabel
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0,00"
                  value={form.discount}
                  error={discountProblem}
                  onChange={(event) =>
                    update({ discount: maskMoney(event.target.value) })
                  }
                />
              ) : (
                <>
                  <Field
                    label="Desconto (%)"
                    hideLabel
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="Ex.: 5 ou 2,5"
                    value={form.discountPercent}
                    error={percentProblem ?? discountProblem}
                    onChange={(event) =>
                      update({
                        discountPercent: maskPercent(event.target.value, 3),
                      })
                    }
                  />
                  <p className="text-xs text-muted">
                    {discountPercentBp
                      ? `${percentLabel(discountPercentBp)} de ${formatCents(grossCents)} (itens + frete + encargos) = − ${formatCents(discountCents)}`
                      : "Sobre itens + frete + encargos."}
                  </p>
                </>
              )}
            </div>
          </FormSection>
          <QuoteStatement
            supplierName={supplierName}
            lines={lines}
            totals={{
              itemsCents,
              shippingCents,
              charges,
              discountCents,
              discountPercentBp,
              cashCents,
              interestCents: totalCents - cashCents,
              totalCents,
            }}
            payment={
              form.paymentMethod === "OTHER"
                ? form.paymentOther.trim() || PAYMENT_METHOD_LABELS.OTHER
                : form.paymentMethod
                  ? PAYMENT_METHOD_LABELS[form.paymentMethod]
                  : null
            }
            installmentValues={installmentValues}
            interestRateBp={interestRateBp}
            deliveryDays={daysProblem ? null : days}
            validUntil={form.validUntil}
          />
        </div>
      ),
    },
  ];

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {!quote && draft.restored && <DraftNotice onDiscard={draft.discard} />}
      <FormIssues missing={tried ? problems : []} error={error} />

      <FormTabs
        label="Partes da cotação"
        tabs={tabs}
        value={tab}
        onChange={(id) => setTab(id as QuoteTab)}
      />

      <FormActions>
        <Button
          type="button"
          variant="cancel"
          onClick={cancel}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={pending}
          icon={
            quote ? (
              <Save className="size-4" />
            ) : (
              <Calculator className="size-4" />
            )
          }
        >
          {quote ? "Salvar alterações" : "Registrar cotação"}
        </Button>
      </FormActions>
    </form>
  );
}
