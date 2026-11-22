import { Contact, Layers, Truck, Wallet } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import { PURCHASE_CATEGORIES } from "@/features/purchases/model/purchase-labels";
import type { SupplierOverview } from "@/shared/contracts/purchases";

// The condominium's suppliers in numbers, whatever the filters: who is
// ready to quote and who still lacks the data to contact or pay them.
export function SuppliersSummary({ overview }: { overview: SupplierOverview }) {
  return (
    <StatGrid>
      <StatCard
        label="Ativos"
        value={String(overview.active)}
        hint="Aparecem nas novas cotações."
        icon={<Truck className="size-4" />}
        tone="success"
      />
      <StatCard
        label="Categorias atendidas"
        value={`${overview.categoriesServed} de ${PURCHASE_CATEGORIES.length}`}
        hint="Por ao menos um fornecedor ativo."
        icon={<Layers className="size-4" />}
        tone="brand"
      />
      <StatCard
        label="Sem PIX"
        value={String(overview.activeWithoutPix)}
        hint="Ativos sem chave PIX para pagamento."
        icon={<Wallet className="size-4" />}
        tone={overview.activeWithoutPix > 0 ? "warning" : "neutral"}
      />
      <StatCard
        label="Sem contato"
        value={String(overview.activeWithoutContact)}
        hint="Ativos sem telefone nem e-mail."
        icon={<Contact className="size-4" />}
        tone={overview.activeWithoutContact > 0 ? "danger" : "neutral"}
      />
    </StatGrid>
  );
}
