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
import { SupplierDeskActions } from "@/features/suppliers/components/SupplierDeskActions";
import { SuppliersSummary } from "@/features/suppliers/components/SuppliersSummary";
import { SuppliersTable } from "@/features/suppliers/components/SuppliersTable";
import {
  CATEGORIES,
  CATEGORY_LABELS,
} from "@/features/catalog/model/categories";
import { maskSupplierDocument } from "@/features/suppliers/model/supplier-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { suppliersService } from "@/server/services/suppliers.service";
import type { SupplierFilter } from "@/shared/contracts/suppliers";
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

export const metadata: Metadata = { title: "Fornecedores" };

const BASE = "/compras/fornecedores";
/** The status filter in the address (Portuguese words → API). */
const STATUSES = { ativos: true, inativos: false, todos: undefined } as const;
type StatusKey = keyof typeof STATUSES;
const DEFAULT_STATUS: StatusKey = "ativos";

// Compras > Fornecedores: who the condominium buys from. The filters
// (name, contact, CNPJ/CPF, category, status; the options come from the
// values in use) and the pages are applied by the API.
export default async function SuppliersPage({
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
  const status =
    oneOf(
      firstParam(query, "situacao"),
      Object.keys(STATUSES) as StatusKey[],
    ) ?? DEFAULT_STATUS;
  const category = oneOf(firstParam(query, "categoria"), CATEGORIES);
  const [options, overview] = await Promise.all([
    authed((token) => suppliersService.supplierFilterOptions(token)),
    authed((token) => suppliersService.supplierOverview(token)),
  ]);
  // Name, contact and document: one of the values in use.
  const supplierId = oneOf(
    firstParam(query, "fornecedor"),
    options.suppliers.map((supplier) => supplier.id),
  );
  const contactName = oneOf(firstParam(query, "contato"), options.contacts);
  const document = oneOf(
    firstParam(query, "documento"),
    options.documents.map((item) => item.document),
  );
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);

  const active = STATUSES[status];
  const filter: SupplierFilter = {
    ...(supplierId && { supplierId }),
    ...(contactName && { contactName }),
    ...(document && { document }),
    ...(category && { category }),
    ...(active !== undefined && { active }),
  };
  const filtered =
    status !== DEFAULT_STATUS ||
    [supplierId, contactName, document, category].some(Boolean);
  const suppliers = await authed((token) =>
    suppliersService.suppliers(token, filter, { page, limit: pageSize }),
  );

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      fornecedor: supplierId,
      contato: contactName,
      documento: document,
      categoria: category,
      situacao: status === DEFAULT_STATUS ? undefined : status,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Fornecedores"
        description="Quem o condomínio contrata ou de quem compra, com o que atende, o contato e o PIX para pagamento."
      />

      <SupplierDeskActions />

      <SuppliersSummary overview={overview} />

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label="Nome"
              name="fornecedor"
              defaultValue={supplierId ?? ""}
              placeholder="Todos"
              options={options.suppliers.map((supplier) => ({
                value: supplier.id,
                label: supplier.name,
              }))}
            />
            <FilterCombobox
              label="Contato"
              name="contato"
              defaultValue={contactName ?? ""}
              placeholder="Todos"
              options={options.contacts.map((value) => ({
                value,
                label: value,
              }))}
            />
            <FilterCombobox
              label="CNPJ/CPF"
              name="documento"
              defaultValue={document ?? ""}
              placeholder="Todos"
              options={options.documents.map((item) => ({
                value: item.document,
                label: maskSupplierDocument(item.documentType, item.document),
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
              label="Situação"
              name="situacao"
              defaultValue={status === DEFAULT_STATUS ? "" : status}
              placeholder="Ativos"
              options={[
                { value: "inativos", label: "Inativos" },
                { value: "todos", label: "Todos" },
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
            <SuppliersTable suppliers={suppliers.items} filtered={filtered} />
            <Pagination
              page={suppliers.page}
              totalPages={suppliers.totalPages}
              total={suppliers.total}
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
