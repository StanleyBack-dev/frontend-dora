import type { LimitPeriod, SpaceKind } from "@/shared/graphql/schema-enums";

export type { LimitPeriod, SpaceKind };

/** 0 = Sunday … 6 = Saturday. */
export type OpeningHours = {
  weekday: number;
  /** "HH:MM". */
  opensAt: string;
  /** "HH:MM" ("24:00" = until midnight). */
  closesAt: string;
};

export type UnitLimit = { count: number; period: LimitPeriod };

/** Booking rules of a space (enforced when residents book). */
export type SpaceRules = {
  openingHours: OpeningHours[];
  slotMinutes: number;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  unitLimit: UnitLimit | null;
  requiresApproval: boolean;
  cancelUntilHours: number;
};

export type Space = {
  id: string;
  name: string;
  kind: SpaceKind;
  description: string | null;
  capacity: number | null;
  usageRules: string | null;
  /** Inactive: hidden from residents (maintenance). */
  active: boolean;
  rules: SpaceRules;
  createdAt: string;
  updatedAt: string;
};

/** The whole form (details and rules). */
export type SpaceInput = Pick<
  Space,
  "name" | "kind" | "description" | "capacity" | "usageRules" | "rules"
>;
