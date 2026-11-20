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
import { ParcelDeskActions } from "@/features/parcels/components/ParcelDeskActions";
import { ParcelsList } from "@/features/parcels/components/ParcelsList";
import { ParcelsSummary } from "@/features/parcels/components/ParcelsSummary";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { condominiumsService } from "@/server/services/condominiums.service";
import { requestTime } from "@/server/request-time";
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
  pereciveis: ["RECEIVED"],
  retiradas: ["PICKED_UP"],
  devolvidas: ["RETURNED"],
  canceladas: ["CANCELLED"],
  todas: null,
} as const satisfies Record<string, readonly ParcelStatus[] | null>;
type StatusKey = keyof typeof STATUSES;
const DEFAULT_STATUS: StatusKey = "aguardando";

const asOptions = (values: string[]) =>
  values.map((value) => ({ value, label: value }));

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
  // Recipient, carrier and tracking code: one of the values in use.
  const recipientName = oneOf(
    firstParam(query, "destinatario"),
    overview.recipientNames,
  );
  const carrier = oneOf(firstParam(query, "transportadora"), overview.carriers);
  const trackingCode = oneOf(
    firstParam(query, "rastreio"),
    overview.trackingCodes,
  );
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);

  const statuses = STATUSES[status];
  const filter: ParcelFilter = {
    ...(statuses && { statuses: [...statuses] }),
    ...(status === "pereciveis" && { perishable: true }),
    ...(unitId && { unitId }),
    ...(recipientName && { recipientName }),
    ...(carrier && { carrier }),
    ...(trackingCode && { trackingCode }),
  };
  const filtered =
    status !== DEFAULT_STATUS ||
    [unitId, recipientName, carrier, trackingCode].some(Boolean);
  // One clock for the whole list (this request's time).
  const now = (await requestTime()).getTime();
  const parcels = await authed((token) =>
    parcelsService.list(token, filter, { page, limit: pageSize }),
  );

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      situacao: status === DEFAULT_STATUS ? undefined : status,
      unidade: unitId,
      destinatario: recipientName,
      transportadora: carrier,
      rastreio: trackingCode,
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
                { value: "pereciveis", label: "Perecíveis aguardando" },
                { value: "retiradas", label: "Retiradas" },
                { value: "devolvidas", label: "Devolvidas" },
                { value: "canceladas", label: "Canceladas" },
                { value: "todas", label: "Todas" },
              ]}
            />
            <FilterCombobox
              label="Destinatário"
              name="destinatario"
              defaultValue={recipientName ?? ""}
              placeholder="Todos"
              options={asOptions(overview.recipientNames)}
            />
            <FilterCombobox
              label="Transportadora"
              name="transportadora"
              defaultValue={carrier ?? ""}
              placeholder="Todas"
              options={asOptions(overview.carriers)}
            />
            <FilterCombobox
              label="Código de rastreio"
              name="rastreio"
              defaultValue={trackingCode ?? ""}
              placeholder="Todos"
              options={asOptions(overview.trackingCodes)}
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
            <ParcelsList
              parcels={parcels.items}
              filtered={filtered}
              now={now}
            />
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
