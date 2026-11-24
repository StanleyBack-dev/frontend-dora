"use client";

import type { ReactNode } from "react";
import { BadgeDollarSign, PiggyBank, Scale, Truck } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { QuoteMapActions } from "@/features/purchases/components/QuoteActions";
import { QuoteItemsByItem } from "@/features/purchases/components/QuoteItemsByItem";
import { QuoteItemsTable } from "@/features/purchases/components/QuoteItemsTable";
import { QuoteSummaryCard } from "@/features/purchases/components/QuoteSummaryCard";
import {
  deliveryLabel,
  lowestLines,
} from "@/features/purchases/model/quote-labels";
import {
  quoteInsights,
  rankQuotes,
} from "@/features/purchases/model/quote-ranking";
import type { PurchaseQuote } from "@/shared/contracts/purchase-quotes";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import { formatCents } from "@/shared/lib/format";

function MapSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        <p className="text-xs text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

/**
 * The comparison map, read top to bottom: the numbers that matter (the
 * cheapest, what it saves, the quickest delivery, how many are complete),
 * then one card per supplier from the cheapest complete one up, then the
 * price of each item side by side (a table from sm up; one list per item
 * on phones).
 */
export function QuoteComparison({
  request,
  quotes,
  actions,
}: {
  request: PurchaseRequest;
  quotes: PurchaseQuote[];
  actions: QuoteMapActions;
}) {
  const ranked = rankQuotes(quotes);
  const lowest = lowestLines(quotes, request.items.length);
  const insights = quoteInsights(quotes);

  return (
    <div className="space-y-6">
      <div className="[&>div]:mb-0">
        <StatGrid>
          <StatCard
            label="Menor total"
            tone="success"
            icon={<BadgeDollarSign />}
            value={
              insights.cheapest
                ? formatCents(insights.cheapest.totalCents)
                : "—"
            }
            hint={insights.cheapest?.supplierName ?? "Nenhuma completa"}
          />
          <StatCard
            label="Economia"
            tone="brand"
            icon={<PiggyBank />}
            value={formatCents(insights.savingsCents)}
            hint="Da mais cara para a mais barata"
          />
          <StatCard
            label="Entrega mais rápida"
            tone="info"
            icon={<Truck />}
            value={
              insights.fastest
                ? deliveryLabel(insights.fastest.deliveryDays)
                : "—"
            }
            hint={insights.fastest?.supplierName ?? "Prazo não informado"}
          />
          <StatCard
            label="Cotações completas"
            tone={
              insights.completeCount < quotes.length ? "warning" : "neutral"
            }
            icon={<Scale />}
            value={`${insights.completeCount} de ${quotes.length}`}
            hint={
              insights.completeCount < quotes.length
                ? "Parciais não disputam o menor preço"
                : "Todas com todos os itens"
            }
          />
        </StatGrid>
      </div>

      <MapSection
        title="Fornecedores"
        description="Do menor para o maior total. As parciais (sem todos os itens) ficam por último."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ranked.map(({ quote, rank }) => (
            <QuoteSummaryCard
              key={quote.id}
              quote={quote}
              rank={rank}
              itemCount={request.items.length}
              cheapestCents={insights.cheapest?.totalCents ?? null}
              actions={actions}
              requestStatus={request.status}
            />
          ))}
        </div>
      </MapSection>

      <MapSection
        title="Preço por item"
        description="O menor preço de cada item fica em verde."
      >
        <div className="hidden sm:block">
          <QuoteItemsTable request={request} ranked={ranked} lowest={lowest} />
        </div>
        <div className="sm:hidden">
          <QuoteItemsByItem request={request} ranked={ranked} lowest={lowest} />
        </div>
      </MapSection>
    </div>
  );
}
