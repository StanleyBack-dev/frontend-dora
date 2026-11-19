import { Users } from "lucide-react";
import {
  AutoFilterForm,
  Card,
  EmptyState,
  FilterActions,
  FilterCombobox,
  FilterPanel,
  FilterResults,
  FilterScope,
  PageHeader,
  Pagination,
} from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { CreateUserButton } from "@/features/admin/components/CreateUserButton";
import { MembersList } from "@/features/admin/components/MembersList";
import { MembersSummary } from "@/features/admin/components/MembersSummary";
import { rolesFor } from "@/features/admin/model/member-kind";
import type {
  MemberFilterOption,
  MemberKind,
  MemberStats,
  Paginated,
  SessionUser,
  UserAccount,
  UserGroup,
} from "@/shared/contracts/api";
import type { Unit } from "@/shared/contracts/condominiums";
import { assignableGroups } from "@/shared/lib/access";
import { formatPhone } from "@/shared/lib/masks";
import {
  buildHref,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  pageSizeQuery,
} from "@/shared/lib/search-params";

export type MembersDirectoryConfig = {
  /** "/gestao/moradores" or "/gestao/equipe": filters and links stay on this page. */
  basePath: string;
  title: string;
  description: string;
  /** Residents (Moradores) or employees (Equipe). */
  kind: MemberKind;
  /** The roles of that tie (the role filter). */
  roles: readonly UserGroup[];
  /** Units matter for residents only (filter by unit). */
  unitFilter: boolean;
  emptyTitle: string;
  emptyDescription: string;
};

export type MembersDirectoryData = {
  users: Paginated<UserAccount>;
  units: Pick<Unit, "id" | "label">[];
  /** Every member of the tie: the name, e-mail and phone options. */
  people: MemberFilterOption[];
  /** The page's cards, whatever the filters. */
  stats: MemberStats;
  filters: {
    userId: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    group: UserGroup | undefined;
    unitId: string | undefined;
    status: "ativos" | "desativados" | undefined;
    pageSize: number;
  };
};

// The members of the condominium by tie: Moradores (residents, a resident
// síndico included) and Equipe (employees: the gate, a hired síndico). Search, filters, pagination and
// "Adicionar pessoa" with the roles of this list. The page loads the data
// (server/loaders/load-members.ts).
export function MembersDirectory({
  user,
  config,
  data,
}: {
  user: SessionUser;
  config: MembersDirectoryConfig;
  data: MembersDirectoryData;
}) {
  const { users, units, people, stats, filters } = data;
  const { userId, email, phone, group, unitId, status, pageSize } = filters;
  const hrefWith = (overrides: Record<string, string | number | undefined>) =>
    buildHref(config.basePath, {
      pessoa: userId,
      email,
      telefone: phone,
      grupo: group,
      unidade: unitId,
      status,
      "por-pagina": pageSizeQuery(pageSize),
      ...overrides,
    });
  const filtered = Boolean(
    userId || email || phone || group || unitId || status,
  );
  const unique = (values: string[]) => [...new Set(values)];
  const creatable = assignableGroups(user.group);

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          rolesFor(config.kind, creatable).length > 0 ? (
            <CreateUserButton
              kind={config.kind}
              assignableGroups={creatable}
              units={units}
            />
          ) : undefined
        }
      />
      <MembersSummary kind={config.kind} stats={stats} />
      <FilterScope>
        <FilterPanel hasActiveFilters={filtered}>
          {/* Who (name, e-mail, phone), then where and how (role, unit,
          situation): searchable lists, like the other list pages. */}
          <AutoFilterForm className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pageSize !== DEFAULT_PAGE_SIZE && (
              <input type="hidden" name="por-pagina" value={pageSize} />
            )}
            <FilterCombobox
              label="Nome"
              name="pessoa"
              defaultValue={userId ?? ""}
              placeholder="Todos"
              options={people.map((person) => ({
                value: person.id,
                label: person.name,
              }))}
            />
            <FilterCombobox
              label="E-mail"
              name="email"
              defaultValue={email ?? ""}
              placeholder="Todos"
              options={unique(people.map((person) => person.email)).map(
                (value) => ({ value, label: value }),
              )}
            />
            <FilterCombobox
              label="Telefone"
              name="telefone"
              defaultValue={phone ?? ""}
              placeholder="Todos"
              options={unique(
                people.flatMap((person) =>
                  person.phone ? [person.phone] : [],
                ),
              ).map((value) => ({ value, label: formatPhone(value) }))}
            />
            {config.roles.length > 1 && (
              <FilterCombobox
                label="Papel"
                name="grupo"
                defaultValue={group ?? ""}
                placeholder="Todos"
                options={config.roles.map((value) => ({
                  value,
                  label: GROUP_LABELS[value],
                }))}
              />
            )}
            {config.unitFilter && units.length > 0 && (
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
            )}
            <FilterCombobox
              label="Situação"
              name="status"
              defaultValue={status ?? ""}
              placeholder="Todas"
              options={[
                { value: "ativos", label: "Ativos" },
                { value: "desativados", label: "Desativados" },
              ]}
            />
            <FilterActions
              clearHref={config.basePath}
              hasActiveFilters={filtered}
              autoSubmit
            />
          </AutoFilterForm>
        </FilterPanel>
        <FilterResults>
          <Card>
            {users.items.length === 0 ? (
              <EmptyState
                icon={<Users className="size-5" />}
                title={filtered ? "Ninguém encontrado" : config.emptyTitle}
                description={
                  filtered ? "Tente outros filtros." : config.emptyDescription
                }
              />
            ) : (
              <MembersList
                users={users.items}
                basePath={config.basePath}
                kind={config.kind}
              />
            )}

            <Pagination
              page={users.page}
              totalPages={users.totalPages}
              total={users.total}
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
