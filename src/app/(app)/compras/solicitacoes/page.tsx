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
import { PurchaseRequestDeskActions } from "@/features/purchases/components/PurchaseRequestDeskActions";
import { PurchaseRequestsSummary } from "@/features/purchases/components/PurchaseRequestsSummary";
import { PurchaseRequestsTable } from "@/features/purchases/components/PurchaseRequestsTable";
import {
  CATEGORIES,
  CATEGORY_LABELS,
} from "@/features/catalog/model/categories";
import {
  PENDING_REQUEST_STATUSES,
  PRIORITY_LABELS,
  PURCHASE_PRIORITIES,
  requestCode,
} from "@/features/purchases/model/request-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { purchaseRequestsService } from "@/server/services/purchase-requests.service";
import type {
  PurchaseRequestFilter,
  PurchaseRequestStatus,
} from "@/shared/contracts/purchase-requests";
import { can, canAny } from "@/shared/lib/access";
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

export const metadata: Metadata = { title: "Solicitações de compra" };

const BASE = "/compras/solicitacoes";
/** The status filter in the address (Portuguese words → API statuses). */
// By default only the pending ones (in quotes or waiting for the
// approval); the approved and the others through the filter.
const STATUSES = {
  pendentes: PENDING_REQUEST_STATUSES,
  "aguardando-cotacao": ["OPEN"],
  aprovadas: ["APPROVED"],
  concluidas: ["COMPLETED"],
  reprovadas: ["REJECTED"],
  canceladas: ["CANCELLED"],
  todas: null,
} as const satisfies Record<string, readonly PurchaseRequestStatus[] | null>;
type StatusKey = keyof typeof STATUSES;
const DEFAULT_STATUS: StatusKey = "pendentes";

// Compras > Solicitações: the management sees every purchase request; who
// only asks for purchases (the gate, the caretaker) sees their own (the API
// decides). The filters and the pages are applied by the API.
export default async function PurchaseRequestsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (!canAny(user, "PURCHASES_MANAGE", "PURCHASES_REQUEST")) {
    return <AccessDenied />;
  }
  const desk = can(user, "PURCHASES_MANAGE");

  const query = await searchParams;
  const [options, overview] = await Promise.all([
    authed((token) => purchaseRequestsService.filterOptions(token)),
    authed((token) => purchaseRequestsService.overview(token)),
  ]);
  const status =
    oneOf(
      firstParam(query, "situacao"),
      Object.keys(STATUSES) as StatusKey[],
    ) ?? DEFAULT_STATUS;
  const requestId = oneOf(
    firstParam(query, "solicitacao"),
    options.requests.map((request) => request.id),
  );
  const requestedById = desk
    ? oneOf(
        firstParam(query, "solicitante"),
        options.requesters.map((requester) => requester.id),
      )
    : undefined;
  const category = oneOf(firstParam(query, "categoria"), CATEGORIES);
  const priority = oneOf(firstParam(query, "prioridade"), PURCHASE_PRIORITIES);
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);

  const statuses = STATUSES[status];
  const filter: PurchaseRequestFilter = {
    ...(statuses && { statuses: [...statuses] }),
    ...(requestId && { requestId }),
    ...(requestedById && { requestedById }),
    ...(category && { category }),
    ...(priority && { priority }),
  };
  const filtered =
    status !== DEFAULT_STATUS ||
    [requestId, requestedById, category, priority].some(Boolean);
  const requests = await authed((token) =>
    purchaseRequestsService.list(token, filter, { page, limit: pageSize }),
  );

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      solicitacao: requestId,
      solicitante: requestedById,
      categoria: category,
      prioridade: priority,
      situacao: status === DEFAULT_STATUS ? undefined : status,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title={desk ? "Solicitações de compra" : "Minhas solicitações"}
        description={
          desk
            ? "O que a equipe pediu para comprar ou contratar: confira os itens e siga para as cotações."
            : "Peça o que precisa ser comprado ou contratado e acompanhe cada pedido até a entrega."
        }
      />

      <PurchaseRequestDeskActions />

      <PurchaseRequestsSummary overview={overview} />

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            {desk && (
              <FilterCombobox
                label="Solicitante"
                name="solicitante"
                defaultValue={requestedById ?? ""}
                placeholder="Todos"
                options={options.requesters.map((requester) => ({
                  value: requester.id,
                  label: requester.name,
                }))}
              />
            )}
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
              defaultValue={status === DEFAULT_STATUS ? "" : status}
              placeholder="Pendentes"
              options={[
                { value: "aguardando-cotacao", label: "Aguardando cotação" },
                { value: "aprovadas", label: "Aprovadas" },
                { value: "concluidas", label: "Concluídas" },
                { value: "reprovadas", label: "Reprovadas" },
                { value: "canceladas", label: "Canceladas" },
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
            <PurchaseRequestsTable
              requests={requests.items}
              filtered={filtered}
              viewerId={user.id}
              canManage={desk || can(user, "PURCHASES_APPROVE")}
              openId={requestId}
            />
            <Pagination
              page={requests.page}
              totalPages={requests.totalPages}
              total={requests.total}
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
