import { CircleCheck, PowerOff, Star, TrendingUp } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { CatalogCounts } from "@/shared/contracts/catalog";

// The catalog's products (or brands) in numbers, whatever the filters (four
// cards, one row on desktop): active, used by the purchase requests, the
// most asked for and inactive.
export function CatalogSummary({
  kind,
  counts,
  inUse,
  top,
}: {
  kind: "product" | "brand";
  counts: CatalogCounts;
  /** How many are in at least one purchase request. */
  inUse: number;
  /** The one in most purchase requests (null: none yet). */
  top: { name: string; requestCount: number } | null;
}) {
  const products = kind === "product";
  return (
    <StatGrid>
      <StatCard
        label={products ? "Produtos ativos" : "Marcas ativas"}
        value={String(counts.active)}
        hint="Aparecem nos itens das solicitações."
        icon={<CircleCheck className="size-4" />}
        tone="success"
      />
      <StatCard
        label="Usados em solicitações"
        value={String(inUse)}
        hint={
          products
            ? "Produtos pedidos ao menos uma vez."
            : "Marcas pedidas ao menos uma vez."
        }
        icon={<TrendingUp className="size-4" />}
        tone="info"
      />
      <StatCard
        label={products ? "Mais pedido" : "Mais pedida"}
        value={top?.name ?? "—"}
        hint={
          top
            ? `Em ${top.requestCount} ${top.requestCount === 1 ? "solicitação" : "solicitações"}.`
            : "Ainda sem solicitações."
        }
        icon={<Star className="size-4" />}
        tone="brand"
      />
      <StatCard
        label={products ? "Inativos" : "Inativas"}
        value={String(counts.inactive)}
        hint="Fora dos novos itens; o histórico fica."
        icon={<PowerOff className="size-4" />}
        tone="neutral"
      />
    </StatGrid>
  );
}
