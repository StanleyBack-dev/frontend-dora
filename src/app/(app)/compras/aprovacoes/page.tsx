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
import { ApprovalBoardSummary } from "@/features/purchases/components/ApprovalBoardSummary";
import { ApprovalBoardTable } from "@/features/purchases/components/ApprovalBoardTable";
import { ApprovalSettingsCard } from "@/features/purchases/components/ApprovalSettingsCard";
import { PurchaseBoardFilters } from "@/features/purchases/components/PurchaseBoardFilters";
import { readBoardQuery } from "@/features/purchases/model/board-query";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { purchaseApprovalsService } from "@/server/services/purchase-approvals.service";
import { purchaseRequestsService } from "@/server/services/purchase-requests.service";
import { can } from "@/shared/lib/access";
import { PAGE_SIZES, type RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Aprovações" };

const BASE = "/compras/aprovacoes";
const STAGES = {
  aguardando: ["AWAITING_APPROVAL"],
  aprovadas: ["APPROVED", "ORDERED", "RECEIVED", "COMPLETED"],
  reprovadas: ["REJECTED"],
  todas: null,
} as const;

/**
 * Compras > Aprovações (whoever approves the purchases): the rule (the
 * alçada, changed here), the numbers, and the purchases waiting for a
 * decision (by default), approved or rejected; each opens its approval
 * page, where the decision is made.
 */
export default async function ApprovalBoardPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (!can(user, "PURCHASES_APPROVE")) return <AccessDenied />;

  const [options, overview, settings] = await Promise.all([
    authed((token) => purchaseRequestsService.filterOptions(token)),
    authed((token) => purchaseApprovalsService.overview(token)),
    authed((token) => purchaseApprovalsService.settings(token)),
  ]);
  const board = readBoardQuery(
    BASE,
    await searchParams,
    STAGES,
    "aguardando",
    options.requests.map((request) => request.id),
  );
  const rows = await authed((token) =>
    purchaseApprovalsService.board(token, board.filter, {
      page: board.page,
      limit: board.pageSize,
    }),
  );

  return (
    <>
      <PageHeader
        title="Aprovações"
        description="As compras com cotação escolhida: decida as que aguardam aprovação e consulte as aprovadas e reprovadas."
      />

      <ApprovalSettingsCard settings={settings} canEdit />
      <ApprovalBoardSummary overview={overview} />

      <FilterScope>
        <PurchaseBoardFilters
          basePath={BASE}
          filtered={board.filtered}
          pageSize={board.pageSize}
          requests={options.requests}
          values={board.values}
          stagePlaceholder="Aguardando aprovação"
          stages={[
            { value: "aprovadas", label: "Aprovadas" },
            { value: "reprovadas", label: "Reprovadas" },
            { value: "todas", label: "Todas" },
          ]}
        />
        <FilterResults>
          <Card>
            <ApprovalBoardTable rows={rows.items} filtered={board.filtered} />
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
