import type { Metadata } from "next";
import {
  AutoFilterForm,
  FilterActions,
  FilterCombobox,
  FilterPanel,
  FilterResults,
  FilterScope,
  PageHeader,
  Pagination,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { UnitsManager } from "@/features/condominiums/components/UnitsManager";
import { UnitsSummary } from "@/features/condominiums/components/UnitsSummary";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { condominiumsService } from "@/server/services/condominiums.service";
import type { UnitFilter } from "@/shared/contracts/condominiums";
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

export const metadata: Metadata = { title: "Unidades" };

const BASE = "/gestao/unidades";
const OCCUPANCY = { ocupadas: "OCCUPIED", vazias: "EMPTY" } as const;
const sorted = (values: string[]) =>
  [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR", { numeric: true }),
  );

// The condominium's units (Gestão > Unidades): the numbers on top, the
// filters (unit, block or quadra, street, occupied or empty, applied by the
// API) and a page of units, each opening to the people linked to it.
export default async function UnitsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "UNITS_MANAGE")) return <AccessDenied />;
  const house = user.condominium?.addressFormat === "HOUSE";

  const query = await searchParams;
  // Every unit: the cards and what the filters offer, whatever the filters.
  const all = await authed((token) => condominiumsService.units(token));
  const blocks = sorted(all.map((unit) => unit.block));
  const streets = house ? sorted(all.map((unit) => unit.street)) : [];

  const unitId = oneOf(
    firstParam(query, "unidade"),
    all.map((unit) => unit.id),
  );
  const block = oneOf(firstParam(query, "bloco"), blocks);
  const street = oneOf(firstParam(query, "rua"), streets);
  const occupancy = oneOf(
    firstParam(query, "ocupacao"),
    Object.keys(OCCUPANCY) as (keyof typeof OCCUPANCY)[],
  );
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);

  const filter: UnitFilter = {
    ...(unitId && { unitId }),
    ...(block && { block }),
    ...(street && { street }),
    ...(occupancy && { occupancy: OCCUPANCY[occupancy] }),
  };
  const filtered = Object.keys(filter).length > 0;
  const units = await authed((token) =>
    condominiumsService.unitPage(token, filter, { page, limit: pageSize }),
  );

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      unidade: unitId,
      bloco: block,
      rua: street,
      ocupacao: occupancy,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Unidades"
        description="Os blocos e números (ou ruas, quadras e lotes) do condomínio, com quem mora em cada um."
      />
      {all.length > 0 && <UnitsSummary units={all} house={house} />}
      <FilterScope>
        {all.length > 0 && (
          <FilterPanel hasActiveFilters={filtered}>
            <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pageSize !== DEFAULT_PAGE_SIZE && (
                <input type="hidden" name="por-pagina" value={pageSize} />
              )}
              <FilterCombobox
                label={house ? "Casa" : "Unidade"}
                name="unidade"
                defaultValue={unitId ?? ""}
                placeholder="Todas"
                options={all.map((unit) => ({
                  value: unit.id,
                  label: unit.label,
                }))}
              />
              {house && (
                <FilterCombobox
                  label="Rua"
                  name="rua"
                  defaultValue={street ?? ""}
                  placeholder="Todas"
                  options={streets.map((value) => ({ value, label: value }))}
                />
              )}
              {blocks.length > 0 && (
                <FilterCombobox
                  label={house ? "Quadra" : "Bloco"}
                  name="bloco"
                  defaultValue={block ?? ""}
                  placeholder="Todos"
                  options={blocks.map((value) => ({ value, label: value }))}
                />
              )}
              <FilterCombobox
                label="Ocupação"
                name="ocupacao"
                defaultValue={occupancy ?? ""}
                placeholder="Todas"
                options={[
                  { value: "ocupadas", label: "Com moradores" },
                  { value: "vazias", label: "Sem moradores" },
                ]}
              />
              <FilterActions
                clearHref={BASE}
                hasActiveFilters={filtered}
                autoSubmit
              />
            </AutoFilterForm>
          </FilterPanel>
        )}
        <FilterResults>
          <UnitsManager
            units={units.items}
            total={all.length}
            filtered={filtered}
            editable
            house={house}
            pagination={
              <Pagination
                page={units.page}
                totalPages={units.totalPages}
                total={units.total}
                pageSize={pageSize}
                hrefFor={(target) => hrefWith({ page: target })}
                pageSizes={PAGE_SIZES}
                pageSizeHref={(size) =>
                  hrefWith({ "por-pagina": size, page: 1 })
                }
              />
            }
          />
        </FilterResults>
      </FilterScope>
    </>
  );
}
