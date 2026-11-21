"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus } from "lucide-react";
import { Button } from "@/design-system";
import type { StaffOption } from "@/shared/contracts/residents-search";
import { FoundItemRegisterDrawer } from "@/features/lost-and-found/components/FoundItemRegisterDrawer";

// The desk's main job on the list: register an item that was found (on
// its own row, to the right, as on the parcels desk).
export function FoundItemDeskActions({
  units,
  staff,
}: {
  /** The condominium's units, to say whose an item is. */
  units: { id: string; label: string }[];
  /** The team, to say an item is a staff member's. */
  staff: StaffOption[];
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
        staff={staff}
        onClose={() => setRegistering(false)}
        onDone={() => {
          setRegistering(false);
          router.refresh();
        }}
      />
    </div>
  );
}
