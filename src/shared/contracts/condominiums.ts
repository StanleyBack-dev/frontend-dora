import type { CondominiumStatus } from "@/shared/graphql/schema-enums";

export type { CondominiumStatus };

/** A condominium as the platform console shows it. */
export type Condominium = {
  id: string;
  name: string;
  /** CNPJ, digits only. */
  document: string | null;
  city: string;
  state: string;
  status: CondominiumStatus;
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
};

/** A unit (apartment, house) of the current condominium. */
export type Unit = {
  id: string;
  /** "" when the condominium has no blocks. */
  block: string;
  number: string;
  /** "Bloco A · 101". */
  label: string;
  /** Active members linked to it. */
  residents: number;
};

export type CreateUnitsInput = {
  block?: string | null;
  /** Numbers and ranges: "101-104, 201". */
  numbers: string;
};

export type UpdateUnitInput = { block?: string | null; number: string };
