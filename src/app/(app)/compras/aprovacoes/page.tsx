import type { Metadata } from "next";
import {
  AutoFilterForm,
  Card,
  FilterActions,
  FilterCombobox,
  FilterPanel,
  FilterResults,
  FilterScope,
  PageHeader,
  Pagination,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import {
  CATEGORIES,
  CATEGORY_LABELS,
} from "@/features/catalog/model/categories";
import { ApprovalBoardSummary } from "@/features/purchases/components/ApprovalBoardSummary";
import { ApprovalBoardTable } from "@/features/purchases/components/ApprovalBoardTable";
import { ApprovalSettingsCard } from "@/features/purchases/components/ApprovalSettingsCard";
import {
  PRIORITY_LABELS,
  PURCHASE_PRIORITIES,
  requestCode,
} from "@/features/purchases/model/request-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { purchaseApprovalsService } from "@/server/services/purchase-approvals.service";
import { purchaseRequestsService } from "@/server/services/purchase-requests.service";
import type {
  PurchaseRequestFilter,
  PurchaseRequestStatus,
} from "@/shared/contracts/purchase-requests";
import { can } from "@/shared/lib/access";
import {
  buildHref,
  DEFAULT_PAGE_SIZE,
  firstParam,
  oneOf,
  PAGE_SIZES,
  pageParam,
  pageSizeParam,
  pageSizeQuery,
  type RawSearchParams,
} from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Aprovações" };

const BASE = "/compras/aprovacoes";
/** The stage filter in the address (Portuguese words → API statuses). */
const STAGES = {
  aguardando: ["AWAITING_APPROVAL"],
  aprovadas: ["APPROVED"],
  reprovadas: ["REJECTED"],
  todas: null,
} as const satisfies Record<string, readonly PurchaseRequestStatus[] | null>;
type StageKey = keyof typeof STAGES;
const DEFAULT_STAGE: StageKey = "aguardando";

// Compras > Aprovações (whoever approves the purchases): the rule (the
// alçada, changed here), the numbers, and the purchases waiting for a
// decision (by default), approved or rejected; each opens its quote page,
// where the decision is made. The filters and pages are the API's.
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

  const query = await searchParams;
  const [options, overview, settings] = await Promise.all([
    authed((token) => purchaseRequestsService.filterOptions(token)),
    authed((token) => purchaseApprovalsService.overview(token)),
    authed((token) => purchaseApprovalsService.settings(token)),
  ]);
  const stage =
    oneOf(firstParam(query, "situacao"), Object.keys(STAGES) as StageKey[]) ??
    DEFAULT_STAGE;
  const requestId = oneOf(
    firstParam(query, "solicitacao"),
    options.requests.map((request) => request.id),
  );
  const category = oneOf(firstParam(query, "categoria"), CATEGORIES);
  const priority = oneOf(firstParam(query, "prioridade"), PURCHASE_PRIORITIES);
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);

  const statuses = STAGES[stage];
  const filter: PurchaseRequestFilter = {
    ...(statuses && { statuses: [...statuses] }),
    ...(requestId && { requestId }),
    ...(category && { category }),
    ...(priority && { priority }),
  };
  const filtered =
    stage !== DEFAULT_STAGE || [requestId, category, priority].some(Boolean);
  const board = await authed((token) =>
    purchaseApprovalsService.board(token, filter, { page, limit: pageSize }),
  );

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      solicitacao: requestId,
      categoria: category,
      prioridade: priority,
      situacao: stage === DEFAULT_STAGE ? undefined : stage,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Aprovações"
        description="As compras com cotação escolhida: decida as que aguardam aprovação e consulte as aprovadas e reprovadas."
      />

      <ApprovalSettingsCard settings={settings} canEdit />
      <ApprovalBoardSummary overview={overview} />

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label="Solicitação"
              name="solicitacao"
              defaultValue={requestId ?? ""}
              placeholder="Todas"
              options={options.requests.map((request) => ({
                value: request.id,
                label: `${requestCode(request.number)} · ${request.title}`,
              }))}
            />
            <FilterCombobox
              label="Categoria"
              name="categoria"
              defaultValue={category ?? ""}
              placeholder="Todas"
              options={CATEGORIES.map((value) => ({
                value,
                label: CATEGORY_LABELS[value],
              }))}
            />
            <FilterCombobox
              label="Prioridade"
              name="prioridade"
              defaultValue={priority ?? ""}
              placeholder="Todas"
              options={PURCHASE_PRIORITIES.map((value) => ({
                value,
                label: PRIORITY_LABELS[value],
              }))}
            />
            <FilterCombobox
              label="Situação"
              name="situacao"
              defaultValue={stage === DEFAULT_STAGE ? "" : stage}
              placeholder="Aguardando aprovação"
              options={[
                { value: "aprovadas", label: "Aprovadas" },
                { value: "reprovadas", label: "Reprovadas" },
                { value: "todas", label: "Todas" },
              ]}
            />
            <FilterActions
              clearHref={BASE}
              hasActiveFilters={filtered}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>

        <FilterResults>
          <Card>
            <ApprovalBoardTable rows={board.items} filtered={filtered} />
            <Pagination
              page={board.page}
              totalPages={board.totalPages}
              total={board.total}
              pageSize={pageSize}
              hrefFor={(target) => hrefWith({ page: target })}
              pageSizes={PAGE_SIZES}
              pageSizeHref={(size) => hrefWith({ "por-pagina": size, page: 1 })}
            />
          </Card>
        </FilterResults>
      </FilterScope>
    </>
  );
}
