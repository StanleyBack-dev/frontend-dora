import type { Metadata } from "next";
import {
  AutoFilterForm,
  Card,
  FilterActions,
  FilterCombobox,
  FilterField,
  FilterPanel,
  FilterResults,
  FilterScope,
  PageHeader,
  Pagination,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { FoundItemDeskActions } from "@/features/lost-and-found/components/FoundItemDeskActions";
import { FoundItemsSummary } from "@/features/lost-and-found/components/FoundItemsSummary";
import { FoundItemsTable } from "@/features/lost-and-found/components/FoundItemsTable";
import {
  FOUND_ITEM_CATEGORIES,
  FOUND_ITEM_CATEGORY_LABELS,
} from "@/features/lost-and-found/model/found-item-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { requestTime } from "@/server/request-time";
import { lostAndFoundService } from "@/server/services/lost-and-found.service";
import type {
  FoundItemFilter,
  FoundItemStatus,
} from "@/shared/contracts/lost-and-found";
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

export const metadata: Metadata = { title: "Achados e perdidos" };

const BASE = "/achados-e-perdidos";
/** The status filter in the address (Portuguese words → API statuses). */
const STATUSES = {
  guardados: ["FOUND"],
  "com-pedidos": ["FOUND"],
  devolvidos: ["RETURNED"],
  doados: ["DONATED"],
  descartados: ["DISCARDED"],
  todos: null,
} as const satisfies Record<string, readonly FoundItemStatus[] | null>;
type StatusKey = keyof typeof STATUSES;
const DEFAULT_STATUS: StatusKey = "guardados";

// The lost and found desk (gate or administration): register what is
// found, check the residents' claims and hand items back with a signature,
// or donate or discard what nobody took. Filtered and paged by the API.
export default async function LostAndFoundDeskPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("LOST_AND_FOUND")) {
    return <ModuleUnavailable name="Achados e perdidos" />;
  }
  if (!can(user, "LOST_FOUND_MANAGE")) return <AccessDenied />;

  const query = await searchParams;
  const status =
    oneOf(
      firstParam(query, "situacao"),
      Object.keys(STATUSES) as StatusKey[],
    ) ?? DEFAULT_STATUS;
  const category = oneOf(firstParam(query, "categoria"), FOUND_ITEM_CATEGORIES);
  const search = firstParam(query, "busca")?.trim().slice(0, 80) ?? "";
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);

  const statuses = STATUSES[status];
  const filter: FoundItemFilter = {
    ...(statuses && { statuses: [...statuses] }),
    ...(status === "com-pedidos" && { withPendingClaims: true }),
    ...(category && { category }),
    ...(search && { search }),
  };
  const filtered =
    status !== DEFAULT_STATUS || Boolean(category) || Boolean(search);
  // One clock for the whole list (this request's time).
  const now = (await requestTime()).getTime();
  const [overview, items] = await Promise.all([
    authed((token) => lostAndFoundService.overview(token)),
    authed((token) =>
      lostAndFoundService.list(token, filter, { page, limit: pageSize }),
    ),
  ]);

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      situacao: status === DEFAULT_STATUS ? undefined : status,
      categoria: category,
      busca: search || undefined,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Achados e perdidos"
        description="Registre o que foi achado, confira os pedidos dos moradores e devolva com assinatura na tela."
        actions={<FoundItemDeskActions />}
      />

      <FoundItemsSummary overview={overview} />

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterField
              label="Buscar"
              name="busca"
              defaultValue={search}
              placeholder="O que é, descrição ou local"
            />
            <FilterCombobox
              label="Situação"
              name="situacao"
              defaultValue={status === DEFAULT_STATUS ? "" : status}
              placeholder="Guardados"
              options={[
                { value: "com-pedidos", label: "Com pedidos aguardando" },
                { value: "devolvidos", label: "Devolvidos" },
                { value: "doados", label: "Doados" },
                { value: "descartados", label: "Descartados" },
                { value: "todos", label: "Todos" },
              ]}
            />
            <FilterCombobox
              label="Categoria"
              name="categoria"
              defaultValue={category ?? ""}
              placeholder="Todas"
              options={FOUND_ITEM_CATEGORIES.map((value) => ({
                value,
                label: FOUND_ITEM_CATEGORY_LABELS[value],
              }))}
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
            <FoundItemsTable
              items={items.items}
              filtered={filtered}
              now={now}
            />
            <Pagination
              page={items.page}
              totalPages={items.totalPages}
              total={items.total}
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
