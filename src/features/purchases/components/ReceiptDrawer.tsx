"use client";

import { useState } from "react";
import {
  CalendarDays,
  ListChecks,
  PackageCheck,
  ReceiptText,
  StickyNote,
} from "lucide-react";
import {
  Button,
  CollapsibleSection,
  Drawer,
  DrawerActions,
  Field,
  TextArea,
} from "@/design-system";
import {
  DocumentField,
  type PickedDocument,
} from "@/features/documents/components/DocumentField";
import { unitFor } from "@/features/catalog/model/units";
import { purchaseOrdersClient } from "@/features/purchases/api/purchase-orders.client";
import {
  MAX_INVOICE_NUMBER,
  MAX_RECEIPT_NOTE,
  quantityField,
} from "@/features/purchases/model/order-labels";
import {
  formatQuantity,
  itemSpec,
} from "@/features/purchases/model/request-labels";
import type { PurchaseOrderLine } from "@/shared/contracts/purchase-orders";
import { errorMessage } from "@/shared/lib/api-client";
import { localDay } from "@/shared/lib/datetime";
import {
  centsOf,
  maskDecimal,
  maskMoney,
  parseDecimal,
} from "@/shared/lib/masks";
import { useToast } from "@/shared/toast/useToast";

/**
 * A delivery arrives, in a drawer: the day, what came of each item still
 * pending (all of it by default; "Nada chegou" clears it), the invoice
 * (number, value, day and the file) and a note, each in its section.
 * Recorded by the management or the gate.
 */
export function ReceiptDrawer({
  requestId,
  lines,
  orderedOn,
  onClose,
  onDone,
}: {
  requestId: string;
  /** The items still to arrive (something pending). */
  lines: PurchaseOrderLine[];
  /** The day the order was placed (the first day a delivery may have). */
  orderedOn: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const { showError, showSuccess } = useToast();
  const today = localDay(new Date());
  const [receivedOn, setReceivedOn] = useState(today);
  const [quantities, setQuantities] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      lines.map((line) => [line.requestItemId, quantityField(line.pending)]),
    ),
  );
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceValue, setInvoiceValue] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [file, setFile] = useState<PickedDocument | null>(null);
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  const [pending, setPending] = useState(false);

  const parsed = lines.map((line) => ({
    line,
    quantity: parseDecimal(quantities[line.requestItemId] || "0"),
  }));
  const itemProblem = (line: PurchaseOrderLine, quantity: number | null) =>
    quantity === null
      ? "Quantidade inválida."
      : quantity > line.pending
        ? `Falta chegar só ${formatQuantity(line.pending, line.unit)}.`
        : null;
  const nothing = parsed.every(({ quantity }) => !quantity);
  const dayProblem =
    !receivedOn || receivedOn < orderedOn || receivedOn > today
      ? "A data vai do dia do pedido até hoje."
      : null;
  const invoiceDateProblem =
    invoiceDate && invoiceDate > today
      ? "A data da nota não pode ser no futuro."
      : null;
  const invalid =
    nothing ||
    Boolean(dayProblem) ||
    Boolean(invoiceDateProblem) ||
    parsed.some(({ line, quantity }) => itemProblem(line, quantity));

  async function save() {
    setTried(true);
    if (invalid) return;
    setPending(true);
    try {
      await purchaseOrdersClient.addReceipt(
        requestId,
        {
          receivedOn,
          items: parsed.flatMap(({ line, quantity }) =>
            quantity ? [{ requestItemId: line.requestItemId, quantity }] : [],
          ),
          invoiceNumber: invoiceNumber.trim() || null,
          invoiceCents: centsOf(invoiceValue),
          invoiceDate:
            invoiceDate ||
            (invoiceNumber.trim() || invoiceValue || file ? receivedOn : null),
          note: note.trim() || null,
        },
        file?.base64 ?? null,
      );
      const complete = parsed.every(
        ({ line, quantity }) => quantity === line.pending,
      );
      showSuccess(
        complete ? "Entrega registrada: tudo chegou." : "Entrega registrada.",
      );
      onDone();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível registrar a entrega."));
      setPending(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title="Registrar entrega"
      subtitle="O que chegou nesta entrega (pode ser só uma parte) e a nota fiscal."
      busy={pending}
      footer={
        <DrawerActions>
          <Button variant="cancel" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={<PackageCheck className="size-4" />}
            loading={pending}
            onClick={() => void save()}
          >
            Registrar entrega
          </Button>
        </DrawerActions>
      }
    >
      <div className="space-y-4">
        <CollapsibleSection icon={<CalendarDays />} title="Quando chegou">
          <Field
            label="Data da entrega"
            type="date"
            required
            min={orderedOn}
            max={today}
            value={receivedOn}
            error={tried && dayProblem ? dayProblem : undefined}
            onChange={(event) => setReceivedOn(event.target.value)}
          />
        </CollapsibleSection>

        <CollapsibleSection
          icon={<ListChecks />}
          title="O que chegou"
          description="Já vem preenchido com o que falta de cada item; ajuste ao que veio."
        >
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setQuantities(
                  Object.fromEntries(
                    lines.map((line) => [line.requestItemId, ""]),
                  ),
                )
              }
            >
              Nada chegou
            </Button>
          </div>
          <ul className="space-y-2">
            {parsed.map(({ line, quantity }) => {
              const problem = tried ? itemProblem(line, quantity) : null;
              return (
                <li
                  key={line.requestItemId}
                  className="grid items-start gap-2 rounded-xl border border-border px-3 py-2.5 sm:grid-cols-[1fr_10rem]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium break-words text-fg">
                      {line.productName}
                    </p>
                    <p className="text-xs break-words text-soft">
                      {itemSpec(line)}
                    </p>
                    <p className="text-xs text-muted">
                      Falta chegar {formatQuantity(line.pending, line.unit)}
                    </p>
                  </div>
                  <Field
                    label={`Quantidade de ${line.productName}`}
                    hideLabel
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    trailing={
                      <span className="text-xs text-soft">
                        {unitFor(quantity ?? 0, line.unit)}
                      </span>
                    }
                    value={quantities[line.requestItemId] ?? ""}
                    error={problem ?? undefined}
                    onChange={(event) =>
                      setQuantities((current) => ({
                        ...current,
                        [line.requestItemId]: maskDecimal(event.target.value),
                      }))
                    }
                  />
                </li>
              );
            })}
          </ul>
          {tried && nothing && (
            <p className="text-[11px] font-medium text-danger">
              Informe o que chegou de ao menos um item.
            </p>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          icon={<ReceiptText />}
          title="Nota fiscal (opcional)"
          description="Número, valor, data e o PDF ou a foto da nota."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label="Número"
              maxLength={MAX_INVOICE_NUMBER}
              autoComplete="off"
              placeholder="Ex.: 12345"
              value={invoiceNumber}
              onChange={(event) => {
                setInvoiceNumber(event.target.value);
                if (!invoiceDate && event.target.value.trim()) {
                  setInvoiceDate(receivedOn);
                }
              }}
            />
            <Field
              label="Valor (R$)"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0,00"
              value={invoiceValue}
              onChange={(event) =>
                setInvoiceValue(maskMoney(event.target.value))
              }
            />
            <Field
              label="Data da nota"
              type="date"
              max={today}
              value={invoiceDate}
              error={
                tried && invoiceDateProblem ? invoiceDateProblem : undefined
              }
              onChange={(event) => setInvoiceDate(event.target.value)}
            />
          </div>
          <DocumentField
            variant="panel"
            label="Arquivo da nota"
            hint="PDF ou foto da nota, de até 1,2 MB."
            value={file}
            onChange={setFile}
          />
        </CollapsibleSection>

        <CollapsibleSection icon={<StickyNote />} title="Observação (opcional)">
          <TextArea
            label="Observação"
            hideLabel
            rows={3}
            maxLength={MAX_RECEIPT_NOTE}
            placeholder="Ex.: uma caixa veio amassada; o restante chega na sexta."
            value={note}
            hint={`${note.length}/${MAX_RECEIPT_NOTE}`}
            onChange={(event) => setNote(event.target.value)}
          />
        </CollapsibleSection>
      </div>
    </Drawer>
  );
}
