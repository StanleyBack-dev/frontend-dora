"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, PackageCheck, Trash2 } from "lucide-react";
import { Button, Card } from "@/design-system";
import {
  CloseFoundItemModal,
  type CloseFoundItemKind,
} from "@/features/lost-and-found/components/CloseFoundItemModal";
import { DecideClaimModal } from "@/features/lost-and-found/components/DecideClaimModal";
import { FoundItemClaimsList } from "@/features/lost-and-found/components/FoundItemClaimsList";
import { FoundItemReturnDrawer } from "@/features/lost-and-found/components/FoundItemReturnDrawer";
import type {
  FoundItemClaim,
  FoundItemDetails,
} from "@/shared/contracts/lost-and-found";

// What the desk does with one kept item: answer the claims, hand it back
// with a signature (to an accepted claim or someone else), or donate or
// discard it. The page reloads from the API after each change.
export function FoundItemDesk({ item }: { item: FoundItemDetails }) {
  const router = useRouter();
  const kept = item.status === "FOUND";
  const [deciding, setDeciding] = useState<{
    claim: FoundItemClaim;
    accept: boolean;
  } | null>(null);
  // Each opening mounts the drawer anew (blank, with its claim).
  const [returning, setReturning] = useState<{
    claimId: string | null;
    key: number;
  } | null>(null);
  const [closing, setClosing] = useState<CloseFoundItemKind | null>(null);

  const done = () => {
    setDeciding(null);
    setReturning(null);
    setClosing(null);
    router.refresh();
  };
  const openReturn = (claimId: string | null) =>
    setReturning({ claimId, key: Date.now() });

  return (
    <>
      {kept && (
        <div className="grid gap-2 sm:flex sm:justify-end">
          <Button
            variant="cancel"
            className="justify-center"
            icon={<Trash2 className="size-4" />}
            onClick={() => setClosing("discard")}
          >
            Descartar
          </Button>
          <Button
            variant="secondary"
            className="justify-center"
            icon={<HeartHandshake className="size-4" />}
            onClick={() => setClosing("donate")}
          >
            Doar
          </Button>
          <Button
            className="justify-center"
            icon={<PackageCheck className="size-4" />}
            onClick={() =>
              openReturn(
                item.claims.find((claim) => claim.status === "ACCEPTED")?.id ??
                  null,
              )
            }
          >
            Devolver com assinatura
          </Button>
        </div>
      )}

      <Card className="space-y-3 p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-fg">Pedidos dos moradores</h2>
          <p className="text-[13px] text-muted">
            Compare o que o morador escreveu com o item e os detalhes que só a
            portaria vê.
          </p>
        </div>
        <FoundItemClaimsList
          claims={item.claims}
          kept={kept}
          onAccept={(claim) => setDeciding({ claim, accept: true })}
          onReject={(claim) => setDeciding({ claim, accept: false })}
          onReturn={(claim) => openReturn(claim.id)}
        />
      </Card>

      <DecideClaimModal
        claim={deciding?.claim ?? null}
        accept={deciding?.accept ?? true}
        onClose={() => setDeciding(null)}
        onDone={done}
      />
      {returning && (
        <FoundItemReturnDrawer
          key={returning.key}
          item={item}
          open
          claimId={returning.claimId}
          onClose={() => setReturning(null)}
          onDone={done}
        />
      )}
      <CloseFoundItemModal
        item={closing ? item : null}
        kind={closing ?? "donate"}
        onClose={() => setClosing(null)}
        onDone={done}
      />
    </>
  );
}
