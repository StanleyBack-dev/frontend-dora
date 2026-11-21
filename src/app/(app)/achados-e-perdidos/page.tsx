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
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { FoundItemDeskActions } from "@/features/lost-and-found/components/FoundItemDeskActions";
import { FoundItemsSummary } from "@/features/lost-and-found/components/FoundItemsSummary";
import { FoundItemsTable } from "@/features/lost-and-found/components/FoundItemsTable";
import { KeptFoundItemsGallery } from "@/features/lost-and-found/components/KeptFoundItemsGallery";
import {
  FOUND_ITEM_CATEGORIES,
  FOUND_ITEM_CATEGORY_LABELS,
} from "@/features/lost-and-found/model/found-item-labels";
import { MyClaimsLink } from "@/features/lost-and-found/components/MyClaimsLink";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { requestTime } from "@/server/request-time";
import { condominiumsService } from "@/server/services/condominiums.service";
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

const asOptions = (values: string[]) =>
  values.map((value) => ({ value, label: value }));

// Lost and found: the desk (gate or administration) gets the condominium's
// items to look after; everyone else browses the items still kept and
// claims what is theirs.
export default async function LostAndFoundPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("LOST_AND_FOUND")) {
    return <ModuleUnavailable name="Achados e perdidos" />;
  }
  const query = await searchParams;
  return can(user, "LOST_FOUND_MANAGE") ? (
    <LostAndFoundDesk query={query} />
  ) : (
    <KeptFoundItems query={query} />
  );
}

// The residents' view: the items still kept, by category, paged by the
// API; each card offers "É meu" or says where their claim stands.
async function KeptFoundItems({ query }: { query: RawSearchParams }) {
  const category = oneOf(firstParam(query, "categoria"), FOUND_ITEM_CATEGORIES);
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);
  const items = await authed((token) =>
    lostAndFoundService.kept(token, category ?? null, {
      page,
      limit: pageSize,
    }),
  );
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      categoria: category,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Achados e perdidos"
        description="O que foi achado no condomínio e está guardado na portaria. Reconheceu algo seu? Toque em “É meu” e retire na portaria com um documento."
      />

      <MyClaimsLink />
      <FilterScope>
        <FilterPanel hasActiveFilters={Boolean(category)}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
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
              hasActiveFilters={Boolean(category)}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>
        <FilterResults>
          <KeptFoundItemsGallery
            items={items.items}
            filtered={Boolean(category)}
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
        </FilterResults>
      </FilterScope>
    </>
  );
}

// The lost and found desk (gate or administration): register what is
// found, check the residents' claims and hand items back with a signature,
// or donate or discard what nobody took. Filtered and paged by the API.
async function LostAndFoundDesk({ query }: { query: RawSearchParams }) {
  const status =
    oneOf(
      firstParam(query, "situacao"),
      Object.keys(STATUSES) as StatusKey[],
    ) ?? DEFAULT_STATUS;
  const category = oneOf(firstParam(query, "categoria"), FOUND_ITEM_CATEGORIES);
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);
  const [overview, units] = await Promise.all([
    authed((token) => lostAndFoundService.overview(token)),
    authed((token) => condominiumsService.units(token)),
  ]);
  // Item, resident and places: one of the values in use.
  const title = oneOf(firstParam(query, "item"), overview.titles);
  const residentId = oneOf(
    firstParam(query, "morador"),
    overview.residents.map((resident) => resident.id),
  );
  const foundLocation = oneOf(
    firstParam(query, "achado-em"),
    overview.foundLocations,
  );
  const storageLocation = oneOf(
    firstParam(query, "guardado-em"),
    overview.storageLocations,
  );

  const statuses = STATUSES[status];
  const filter: FoundItemFilter = {
    ...(statuses && { statuses: [...statuses] }),
    ...(status === "com-pedidos" && { withPendingClaims: true }),
    ...(category && { category }),
    ...(title && { title }),
    ...(residentId && { residentId }),
    ...(foundLocation && { foundLocation }),
    ...(storageLocation && { storageLocation }),
  };
  const filtered =
    status !== DEFAULT_STATUS ||
    [category, title, residentId, foundLocation, storageLocation].some(Boolean);
  // One clock for the whole list (this request's time).
  const now = (await requestTime()).getTime();
  const items = await authed((token) =>
    lostAndFoundService.list(token, filter, { page, limit: pageSize }),
  );

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      situacao: status === DEFAULT_STATUS ? undefined : status,
      categoria: category,
      item: title,
      morador: residentId,
      "achado-em": foundLocation,
      "guardado-em": storageLocation,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Achados e perdidos"
        description="Registre o que foi achado, confira os pedidos dos moradores e devolva com assinatura na tela."
      />

      <FoundItemDeskActions
        units={units.map((unit) => ({ id: unit.id, label: unit.label }))}
      />

      <FoundItemsSummary overview={overview} />

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label="Item"
              name="item"
              defaultValue={title ?? ""}
              placeholder="Todos"
              options={asOptions(overview.titles)}
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
            <FilterCombobox
              label="Morador"
              name="morador"
              defaultValue={residentId ?? ""}
              placeholder="Todos"
              options={overview.residents.map((resident) => ({
                value: resident.id,
                label: resident.name,
              }))}
            />
            <FilterCombobox
              label="Achado em"
              name="achado-em"
              defaultValue={foundLocation ?? ""}
              placeholder="Todos os locais"
              options={asOptions(overview.foundLocations)}
            />
            <FilterCombobox
              label="Guardado em"
              name="guardado-em"
              defaultValue={storageLocation ?? ""}
              placeholder="Todos os locais"
              options={asOptions(overview.storageLocations)}
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
