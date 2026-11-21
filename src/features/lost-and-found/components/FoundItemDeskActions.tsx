"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus } from "lucide-react";
import { Button } from "@/design-system";
import { FoundItemRegisterDrawer } from "@/features/lost-and-found/components/FoundItemRegisterDrawer";

// The desk's main job on the list: register an item that was found.
export function FoundItemDeskActions() {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);

  return (
    <>
      <Button
        icon={<PackagePlus className="size-4" />}
        onClick={() => setRegistering(true)}
      >
        Registrar item achado
      </Button>
      <FoundItemRegisterDrawer
        open={registering}
        onClose={() => setRegistering(false)}
        onDone={() => {
          setRegistering(false);
          router.refresh();
        }}
      />
    </>
  );
}
