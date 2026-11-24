import type { Metadata } from "next";
import {
  Card,
  FilterResults,
  FilterScope,
  PageHeader,
  Pagination,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { DeliveryBoardSummary } from "@/features/purchases/components/DeliveryBoardSummary";
import { DeliveryBoardTable } from "@/features/purchases/components/DeliveryBoardTable";
import { PurchaseBoardFilters } from "@/features/purchases/components/PurchaseBoardFilters";
import { readBoardQuery } from "@/features/purchases/model/board-query";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { purchaseOrdersService } from "@/server/services/purchase-orders.service";
import { canAny } from "@/shared/lib/access";
import { PAGE_SIZES, type RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Recebimentos" };

const BASE = "/compras/recebimentos";
const STAGES = {
  aguardando: ["ORDERED"],
  recebidas: ["RECEIVED", "COMPLETED"],
  todas: null,
} as const;

/**
 * Compras > Recebimentos: the orders placed with the suppliers, waiting for
 * their delivery (by default) or already received. The management, the
 * approvers, the gate and the caretaker record each delivery here, with
 * what came and the invoice; no values are shown.
 */
export default async function DeliveryBoardPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (
    !canAny(user, "PURCHASES_MANAGE", "PURCHASES_APPROVE", "PURCHASES_REQUEST")
  ) {
    return <AccessDenied />;
  }

  const board = readBoardQuery(
    BASE,
    await searchParams,
    STAGES,
    "aguardando",
    null,
  );
  const [overview, rows] = await Promise.all([
    authed((token) => purchaseOrdersService.deliveryOverview(token)),
    authed((token) =>
      purchaseOrdersService.board(token, board.filter, {
        page: board.page,
        limit: board.pageSize,
      }),
    ),
  ]);

  return (
    <>
      <PageHeader
        title="Recebimentos"
        description="Os pedidos feitos aos fornecedores: quando a entrega chegar, registre o que veio de cada item e a nota fiscal."
      />
      <DeliveryBoardSummary overview={overview} />
      <FilterScope>
        <PurchaseBoardFilters
          basePath={BASE}
          filtered={board.filtered}
          pageSize={board.pageSize}
          requests={null}
          values={board.values}
          stagePlaceholder="Aguardando entrega"
          stages={[
            { value: "recebidas", label: "Recebidas" },
            { value: "todas", label: "Todas" },
          ]}
        />
        <FilterResults>
          <Card>
            <DeliveryBoardTable rows={rows.items} filtered={board.filtered} />
            <Pagination
              page={rows.page}
              totalPages={rows.totalPages}
              total={rows.total}
              pageSize={board.pageSize}
              hrefFor={(target) => board.hrefWith({ page: target })}
              pageSizes={PAGE_SIZES}
              pageSizeHref={(size) =>
                board.hrefWith({ "por-pagina": size, page: 1 })
              }
            />
          </Card>
        </FilterResults>
      </FilterScope>
    </>
  );
}
