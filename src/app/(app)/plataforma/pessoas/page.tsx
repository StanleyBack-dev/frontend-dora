import type { Metadata } from "next";
import { UsersRound } from "lucide-react";
import {
  AutoFilterForm,
  BackLink,
  Card,
  EmptyState,
  FilterActions,
  FilterCombobox,
  FilterField,
  FilterPanel,
  FilterResults,
  FilterScope,
  PageHeader,
  Pagination,
} from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { PeopleTable } from "@/features/platform/components/PeopleTable";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { canRunPlatform } from "@/shared/lib/access";
import { requestTime } from "@/server/request-time";
import { condominiumsService } from "@/server/services/condominiums.service";
import { platformService } from "@/server/services/platform.service";
import type { UserGroup } from "@/shared/graphql/schema-enums";
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

export const metadata: Metadata = { title: "Pessoas" };

const ROLES = ["ADMIN_MASTER", "ADMIN", "CONCIERGE", "USER"] as const;
/** The ids the API accepts (v4). */
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Everyone with an account on Dora (Plataforma, Pessoas): by name, e-mail
// or user name, by role or condominium, with where each one has access.
export default async function PlatformPeoplePage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  // Next renders the page alongside its layout: it checks again.
  if (!canRunPlatform(await getSessionUser())) return <AccessDenied />;
  const params = await searchParams;
  const search = firstParam(params, "busca")?.slice(0, 80) ?? "";
  const role: UserGroup | undefined = oneOf(firstParam(params, "papel"), ROLES);
  const condominiumParam = firstParam(params, "condominio") ?? "";
  const condominiumId = UUID.test(condominiumParam)
    ? condominiumParam
    : undefined;
  const page = pageParam(params);
  const pageSize = pageSizeParam(params);
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref("/plataforma/pessoas", {
      busca: search,
      papel: role,
      condominio: condominiumId,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });

  const [people, condominiums] = await authed((token) =>
    Promise.all([
      platformService.people(
        token,
        { search, role, condominiumId },
        { page, limit: pageSize },
      ),
      condominiumsService.list(token),
    ]),
  );
  const now = (await requestTime()).getTime();
  const filtered = Boolean(search || role || condominiumId);

  return (
    <>
      <BackLink href="/plataforma" label="Administração" />
      <PageHeader
        title="Pessoas"
        description={`Todas as contas do Dora: ${people.total} ${people.total === 1 ? "pessoa" : "pessoas"}${filtered ? " com estes filtros" : ""}, e onde cada uma tem acesso.`}
      />
      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterField
              label="Buscar"
              name="busca"
              defaultValue={search}
              placeholder="Nome, e-mail ou usuário"
            />
            <FilterCombobox
              label="Papel"
              name="papel"
              defaultValue={role ?? ""}
              placeholder="Todos"
              options={ROLES.map((value) => ({
                value,
                label:
                  value === "ADMIN_MASTER"
                    ? "Administração da plataforma"
                    : GROUP_LABELS[value],
              }))}
            />
            <FilterCombobox
              label="Condomínio"
              name="condominio"
              defaultValue={condominiumId ?? ""}
              placeholder="Todos"
              options={condominiums.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
            <FilterActions
              clearHref="/plataforma/pessoas"
              hasActiveFilters={filtered}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>
        <FilterResults>
          <Card>
            {people.items.length === 0 ? (
              <EmptyState
                icon={<UsersRound className="size-5" />}
                title="Ninguém encontrado"
                description="Tente outro nome, papel ou condomínio."
              />
            ) : (
              <PeopleTable people={people.items} now={now} />
            )}
            <Pagination
              page={people.page}
              totalPages={people.totalPages}
              total={people.total}
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
