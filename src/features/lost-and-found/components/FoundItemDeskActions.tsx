"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus } from "lucide-react";
import { Button } from "@/design-system";
import { FoundItemRegisterDrawer } from "@/features/lost-and-found/components/FoundItemRegisterDrawer";

// The desk's main job on the list: register an item that was found (on
// its own row, to the right, as on the parcels desk).
export function FoundItemDeskActions({
  units,
}: {
  /** The condominium's units, to say whose an item is. */
  units: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);

  return (
    <div className="mb-5 flex justify-end">
      <Button
        icon={<PackagePlus className="size-4" />}
        onClick={() => setRegistering(true)}
      >
        Registrar item achado
      </Button>
      <FoundItemRegisterDrawer
        open={registering}
        units={units}
        onClose={() => setRegistering(false)}
        onDone={() => {
          setRegistering(false);
          router.refresh();
        }}
      />
    </div>
  );
}
