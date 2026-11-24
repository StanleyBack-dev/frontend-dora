"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button, cn } from "@/design-system";
import { SectionCard } from "@/features/purchases/components/SectionCard";
import { SupplierRatingDrawer } from "@/features/purchases/components/SupplierRatingDrawer";
import type { PurchaseOrderRating } from "@/shared/contracts/purchase-orders";
import { formatDateTime } from "@/shared/lib/datetime";

/**
 * Once the purchase is completed: the supplier's rating (stars, comment,
 * who rated) and, for the management, "Avaliar" (or "Alterar avaliação"),
 * which opens the rating drawer.
 */
export function SupplierRatingCard({
  requestId,
  supplierName,
  rating,
  canManage,
}: {
  requestId: string;
  supplierName: string;
  rating: PurchaseOrderRating | null;
  canManage: boolean;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <SectionCard
      icon={<Star />}
      title="Avaliação do fornecedor"
      description={`Como foi comprar de ${supplierName}: prazo, qualidade e atendimento.`}
      actions={
        canManage ? (
          <Button
            variant={rating ? "secondary" : "primary"}
            className="justify-center"
            icon={<Star className="size-4" />}
            onClick={() => setEditing(true)}
          >
            {rating ? "Alterar avaliação" : "Avaliar fornecedor"}
          </Button>
        ) : undefined
      }
    >
      {rating ? (
        <>
          <div
            aria-label={`${rating.rating} de 5 estrelas`}
            className="flex items-center gap-1"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                aria-hidden
                className={cn(
                  "size-6",
                  value <= rating.rating
                    ? "fill-warning text-warning"
                    : "text-border-strong",
                )}
              />
            ))}
          </div>
          {rating.comment && (
            <p className="text-sm break-words text-fg">{rating.comment}</p>
          )}
          <p className="text-xs text-muted">
            Por {rating.ratedByName ?? "—"} em {formatDateTime(rating.ratedAt)}.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted">Ainda não avaliado.</p>
      )}
      {editing && (
        <SupplierRatingDrawer
          requestId={requestId}
          supplierName={supplierName}
          rating={rating}
          onClose={() => setEditing(false)}
        />
      )}
    </SectionCard>
  );
}
