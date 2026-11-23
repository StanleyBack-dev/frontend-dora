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
import { OrderBoardSummary } from "@/features/purchases/components/OrderBoardSummary";
import { OrderBoardTable } from "@/features/purchases/components/OrderBoardTable";
import { PurchaseBoardFilters } from "@/features/purchases/components/PurchaseBoardFilters";
import { readBoardQuery } from "@/features/purchases/model/board-query";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { purchaseOrdersService } from "@/server/services/purchase-orders.service";
import { purchaseRequestsService } from "@/server/services/purchase-requests.service";
import { can, canAny } from "@/shared/lib/access";
import { PAGE_SIZES, type RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Pedidos" };

const BASE = "/compras/pedidos";
const STAGES = {
  andamento: ["APPROVED", "ORDERED", "RECEIVED"],
  "a-fazer": ["APPROVED"],
  "aguardando-entrega": ["ORDERED"],
  recebidas: ["RECEIVED"],
  concluidas: ["COMPLETED"],
  todas: null,
} as const;

/**
 * Compras > Pedidos (the management and the approvers): the approved
 * purchases, from the order to the payment, the ones still going by
 * default. The deliveries and the payments of every order have their own
 * pages (Recebimentos, Pagamentos).
 */
export default async function OrderBoardPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (!canAny(user, "PURCHASES_MANAGE", "PURCHASES_APPROVE")) {
    return <AccessDenied />;
  }

  const options = await authed((token) =>
    purchaseRequestsService.filterOptions(token),
  );
  const board = readBoardQuery(
    BASE,
    await searchParams,
    STAGES,
    "andamento",
    options.requests.map((request) => request.id),
  );
  const [overview, rows] = await Promise.all([
    authed((token) => purchaseOrdersService.overview(token)),
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
        title="Pedidos"
        description="As compras aprovadas, do pedido ao pagamento: faça o pedido ao fornecedor e acompanhe a entrega e o pagamento."
      />
      <OrderBoardSummary overview={overview} />
      <FilterScope>
        <PurchaseBoardFilters
          basePath={BASE}
          filtered={board.filtered}
          pageSize={board.pageSize}
          requests={options.requests}
          values={board.values}
          stagePlaceholder="Em andamento"
          stages={[
            { value: "a-fazer", label: "Pedido a fazer" },
            { value: "aguardando-entrega", label: "Aguardando entrega" },
            { value: "recebidas", label: "Recebidas (a pagar)" },
            { value: "concluidas", label: "Concluídas" },
            { value: "todas", label: "Todas" },
          ]}
        />
        <FilterResults>
          <Card>
            <OrderBoardTable
              rows={rows.items}
              filtered={board.filtered}
              canManage={can(user, "PURCHASES_MANAGE")}
            />
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
