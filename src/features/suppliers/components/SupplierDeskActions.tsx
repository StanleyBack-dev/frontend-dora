"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { Button } from "@/design-system";
import { SupplierFormDrawer } from "@/features/suppliers/components/SupplierFormDrawer";

/**
 * The page's main action: register a supplier (on its own row, to the
 * right, as on the parcels and lost-and-found desks).
 */
export function SupplierDeskActions() {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);

  return (
    <div className="mb-5 flex justify-end">
      <Button
        icon={<Truck className="size-4" />}
        onClick={() => setRegistering(true)}
      >
        Cadastrar fornecedor
      </Button>
      <SupplierFormDrawer
        open={registering}
        onClose={() => setRegistering(false)}
        onDone={() => {
          setRegistering(false);
          router.refresh();
        }}
      />
    </div>
  );
}
