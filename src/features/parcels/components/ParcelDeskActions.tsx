"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, PackageSearch } from "lucide-react";
import { Button } from "@/design-system";
import { GateCodeForm } from "@/features/gate/components/GateCodeForm";
import { ParcelPickupDrawer } from "@/features/parcels/components/ParcelPickupDrawer";
import { ParcelRegisterDrawer } from "@/features/parcels/components/ParcelRegisterDrawer";
import {
  PARCEL_CODE_LENGTH,
  parcelCodeFrom,
} from "@/features/parcels/model/parcel-labels";
import {
  forgetLoadedParcelDraft,
  parseParcelDraft,
  storedParcelDraft,
} from "@/features/parcels/model/parcel-register-draft";
import { useToast } from "@/shared/toast/useToast";

const noSubscription = () => () => {};

// The two jobs of the parcels desk (gate or administration): receive a
// parcel that arrived, and hand one over by the code the resident shows
// (the QR, or typed), with the signature on the screen.
export function ParcelDeskActions({
  units,
}: {
  units: { id: string; label: string }[];
}) {
  const router = useRouter();
  const { showError } = useToast();
  const [registering, setRegistering] = useState(false);
  // A form saved before the camera or gallery opened (the phone discarded
  // the page meanwhile): the drawer reopens with it. Read after hydration.
  const stored = useSyncExternalStore(
    noSubscription,
    storedParcelDraft,
    () => null,
  );
  const [restoreDone, setRestoreDone] = useState(false);
  const draft = restoreDone ? null : parseParcelDraft(stored);

  // Closed: the form keeps its texts as a draft unless it was discarded
  // (cancelled or registered).
  function stopRegistering(discarded: boolean) {
    setRegistering(false);
    setRestoreDone(true);
    if (discarded) forgetLoadedParcelDraft();
  }

  const [code, setCode] = useState<string | null>(null);

  async function take(text: string): Promise<boolean> {
    const found = parcelCodeFrom(text);
    if (!found) {
      showError(
        `O código de retirada tem ${PARCEL_CODE_LENGTH} letras e números. Confira com o morador.`,
      );
      return false;
    }
    setCode(found);
    return true;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          icon={<PackagePlus className="size-4" />}
          onClick={() => setRegistering(true)}
        >
          Receber encomenda
        </Button>
      </div>
      <GateCodeForm
        title="Entregar pelo código ou QR"
        label="Código de retirada"
        placeholder="Ex.: ABC 234"
        actionLabel="Buscar encomenda"
        actionIcon={<PackageSearch className="size-4" />}
        minLength={PARCEL_CODE_LENGTH}
        busy={false}
        disabled={code !== null}
        onCode={take}
      />
      <ParcelRegisterDrawer
        // Remounts with the restored texts once they are read (and blank
        // again after a cancel or a registration).
        key={stored ? "restored" : "blank"}
        open={registering || draft !== null}
        units={units}
        draft={draft}
        onClose={stopRegistering}
        onDone={() => {
          stopRegistering(true);
          router.refresh();
        }}
      />
      <ParcelPickupDrawer
        key={code ?? "closed"}
        code={code}
        onClose={() => setCode(null)}
        onDone={() => {
          setCode(null);
          router.refresh();
        }}
      />
    </div>
  );
}
