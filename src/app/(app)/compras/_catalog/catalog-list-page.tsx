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
import { CatalogDeskActions } from "@/features/catalog/components/CatalogDeskActions";
import { CatalogSummary } from "@/features/catalog/components/CatalogSummary";
import { CatalogTable } from "@/features/catalog/components/CatalogTable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { catalogService } from "@/server/services/catalog.service";
import { purchaseRequestsService } from "@/server/services/purchase-requests.service";
import type { CatalogFilter } from "@/shared/contracts/catalog";
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

/** The status filter in the address (Portuguese words → API). */
const STATUSES = { ativos: true, inativos: false, todos: undefined } as const;
type StatusKey = keyof typeof STATUSES;
const DEFAULT_STATUS: StatusKey = "ativos";

const COPY = {
  product: {
    base: "/compras/produtos",
    title: "Produtos",
    description:
      "O catálogo de produtos do condomínio: o que a equipe pede nas solicitações de compra.",
    filter: "Produto",
  },
  brand: {
    base: "/compras/marcas",
    title: "Marcas",
    description:
      "As marcas que os itens das solicitações de compra podem pedir.",
    filter: "Marca",
  },
} as const;

/**
 * Compras > Produtos / Marcas: the catalog shared by the modules, managed
 * here by who manages the purchases. Four cards, the filters (name, status)
 * and the pages are applied by the API.
 */
export async function CatalogListPage({
  kind,
  searchParams,
}: {
  kind: "product" | "brand";
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PURCHASES")) {
    return <ModuleUnavailable name="Compras" />;
  }
  if (!can(user, "PURCHASES_MANAGE")) return <AccessDenied />;

  const copy = COPY[kind];
  const products = kind === "product";
  const query = await searchParams;
  const [options, counts, usage] = await Promise.all([
    authed((token) =>
      products
        ? catalogService.productOptions(token)
        : catalogService.brandOptions(token),
    ),
    authed((token) =>
      products
        ? catalogService.productCounts(token)
        : catalogService.brandCounts(token),
    ),
    authed((token) => purchaseRequestsService.catalogUsage(token)),
  ]);
  const status =
    oneOf(
      firstParam(query, "situacao"),
      Object.keys(STATUSES) as StatusKey[],
    ) ?? DEFAULT_STATUS;
  const id = oneOf(
    firstParam(query, "nome"),
    options.map((option) => option.id),
  );
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);

  const active = STATUSES[status];
  const filter: CatalogFilter = {
    ...(id && { id }),
    ...(active !== undefined && { active }),
  };
  const filtered = status !== DEFAULT_STATUS || Boolean(id);
  const list = await authed((token) =>
    products
      ? catalogService.products(token, filter, { page, limit: pageSize })
      : catalogService.brands(token, filter, { page, limit: pageSize }),
  );

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(copy.base, {
      nome: id,
      situacao: status === DEFAULT_STATUS ? undefined : status,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader title={copy.title} description={copy.description} />

      <CatalogDeskActions kind={kind} />

      <CatalogSummary
        kind={kind}
        counts={counts}
        inUse={products ? usage.productsInUse : usage.brandsInUse}
        top={products ? usage.topProduct : usage.topBrand}
      />

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label={copy.filter}
              name="nome"
              defaultValue={id ?? ""}
              placeholder={products ? "Todos" : "Todas"}
              options={options.map((option) => ({
                value: option.id,
                label: option.name,
              }))}
            />
            <FilterCombobox
              label="Situação"
              name="situacao"
              defaultValue={status === DEFAULT_STATUS ? "" : status}
              placeholder={products ? "Ativos" : "Ativas"}
              options={[
                {
                  value: "inativos",
                  label: products ? "Inativos" : "Inativas",
                },
                { value: "todos", label: products ? "Todos" : "Todas" },
              ]}
            />
            <FilterActions
              clearHref={copy.base}
              hasActiveFilters={filtered}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>

        <FilterResults>
          <Card>
            <CatalogTable kind={kind} rows={list.items} filtered={filtered} />
            <Pagination
              page={list.page}
              totalPages={list.totalPages}
              total={list.total}
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
