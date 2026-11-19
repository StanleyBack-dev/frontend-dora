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
import { DependentsReview } from "@/features/dependents/components/DependentsReview";
import { DependentsSummary } from "@/features/dependents/components/DependentsSummary";
import { RELATIONSHIP_LABELS } from "@/features/dependents/model/dependent-labels";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { dependentsService } from "@/server/services/dependents.service";
import type {
  DependentRelationship,
  DependentReviewFilter,
  DependentStatus,
} from "@/shared/contracts/dependents";
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

export const metadata: Metadata = { title: "Dependentes" };

const BASE = "/gestao/dependentes";
// Without the parameter, only the ones waiting for a decision.
const SITUATIONS = {
  aprovar: { label: "Para aprovar", status: "PENDING" },
  aprovados: { label: "Aprovados", status: "APPROVED" },
  recusados: { label: "Recusados", status: "REJECTED" },
  todos: { label: "Todas", status: undefined },
} as const satisfies Record<
  string,
  { label: string; status: DependentStatus | undefined }
>;
type Situation = keyof typeof SITUATIONS;
const RELATIONSHIPS = Object.keys(
  RELATIONSHIP_LABELS,
) as DependentRelationship[];
const ids = (options: { id: string }[]) => options.map((option) => option.id);
const toOptions = (options: { id: string; label: string }[]) =>
  options.map((option) => ({ value: option.id, label: option.label }));

// The residents' dependents, for the managers to check the documents: the
// numbers on top, the filters (applied by the API) and a page of them.
export default async function DependentsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "USERS_MANAGE")) return <AccessDenied />;

  const query = await searchParams;
  // The numbers and what the filters offer, whatever the filters.
  const overview = await authed((token) =>
    dependentsService.reviewOverview(token),
  );
  const situation =
    oneOf(
      firstParam(query, "situacao"),
      Object.keys(SITUATIONS) as Situation[],
    ) ?? "aprovar";
  const dependentId = oneOf(
    firstParam(query, "dependente"),
    ids(overview.dependents),
  );
  const holderId = oneOf(firstParam(query, "morador"), ids(overview.holders));
  const unitId = oneOf(firstParam(query, "unidade"), ids(overview.units));
  const relationship = oneOf(firstParam(query, "parentesco"), RELATIONSHIPS);
  const page = pageParam(query);
  const pageSize = pageSizeParam(query);

  const status = SITUATIONS[situation].status;
  const filter: DependentReviewFilter = {
    ...(status && { status }),
    ...(dependentId && { dependentId }),
    ...(holderId && { holderId }),
    ...(unitId && { unitId }),
    ...(relationship && { relationship }),
  };
  const filtered =
    situation !== "aprovar" ||
    Boolean(dependentId || holderId || unitId || relationship);
  const dependents = await authed((token) =>
    dependentsService.page(token, filter, { page, limit: pageSize }),
  );

  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(BASE, {
      situacao: situation === "aprovar" ? undefined : situation,
      dependente: dependentId,
      morador: holderId,
      unidade: unitId,
      parentesco: relationship,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  return (
    <>
      <PageHeader
        title="Dependentes"
        description="Quem os moradores cadastraram: confira o documento e aprove ou recuse."
      />
      <DependentsSummary overview={overview} />
      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label="Situação"
              name="situacao"
              defaultValue={situation === "aprovar" ? "" : situation}
              placeholder="Para aprovar"
              options={(["aprovados", "recusados", "todos"] as const).map(
                (key) => ({ value: key, label: SITUATIONS[key].label }),
              )}
            />
            <FilterCombobox
              label="Dependente"
              name="dependente"
              defaultValue={dependentId ?? ""}
              placeholder="Todos"
              options={toOptions(overview.dependents)}
            />
            <FilterCombobox
              label="Morador"
              name="morador"
              defaultValue={holderId ?? ""}
              placeholder="Todos"
              options={toOptions(overview.holders)}
            />
            <FilterCombobox
              label="Unidade"
              name="unidade"
              defaultValue={unitId ?? ""}
              placeholder="Todas"
              options={toOptions(overview.units)}
            />
            <FilterCombobox
              label="Parentesco"
              name="parentesco"
              defaultValue={relationship ?? ""}
              placeholder="Todos"
              options={RELATIONSHIPS.map((value) => ({
                value,
                label: RELATIONSHIP_LABELS[value],
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
            <DependentsReview dependents={dependents.items} />
            <Pagination
              page={dependents.page}
              totalPages={dependents.totalPages}
              total={dependents.total}
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
