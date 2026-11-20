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
import { ParcelDeskActions } from "@/features/parcels/components/ParcelDeskActions";
import { ParcelsList } from "@/features/parcels/components/ParcelsList";
import { ParcelsSummary } from "@/features/parcels/components/ParcelsSummary";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { condominiumsService } from "@/server/services/condominiums.service";
import { parcelsService } from "@/server/services/parcels.service";
import type { ParcelFilter, ParcelStatus } from "@/shared/contracts/parcels";
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

export const metadata: Metadata = { title: "Encomendas" };

const BASE = "/encomendas";
/** The status filter in the address (Portuguese words → API statuses). */
const STATUSES = {
  aguardando: ["RECEIVED"],
  retiradas: ["PICKED_UP"],
  devolvidas: ["RETURNED"],
  canceladas: ["CANCELLED"],
  todas: null,
} as const satisfies Record<string, readonly ParcelStatus[] | null>;
type StatusKey = keyof typeof STATUSES;
const DEFAULT_STATUS: StatusKey = "aguardando";

// The parcels desk (gate or administration): receive what arrives, hand
// over by the resident's code with a signature on the screen, and follow
// every parcel of the condominium, filtered and paged by the API.
export default async function ParcelsDeskPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("PARCELS")) {
    return <ModuleUnavailable name="Encomendas" />;
  }
  if (!can(user, "PARCELS_MANAGE")) return <AccessDenied />;

  const query = await searchParams;
  const [overview, units] = await Promise.all([
    authed((token) => parcelsService.overview(token)),
    authed((token) => condominiumsService.units(token)),
  ]);
  const status =
    oneOf(
      firstParam(query, "situacao"),
      Object.keys(STATUSES) as StatusKey[],
    ) ?? DEFAULT_STATUS;
  const unitId = oneOf(
    firstParam(query, "unidade"),
    overview.units.map((unit) => unit.id),
  );
  const search = firstParam(query, "busca")?.trim().slice(0, 60) || undefined;
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);

  const statuses = STATUSES[status];
  const filter: ParcelFilter = {
    ...(statuses && { statuses: [...statuses] }),
    ...(unitId && { unitId }),
    ...(search && { search }),
  };
  const filtered =
    status !== DEFAULT_STATUS || Boolean(unitId) || Boolean(search);
  const parcels = await authed((token) =>
    parcelsService.list(token, filter, { page, limit: pageSize }),
  );

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      situacao: status === DEFAULT_STATUS ? undefined : status,
      unidade: unitId,
      busca: search,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Encomendas"
        description="Receba as encomendas que chegam e entregue pelo código ou QR do morador, com assinatura na tela."
      />

      <ParcelDeskActions
        units={units.map((unit) => ({ id: unit.id, label: unit.label }))}
      />

      <ParcelsSummary overview={overview} />

      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterField
              label="Busca"
              name="busca"
              defaultValue={search ?? ""}
              placeholder="Destinatário, transportadora, rastreio ou código"
            />
            <FilterCombobox
              label="Unidade"
              name="unidade"
              defaultValue={unitId ?? ""}
              placeholder="Todas"
              options={overview.units.map((unit) => ({
                value: unit.id,
                label: unit.label,
              }))}
            />
            <FilterCombobox
              label="Situação"
              name="situacao"
              defaultValue={status === DEFAULT_STATUS ? "" : status}
              placeholder="Aguardando retirada"
              options={[
                { value: "retiradas", label: "Retiradas" },
                { value: "devolvidas", label: "Devolvidas" },
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
            <ParcelsList parcels={parcels.items} filtered={filtered} />
            <Pagination
              page={parcels.page}
              totalPages={parcels.totalPages}
              total={parcels.total}
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
