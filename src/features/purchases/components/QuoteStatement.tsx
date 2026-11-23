import type { ReactNode } from "react";
import { InstallmentSchedule } from "@/features/purchases/components/InstallmentSchedule";
import {
  deliveryLabel,
  interestLabel,
  percentLabel,
} from "@/features/purchases/model/quote-labels";
import {
  formatQuantity,
  formatRequestDay,
} from "@/features/purchases/model/request-labels";
import type { PurchaseRequestItem } from "@/shared/contracts/purchase-requests";
import { cn } from "@/design-system";
import { formatCents } from "@/shared/lib/format";

/** The money of a quote, as the form works it out. */
export type StatementTotals = {
  itemsCents: number;
  shippingCents: number;
  /** Each charge with its value (only the filled ones). */
  charges: { label: string; amountCents: number }[];
  discountCents: number;
  /** The discount's percent in basis points (null: a fixed value). */
  discountPercentBp: number | null;
  /** Items + shipping + charges − discount. */
  cashCents: number;
  interestCents: number;
  /** What is paid in the end. */
  totalCents: number;
};

function Row({
  label,
  value,
  strong = false,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-between gap-3", className)}>
      <dt className={strong ? "text-sm font-semibold text-fg" : "text-muted"}>
        {label}
      </dt>
      <dd
        className={
          strong
            ? "text-right text-base font-semibold text-brand-ink"
            : "text-right text-fg"
        }
      >
        {value}
      </dd>
    </div>
  );
}

// The quote's statement, as a receipt (read only, worked out as the form is
// filled): the supplier, each product (quantity × price = total, or not
// quoted), the items, shipping, other charges, discount and the total paid
// at once; how it is paid with the interest and every installment; delivery
// and validity.
export function QuoteStatement({
  supplierName,
  lines,
  totals,
  payment,
  installmentValues,
  interestRateBp,
  deliveryDays,
  validUntil,
}: {
  /** null: not chosen yet. */
  supplierName: string | null;
  lines: {
    item: PurchaseRequestItem;
    unit: number | null;
    total: number | null;
  }[];
  totals: StatementTotals;
  /** The payment method's name (null: not said). */
  payment: string | null;
  /** Each installment (empty: at once). */
  installmentValues: number[];
  interestRateBp: number | null;
  deliveryDays: number | null;
  validUntil: string;
}) {
  const priced = lines.filter((line) => line.unit !== null).length;
  const split = installmentValues.length > 1;
  const interest = split && interestRateBp ? interestRateBp : null;

  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-border-strong bg-surface-muted/40 text-[13px]">
      <div className="border-b border-dashed border-border-strong px-4 py-3">
        <p className="text-xs font-semibold tracking-wide text-soft uppercase">
          Extrato da cotação
        </p>
        <p className="text-sm font-semibold break-words text-fg">
          {supplierName ?? "Fornecedor não escolhido"}
        </p>
      </div>

      <div>
        <ol className="divide-y divide-border px-4">
          {lines.map(({ item, unit, total }, index) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 py-2"
            >
              <span className="min-w-0">
                <span className="block break-words text-fg">
                  {index + 1}. {item.productName}
                  {item.brandName ? ` · ${item.brandName}` : ""}
                </span>
                <span className="text-xs text-soft">
                  {unit === null
                    ? `${formatQuantity(item.quantity, item.unit)} · não cotou`
                    : `${formatQuantity(item.quantity, item.unit)} × ${formatCents(unit)}`}
                </span>
              </span>
              <span
                className={
                  total === null
                    ? "shrink-0 text-soft"
                    : "shrink-0 font-medium text-fg"
                }
              >
                {total === null ? "—" : formatCents(total)}
              </span>
            </li>
          ))}
        </ol>

        <div>
          <dl className="space-y-1 border-t border-dashed border-border-strong px-4 py-3">
            <Row
              label={`Itens (${priced} de ${lines.length})`}
              value={formatCents(totals.itemsCents)}
            />
            <Row label="Frete" value={formatCents(totals.shippingCents)} />
            {totals.charges.map((charge, index) => (
              <Row
                key={index}
                label={charge.label}
                value={formatCents(charge.amountCents)}
              />
            ))}
            {totals.discountCents > 0 && (
              <Row
                label={
                  totals.discountPercentBp
                    ? `Desconto (${percentLabel(totals.discountPercentBp)})`
                    : "Desconto"
                }
                value={
                  <span className="text-success">
                    − {formatCents(totals.discountCents)}
                  </span>
                }
              />
            )}
            {interest && (
              <>
                <Row
                  label="Total à vista"
                  value={formatCents(totals.cashCents)}
                  className="border-t border-border pt-1.5"
                />
                <Row
                  label={`Juros (${interestLabel(interest)})`}
                  value={`+ ${formatCents(totals.interestCents)}`}
                />
              </>
            )}
            {priced < lines.length && (
              <p className="pt-1 text-xs text-warning">
                Cotação parcial: {lines.length - priced}{" "}
                {lines.length - priced === 1
                  ? "item sem preço"
                  : "itens sem preço"}
                .
              </p>
            )}
          </dl>

          <dl className="space-y-1 border-t border-dashed border-border-strong px-4 py-3">
            <Row
              label="Pagamento"
              value={
                payment
                  ? `${payment} · ${split ? `${installmentValues.length}x ${interest ? "com juros" : "sem juros"}` : "à vista"}`
                  : "—"
              }
            />
            {split && (
              <div className="pt-1">
                <dt className="sr-only">Parcelas</dt>
                <dd>
                  <InstallmentSchedule values={installmentValues} />
                </dd>
              </div>
            )}
            <Row
              label="Prazo de entrega"
              value={deliveryLabel(deliveryDays) ?? "—"}
            />
            <Row
              label="Validade"
              value={validUntil ? formatRequestDay(validUntil) : "—"}
            />
          </dl>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t-2 border-brand bg-brand-soft px-4 py-3">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-fg">
            {interest ? "Total a prazo" : "Total"}
          </span>
          {split && (
            <span className="block text-xs text-muted">
              {installmentValues.length}x {interest ? "com juros" : "sem juros"}
            </span>
          )}
        </span>
        <span className="text-xl font-bold text-brand-ink tabular-nums">
          {formatCents(totals.totalCents)}
        </span>
      </div>
    </div>
  );
}
