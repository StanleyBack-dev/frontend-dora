"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandHelping, SearchCheck } from "lucide-react";
import { Button, EmptyState } from "@/design-system";
import { ClaimFoundItemModal } from "@/features/lost-and-found/components/ClaimFoundItemModal";
import { FoundItemCard } from "@/features/lost-and-found/components/FoundItemCard";
import { canClaimAgain } from "@/features/lost-and-found/model/found-item-labels";
import type { KeptFoundItem } from "@/shared/contracts/lost-and-found";

// The items kept by the condominium, as cards: each says whether the
// resident already asked for it, or offers "É meu".
export function KeptFoundItemsGallery({
  items,
  filtered,
}: {
  items: KeptFoundItem[];
  filtered: boolean;
}) {
  const router = useRouter();
  const [claiming, setClaiming] = useState<KeptFoundItem | null>(null);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<SearchCheck className="size-5" />}
        title={
          filtered ? "Nenhum item nesta categoria" : "Nenhum item guardado"
        }
        description={
          filtered
            ? "Tente outra categoria ou limpe o filtro."
            : "Quando a portaria registrar algo achado no condomínio, aparece aqui."
        }
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <FoundItemCard
            key={item.id}
            item={item}
            action={
              canClaimAgain(item.myClaim?.status) ? (
                <Button
                  variant="brand"
                  size="sm"
                  icon={<HandHelping className="size-4" />}
                  onClick={() => setClaiming(item)}
                >
                  É meu
                </Button>
              ) : undefined
            }
          />
        ))}
      </div>
      <ClaimFoundItemModal
        item={claiming}
        onClose={() => setClaiming(null)}
        onDone={() => {
          setClaiming(null);
          router.refresh();
        }}
      />
    </>
  );
}
