// A resident with their unit, as the name searches answer (naming whose a
// parcel or a found item is).
export type ResidentOption = {
  userId: string;
  name: string;
  unitId: string;
  unitLabel: string;
};

/** Someone of the condominium's team (gate, management). */
export type StaffOption = {
  userId: string;
  name: string;
  /** "Portaria" or "Gestão". */
  roleLabel: string;
};
