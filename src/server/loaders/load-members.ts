import "server-only";
import { authed } from "@/server/auth/current-user";
import { adminService } from "@/server/services/admin.service";
import { condominiumsService } from "@/server/services/condominiums.service";
import type { Paginated, UserAccount, UserGroup } from "@/shared/contracts/api";
import type { Unit } from "@/shared/contracts/condominiums";
import {
  firstParam,
  oneOf,
  pageParam,
  pageSizeParam,
  type RawSearchParams,
} from "@/shared/lib/search-params";

const STATUSES = ["ativos", "desativados"] as const;

export type MembersFilters = {
  search: string;
  /** One of the list's roles (only when it has more than one). */
  group: UserGroup | undefined;
  unitId: string | undefined;
  status: (typeof STATUSES)[number] | undefined;
  page: number;
  pageSize: number;
};

export type MembersList = {
  users: Paginated<UserAccount>;
  units: Pick<Unit, "id" | "label">[];
  filters: MembersFilters;
};

/**
 * A list of members with some roles (Moradores: residents; Equipe: managers
 * and the gate), filtered by the address's query.
 */
export async function loadMembers(
  params: RawSearchParams,
  options: { roles: readonly UserGroup[]; unitFilter: boolean },
): Promise<MembersList> {
  const search = firstParam(params, "busca")?.slice(0, 100) ?? "";
  const group =
    options.roles.length > 1
      ? oneOf(firstParam(params, "grupo"), options.roles)
      : undefined;
  const status = oneOf(firstParam(params, "status"), STATUSES);
  const units = await authed((token) => condominiumsService.units(token));
  const unitId = options.unitFilter
    ? oneOf(
        firstParam(params, "unidade"),
        units.map((unit) => unit.id),
      )
    : undefined;
  const page = pageParam(params);
  const pageSize = pageSizeParam(params);

  const users = await authed((token) =>
    adminService.listUsers(token, {
      search,
      group,
      groups: [...options.roles],
      unitId,
      active: status === undefined ? undefined : status === "ativos",
      page,
      limit: pageSize,
    }),
  );
  return {
    users,
    units,
    filters: { search, group, unitId, status, page, pageSize },
  };
}
