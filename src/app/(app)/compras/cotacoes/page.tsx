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
import { QuoteBoardSummary } from "@/features/purchases/components/QuoteBoardSummary";
import { QuoteBoardTable } from "@/features/purchases/components/QuoteBoardTable";
import {
  PRIORITY_LABELS,
  PURCHASE_PRIORITIES,
  requestCode,
} from "@/features/purchases/model/request-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { purchaseQuotesService } from "@/server/services/purchase-quotes.service";
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

export const metadata: Metadata = { title: "Cotações" };

const BASE = "/compras/cotacoes";
/** The stage filter in the address (Portuguese words → API statuses). */
// By default only the pending ones; the approved and rejected through the
// filter, so they don't crowd what still needs work.
const STAGES = {
  pendentes: ["OPEN", "QUOTING", "AWAITING_APPROVAL"],
  todas: null,
  "aguardando-cotacao": ["OPEN"],
  "em-cotacao": ["QUOTING"],
  "aguardando-aprovacao": ["AWAITING_APPROVAL"],
  aprovadas: ["APPROVED"],
  reprovadas: ["REJECTED"],
} as const satisfies Record<string, readonly PurchaseRequestStatus[] | null>;
type StageKey = keyof typeof STAGES;
const DEFAULT_STAGE: StageKey = "pendentes";

// Compras > Cotações (management): the requests waiting for quotes, in
// quotes or waiting for the approval, with how their quotes stand; each
// opens the request's comparison map. The filters and pages are the API's.
export default async function QuoteBoardPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (!can(user, "PURCHASES_MANAGE")) return <AccessDenied />;

  const query = await searchParams;
  const [options, overview] = await Promise.all([
    authed((token) => purchaseRequestsService.filterOptions(token)),
    authed((token) => purchaseQuotesService.boardOverview(token)),
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
    purchaseQuotesService.board(token, filter, { page, limit: pageSize }),
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
        title="Cotações"
        description="As solicitações em cotação e as já decididas: quantas cotações cada uma tem, a mais barata, a escolhida e a situação. Abra uma para ver o mapa de cotação."
      />

      <QuoteBoardSummary overview={overview} />

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
              placeholder="Pendentes"
              options={[
                { value: "aguardando-cotacao", label: "Aguardando cotação" },
                { value: "em-cotacao", label: "Em cotação" },
                {
                  value: "aguardando-aprovacao",
                  label: "Aguardando aprovação",
                },
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
            <QuoteBoardTable rows={board.items} filtered={filtered} />
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
