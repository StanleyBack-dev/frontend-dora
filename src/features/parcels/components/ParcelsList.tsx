"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CloseParcelModal,
  type CloseKind,
} from "@/features/parcels/components/CloseParcelModal";
import { ParcelsTable } from "@/features/parcels/components/ParcelsTable";
import type { Parcel } from "@/shared/contracts/parcels";

// A page of the condominium's parcels with the return and cancel actions;
// the page reloads from the API after each change.
export function ParcelsList({
  parcels,
  filtered,
  now,
}: {
  parcels: Parcel[];
  filtered: boolean;
  now: number;
}) {
  const router = useRouter();
  const [closing, setClosing] = useState<{
    parcel: Parcel;
    kind: CloseKind;
  } | null>(null);

  return (
    <>
      <ParcelsTable
        parcels={parcels}
        filtered={filtered}
        now={now}
        onReturn={(parcel) => setClosing({ parcel, kind: "return" })}
        onCancel={(parcel) => setClosing({ parcel, kind: "cancel" })}
      />
      <CloseParcelModal
        parcel={closing?.parcel ?? null}
        kind={closing?.kind ?? "return"}
        onClose={() => setClosing(null)}
        onDone={() => {
          setClosing(null);
          router.refresh();
        }}
      />
    </>
  );
}
