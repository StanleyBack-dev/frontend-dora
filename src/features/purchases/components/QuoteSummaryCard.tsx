"use client";

import type { ReactNode } from "react";
import {
  CalendarClock,
  ChevronDown,
  CreditCard,
  FileText,
  ListChecks,
  Truck,
} from "lucide-react";
import { Badge, cn } from "@/design-system";
import {
  QuoteActions,
  type QuoteMapActions,
} from "@/features/purchases/components/QuoteActions";
import { quoteBreakdown } from "@/features/purchases/model/quote-breakdown";
import {
  deliveryLabel,
  paymentLine,
} from "@/features/purchases/model/quote-labels";
import { pricedCount } from "@/features/purchases/model/quote-ranking";
import { formatRequestDay } from "@/features/purchases/model/request-labels";
import type { PurchaseQuote } from "@/shared/contracts/purchase-quotes";
import type { PurchaseRequestStatus } from "@/shared/contracts/purchase-requests";
import { formatCents } from "@/shared/lib/format";

function Fact({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span
        aria-hidden
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-surface-muted text-muted [&>svg]:size-3.5"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium tracking-wide text-soft uppercase">
          {label}
        </dt>
        <dd className="text-[13px] leading-5 break-words text-fg">
          {children}
        </dd>
      </div>
    </div>
  );
}

/**
 * One supplier in the map: its place, the total in large type, how much
 * more than the cheapest, the terms at a glance, how the total is made
 * up (folded) and the buttons. The chosen quote is outlined in orange,
 * the cheapest in green.
 */
export function QuoteSummaryCard({
  quote,
  rank,
  itemCount,
  cheapestCents,
  actions,
  requestStatus,
}: {
  quote: PurchaseQuote;
  rank: number;
  itemCount: number;
  /** The cheapest complete total (null: none is complete). */
  cheapestCents: number | null;
  actions: QuoteMapActions;
  /** The request's status: the chosen quote shows how its approval stands. */
  requestStatus: PurchaseRequestStatus;
}) {
  const priced = pricedCount(quote);
  const above =
    quote.complete && cheapestCents !== null && !quote.cheapest
      ? quote.totalCents - cheapestCents
      : 0;
  const payment = paymentLine(quote);

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col rounded-2xl border bg-surface shadow-card",
        quote.chosen
          ? "border-brand ring-2 ring-brand/30"
          : quote.cheapest
            ? "border-success-border"
            : "border-border",
      )}
    >
      <header
        className={cn(
          "flex items-start gap-3 rounded-t-[calc(1rem-1px)] px-4 pt-4 pb-3",
          quote.chosen
            ? "bg-brand-soft"
            : quote.cheapest
              ? "bg-success-soft"
              : "",
        )}
      >
        <span
          aria-label={`${rank}º lugar`}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full text-sm font-extrabold",
            quote.chosen
              ? "bg-brand text-brand-fg"
              : quote.cheapest
                ? "bg-success text-white"
                : "bg-surface-muted text-muted",
          )}
        >
          {rank}º
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold break-words text-fg">
            {quote.supplierName}
          </h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {quote.chosen && <Badge tone="brand">Escolhida</Badge>}
            {quote.chosen && requestStatus === "AWAITING_APPROVAL" && (
              <Badge tone="warning">Aguardando aprovação</Badge>
            )}
            {quote.chosen && requestStatus === "APPROVED" && (
              <Badge tone="success">Aprovada</Badge>
            )}
            {quote.chosen && requestStatus === "REJECTED" && (
              <Badge tone="danger">Reprovada</Badge>
            )}
            {quote.cheapest && <Badge tone="success">Mais barata</Badge>}
            {!quote.complete && <Badge tone="warning">Parcial</Badge>}
          </div>
        </div>
      </header>

      <div className="border-b border-border px-4 pb-3">
        <p className="text-[11px] font-medium tracking-wide text-soft uppercase">
          {quote.interestCents ? "Total a prazo" : "Total"}
        </p>
        <p
          className={cn(
            "text-2xl font-extrabold tracking-tight tabular-nums",
            quote.cheapest ? "text-success" : "text-fg",
          )}
        >
          {formatCents(quote.totalCents)}
        </p>
        <p className="text-xs text-muted">
          {quote.interestCents
            ? `${formatCents(quote.cashCents)} à vista`
            : quote.cheapest
              ? "Menor total entre as completas"
              : above
                ? `+ ${formatCents(above)} que a mais barata`
                : !quote.complete
                  ? "Sem todos os itens: não entra na disputa"
                  : " "}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-3 px-4 py-3">
        <Fact icon={<ListChecks />} label="Itens">
          <span className={cn(priced < itemCount && "text-warning")}>
            {priced} de {itemCount}
          </span>
        </Fact>
        <Fact icon={<Truck />} label="Entrega">
          {deliveryLabel(quote.deliveryDays) ?? "—"}
        </Fact>
        <Fact icon={<CreditCard />} label="Pagamento">
          {payment ?? "—"}
        </Fact>
        <Fact icon={<CalendarClock />} label="Validade">
          {quote.validUntil ? formatRequestDay(quote.validUntil) : "—"}
        </Fact>
      </dl>

      <details className="group border-t border-border px-4 py-2.5 text-[13px]">
        <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-fg [&::-webkit-details-marker]:hidden">
          Como chegou ao total
          <ChevronDown
            aria-hidden
            className="size-4 text-muted transition-transform group-open:rotate-180"
          />
        </summary>
        <dl className="mt-2 space-y-1.5">
          {quoteBreakdown(quote).map((line) => (
            <div key={line.label}>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{line.label}</dt>
                <dd
                  className={cn(
                    "tabular-nums",
                    !line.value
                      ? "text-soft"
                      : line.tone === "good"
                        ? "text-success"
                        : line.tone === "bad"
                          ? "text-danger"
                          : "text-fg",
                  )}
                >
                  {line.value ?? "—"}
                </dd>
              </div>
              {line.detail && (
                <p className="text-xs text-soft">{line.detail}</p>
              )}
            </div>
          ))}
          <div className="flex justify-between gap-3 border-t border-border pt-1.5 font-semibold text-fg">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatCents(quote.totalCents)}</dd>
          </div>
        </dl>
      </details>

      {(quote.notes || quote.fileUrl) && (
        <div className="space-y-1.5 border-t border-border px-4 py-2.5 text-[13px]">
          {quote.notes && (
            <p className="break-words text-muted">“{quote.notes}”</p>
          )}
          {quote.fileUrl && (
            <a
              href={quote.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-brand-ink hover:underline"
            >
              <FileText aria-hidden className="size-4" />
              Ver orçamento do fornecedor ({quote.fileIsPdf ? "PDF" : "imagem"})
            </a>
          )}
        </div>
      )}

      {(actions.editable || actions.choosable) && (
        <div className="mt-auto border-t border-border p-3">
          <QuoteActions quote={quote} actions={actions} />
        </div>
      )}
    </article>
  );
}
