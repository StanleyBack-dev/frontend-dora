"use client";

import { parcelsClient } from "@/features/parcels/api/parcels.client";
import {
  UnitOrResidentPicker,
  type UnitOrResidentPick,
} from "@/features/residents/components/UnitOrResidentPicker";
import type { ParcelRecipient } from "@/shared/contracts/parcels";

/** What the picker hands over: the unit, and the resident when chosen by name. */
export type RecipientPick = UnitOrResidentPick;

// Who a parcel is for: by the unit or by the resident's name. By unit,
// every resident there is told; by name, only that resident (a surprise or
// a gift stays private), and the notice says so.
export function ParcelRecipientPicker({
  units,
  value,
  initialResident = null,
  onChange,
}: {
  units: { id: string; label: string }[];
  /** Chosen by name before (a restored draft): starts on "Morador". */
  initialResident?: ParcelRecipient | null;
  /** The chosen unit (null: none yet). */
  value: string | null;
  onChange: (pick: RecipientPick | null) => void;
}) {
  return (
    <UnitOrResidentPicker
      name="parcel-recipient-mode"
      units={units}
      value={value}
      initialResident={initialResident}
      notes={{
        unit: "Todos os moradores da unidade são avisados e veem a encomenda.",
        resident:
          "Só o morador escolhido é avisado e vê a encomenda: bom para uma surpresa ou um presente. Os outros da unidade não ficam sabendo.",
      }}
      search={parcelsClient.recipients}
      onChange={onChange}
    />
  );
}
