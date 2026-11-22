"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardPlus } from "lucide-react";
import { Button } from "@/design-system";
import { PurchaseRequestFormDrawer } from "@/features/purchases/components/PurchaseRequestFormDrawer";
import type { CatalogOption } from "@/shared/contracts/catalog";

// The page's main action: ask for a purchase (on its own row, to the
// right, as on the parcels and lost-and-found desks).
export function PurchaseRequestDeskActions({
  spaces,
  products,
  brands,
}: {
  /** The condominium's active spaces (where it will be used). */
  spaces: { id: string; name: string }[];
  /** The catalog, for the items. */
  products: CatalogOption[];
  brands: CatalogOption[];
}) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);

  return (
    <div className="mb-5 flex justify-end">
      <Button
        icon={<ClipboardPlus className="size-4" />}
        onClick={() => setAsking(true)}
      >
        Nova solicitação
      </Button>
      <PurchaseRequestFormDrawer
        open={asking}
        spaces={spaces}
        products={products}
        brands={brands}
        onClose={() => setAsking(false)}
        onDone={(request) => {
          setAsking(false);
          router.push(`/compras/solicitacoes/${request.id}`);
        }}
      />
    </div>
  );
}
