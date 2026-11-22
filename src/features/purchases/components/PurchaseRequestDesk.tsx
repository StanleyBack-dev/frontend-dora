"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Ban, Pencil } from "lucide-react";
import { Button, Card, MoreActions } from "@/design-system";
import { CancelPurchaseRequestModal } from "@/features/purchases/components/CancelPurchaseRequestModal";
import { PurchaseRequestFormDrawer } from "@/features/purchases/components/PurchaseRequestFormDrawer";
import { isEditableRequest } from "@/features/purchases/model/request-labels";
import type { CatalogOption } from "@/shared/contracts/catalog";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";

// A request's card with its actions, as on the lost-and-found item page:
// while it waits for quotes, "Editar" (main) and, behind "Mais ações",
// "Cancelar solicitação". The quotes arrive here in the next phase.
export function PurchaseRequestDesk({
  request,
  viewerId,
  spaces,
  products,
  brands,
  children,
}: {
  request: PurchaseRequest;
  viewerId: string;
  /** The condominium's active spaces (where it will be used). */
  spaces: { id: string; name: string }[];
  /** The catalog, for editing the items. */
  products: CatalogOption[];
  brands: CatalogOption[];
  /** The request's details. */
  children: ReactNode;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const editable = isEditableRequest(request);

  const done = () => {
    setEditing(false);
    setCancelling(false);
    router.refresh();
  };

  return (
    <>
      <Card className="overflow-visible">
        <div className="p-4 sm:p-6">{children}</div>
        {editable && (
          <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <MoreActions
              actions={[
                {
                  label: "Cancelar solicitação",
                  icon: <Ban />,
                  danger: true,
                  onSelect: () => setCancelling(true),
                },
              ]}
            />
            <Button
              className="justify-center"
              icon={<Pencil className="size-4" />}
              onClick={() => setEditing(true)}
            >
              Editar solicitação
            </Button>
          </div>
        )}
      </Card>

      {editable && editing && (
        <PurchaseRequestFormDrawer
          key={request.updatedAt}
          open
          request={request}
          spaces={spaces}
          products={products}
          brands={brands}
          onClose={() => setEditing(false)}
          onDone={done}
        />
      )}
      {editable && (
        <CancelPurchaseRequestModal
          request={request}
          open={cancelling}
          ownRequest={request.requestedById === viewerId}
          onClose={() => setCancelling(false)}
          onDone={done}
        />
      )}
    </>
  );
}
