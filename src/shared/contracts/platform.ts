import type { MemberKind, UserGroup } from "@/shared/graphql/schema-enums";

/** A person's access to one condominium. */
export type PersonMembership = {
  condominiumId: string;
  condominiumName: string;
  role: UserGroup;
  kind: MemberKind;
  active: boolean;
};

/** Someone with an account on Dora (the platform directory). */
export type PlatformPerson = {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string | null;
  /** Runs the platform. */
  platformAdmin: boolean;
  /** The account is on. */
  active: boolean;
  /** Blocked by wrong passwords until then. */
  lockedUntil: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  memberships: PersonMembership[];
};

/** A member of one condominium, as the platform sees it. */
export type CondominiumMember = {
  userId: string;
  name: string;
  email: string;
  username: string;
  phone: string | null;
  role: UserGroup;
  kind: MemberKind;
  /** Access to this condominium. */
  active: boolean;
  /** Residents. */
  unitLabel: string | null;
  /** Employees. */
  jobTitle: string | null;
  lastLoginAt: string | null;
  since: string;
};

export type PlatformPeopleFilter = {
  search?: string;
  role?: UserGroup;
  condominiumId?: string;
};
