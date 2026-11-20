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
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { ResidentsDirectoryTable } from "@/features/residents/components/ResidentsDirectoryTable";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { condominiumsService } from "@/server/services/condominiums.service";
import { residentsService } from "@/server/services/residents.service";
import type { ResidentsFilter } from "@/shared/contracts/residents";
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

export const metadata: Metadata = { title: "Moradores" };

const BASE = "/moradores";

// The residents' directory for the gate (RESIDENTS_READ), read only: who
// lives where, how to reach them and their approved dependents, filtered
// and paged by the API. E-mail, documents and birth dates stay with the
// management (Gestão > Moradores).
export default async function ResidentsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!can(user, "RESIDENTS_READ")) return <AccessDenied />;

  const query = await searchParams;
  const [names, units] = await Promise.all([
    authed((token) => residentsService.names(token)),
    authed((token) => condominiumsService.units(token)),
  ]);
  const userId = oneOf(
    firstParam(query, "morador"),
    names.map((item) => item.id),
  );
  const unitId = oneOf(
    firstParam(query, "unidade"),
    units.map((unit) => unit.id),
  );
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);
  const filter: ResidentsFilter = {
    ...(userId && { userId }),
    ...(unitId && { unitId }),
  };
  const filtered = Boolean(userId || unitId);
  const residents = await authed((token) =>
    residentsService.list(token, filter, { page, limit: pageSize }),
  );

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      morador: userId,
      unidade: unitId,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Moradores"
        description="Quem mora em cada unidade, o telefone para contato e os dependentes aprovados. Somente consulta."
      />

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label="Morador"
              name="morador"
              defaultValue={userId ?? ""}
              placeholder="Todos"
              options={names.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
            <FilterCombobox
              label="Unidade"
              name="unidade"
              defaultValue={unitId ?? ""}
              placeholder="Todas"
              options={units.map((unit) => ({
                value: unit.id,
                label: unit.label,
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
            <ResidentsDirectoryTable
              residents={residents.items}
              filtered={filtered}
            />
            <Pagination
              page={residents.page}
              totalPages={residents.totalPages}
              total={residents.total}
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
