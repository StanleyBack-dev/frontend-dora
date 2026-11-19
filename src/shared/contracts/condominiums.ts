import type {
  AddressFormat,
  AppModule,
  CondominiumStatus,
  UserGroup,
} from "@/shared/graphql/schema-enums";

export type { AddressFormat, AppModule, CondominiumStatus };

/** A condominium as the platform console shows it. */
export type Condominium = {
  id: string;
  name: string;
  /** CNPJ, digits only. */
  document: string | null;
  city: string;
  state: string;
  status: CondominiumStatus;
  /** Apartments (block and number) or houses (street, quadra and lote). */
  addressFormat: AddressFormat;
  /** Optional modules contracted apart that are on. */
  modules: AppModule[];
  activeMembers: number;
  managers: number;
  units: number;
  pendingEnrollments: number;
  lastActivityAt: string | null;
  createdAt: string;
};

export type CondominiumInput = {
  name: string;
  document?: string | null;
  city: string;
  state: string;
  /** Apartments when a new condominium doesn't say. */
  addressFormat?: AddressFormat;
};

/**
 * A unit of the current condominium: an apartment (block and number) or a
 * house (street, quadra kept as the block, lote kept as the number).
 */
export type Unit = {
  id: string;
  /** Houses only ("" in apartments). */
  street: string;
  /** "" when the condominium has no blocks; the quadra of a house. */
  block: string;
  /** The lote of a house. */
  number: string;
  /** "Bloco A · 101" or "Rua das Flores, Qd 3, Lt 12". */
  label: string;
  /** Active members linked to it. */
  residents: number;
};

/** Someone linked to a unit (Gestão > Unidades). */
export type UnitResident = {
  userId: string;
  name: string;
  role: UserGroup;
  email: string;
  /** Digits. */
  phone: string | null;
  /** Membership and account active. */
  active: boolean;
};

/** A unit with the people linked to it. */
export type UnitWithResidents = Unit & { people: UnitResident[] };

/** What narrows the units page (absent: any). */
export type UnitFilter = {
  unitId?: string;
  block?: string;
  street?: string;
  occupancy?: "OCCUPIED" | "EMPTY";
};

export type CreateUnitsInput = {
  /** Houses only. */
  street?: string | null;
  block?: string | null;
  /** Numbers and ranges: "101-104, 201". */
  numbers: string;
};

export type UpdateUnitInput = {
  /** Houses only. */
  street?: string | null;
  block?: string | null;
  number: string;
};
