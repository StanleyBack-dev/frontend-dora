import "server-only";
import { authed } from "@/server/auth/current-user";
import { adminService } from "@/server/services/admin.service";
import { condominiumsService } from "@/server/services/condominiums.service";
import type {
  MemberFilterOption,
  MemberKind,
  MemberStats,
  Paginated,
  UserAccount,
  UserGroup,
} from "@/shared/contracts/api";
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
  /** One person (the name filter). */
  userId: string | undefined;
  email: string | undefined;
  /** Phone digits. */
  phone: string | undefined;
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
  /** Every member of the tie: what the name, e-mail and phone filters offer. */
  people: MemberFilterOption[];
  /** The page's cards, whatever the filters. */
  stats: MemberStats;
  filters: MembersFilters;
};

/**
 * A list of members of one tie (Moradores: residents; Equipe: employees),
 * filtered by the address's query. Each filter only takes a value the API
 * offered (anything else is ignored).
 */
export async function loadMembers(
  params: RawSearchParams,
  options: {
    kind: MemberKind;
    roles: readonly UserGroup[];
    unitFilter: boolean;
  },
): Promise<MembersList> {
  const [units, people, stats] = await Promise.all([
    authed((token) => condominiumsService.units(token)),
    authed((token) => adminService.memberFilterOptions(token, options.kind)),
    authed((token) => adminService.memberStats(token, options.kind)),
  ]);

  const userId = oneOf(
    firstParam(params, "pessoa"),
    people.map((person) => person.id),
  );
  const email = oneOf(
    firstParam(params, "email"),
    people.map((person) => person.email),
  );
  const phone = oneOf(
    firstParam(params, "telefone"),
    people.flatMap((person) => (person.phone ? [person.phone] : [])),
  );
  const group =
    options.roles.length > 1
      ? oneOf(firstParam(params, "grupo"), options.roles)
      : undefined;
  const status = oneOf(firstParam(params, "status"), STATUSES);
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
      userId,
      email,
      phone,
      group,
      kind: options.kind,
      unitId,
      active: status === undefined ? undefined : status === "ativos",
      page,
      limit: pageSize,
    }),
  );
  return {
    users,
    units,
    people,
    stats,
    filters: { userId, email, phone, group, unitId, status, page, pageSize },
  };
}
