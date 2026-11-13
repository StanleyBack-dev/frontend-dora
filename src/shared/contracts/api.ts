// Contract types shared by the BFF routes and the UI — types only, no runtime
// code. Dates are ISO strings. Enums come from the GraphQL schema
// (codegen: shared/graphql/schema-enums.ts).
import type {
  CondominiumStatus,
  Permission,
  UserGroup,
} from "@/shared/graphql/schema-enums";

export type { CondominiumStatus, Permission, UserGroup };

/** Error shape returned by every BFF route. */
export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** The condominium the session works in. */
export type CurrentCondominium = {
  id: string;
  name: string;
  city: string;
  state: string;
  status: CondominiumStatus;
};

/** A condominium the person can open (active member). */
export type MemberCondominium = {
  id: string;
  name: string;
  city: string;
  state: string;
  /** Role there: USER (resident) or ADMIN (manager). */
  role: UserGroup;
};

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  /** Group in the current context (role in the condominium, or the platform). */
  group: UserGroup;
  /** Runs the platform (every condominium). */
  platformAdmin: boolean;
  /** Null: no condominium chosen or available. */
  condominium: CurrentCondominium | null;
  condominiums: MemberCondominium[];
  mustChangePassword: boolean;
  permissions: Permission[];
  /** Short-lived link to the profile photo (null: none). */
  photoUrl: string | null;
  /** Already saw (or skipped) the guided tour. */
  onboardingCompleted: boolean;
};

export type UserAccount = {
  id: string;
  name: string;
  email: string;
  username: string;
  /** Role in the current condominium (ADMIN_MASTER: the platform). */
  group: UserGroup;
  /** Access to this condominium. */
  active: boolean;
  unitId: string | null;
  /** "Bloco A · 101". */
  unitLabel: string | null;
  /**
   * Also used outside this condominium: login data only changes through the
   * person or the platform.
   */
  sharedAccount: boolean;
  mustChangePassword: boolean;
  lockedUntil: string | null;
  /** Locked right now by failed logins (computed by the API). */
  locked: boolean;
  lastLoginAt: string | null;
  deactivatedAt: string | null;
  createdAt: string;
};

/** Shown once to the admin who generated it. */
export type TemporaryAccess = {
  user: UserAccount;
  /** Null when the person already had a Dora account. */
  temporaryPassword: string | null;
  emailSent: boolean;
  /** The person already had an account: they only gained this condominium. */
  existingAccount?: boolean;
};

export type UserInput = {
  name: string;
  email: string;
  /** Empty: generated from the name. */
  username?: string | null;
  group: UserGroup;
  unitId?: string | null;
};

export type PermissionMatrix = {
  effective: Permission[];
  defaults: Permission[];
  overrides: { permission: Permission; allowed: boolean }[];
};

/** Records whose trail the tables show (entity names of the audit log). */
export const AUDITED_ENTITIES = [
  "user",
  "membership",
  "condominium",
  "unit",
  "enrollment_invite",
  "enrollment_request",
  "broadcast",
  "support_request",
] as const;
export type AuditedEntity = (typeof AUDITED_ENTITIES)[number];

/** Who created a record and who changed it last (its own columns). */
export type RecordStamp = {
  createdAt: string;
  createdByName: string | null;
  updatedAt: string;
  updatedByName: string | null;
};
