"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  HandHelping,
  HeartHandshake,
  PackageCheck,
  Trash2,
  Unlock,
} from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  MoreActions,
  type MoreAction,
} from "@/design-system";
import { lostAndFoundClient } from "@/features/lost-and-found/api/lost-and-found.client";
import { ClaimFoundItemModal } from "@/features/lost-and-found/components/ClaimFoundItemModal";
import {
  CloseFoundItemModal,
  type CloseFoundItemKind,
} from "@/features/lost-and-found/components/CloseFoundItemModal";
import { DecideClaimModal } from "@/features/lost-and-found/components/DecideClaimModal";
import { FoundItemClaimsList } from "@/features/lost-and-found/components/FoundItemClaimsList";
import { FoundItemReturnDrawer } from "@/features/lost-and-found/components/FoundItemReturnDrawer";
import {
  canClaimAgain,
  myClaimView,
} from "@/features/lost-and-found/model/found-item-labels";
import type {
  FoundItemClaim,
  FoundItemDetails,
} from "@/shared/contracts/lost-and-found";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

// The desk's view of one item: a card with its details (`children`) and,
// while kept, the actions in its footer — one main action, the return with
// a signature, named after whoever it goes to (the choice among several
// claims is in the drawer); the rest (donate, discard, open a reservation
// to everyone, claim it for oneself) under "Mais ações". The residents'
// claims follow. The page reloads from the API after each change.
export function FoundItemDesk({
  item,
  viewerId,
  returnClaimId = null,
  children,
}: {
  item: FoundItemDetails;
  /** The item's details, at the top of the card. */
  children: ReactNode;
  /** Who is looking: their own claim is left to a colleague. */
  viewerId: string;
  /**
   * Opens the return at once: for this claim (the claims queue), or for the
   * default one (any other value, from the list).
   */
  returnClaimId?: string | null;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const kept = item.status === "FOUND";
  // Whoever the return goes to by default: an accepted claim of someone
  // else first, then a pending one.
  const target =
    item.claims.find(
      (claim) => claim.status === "ACCEPTED" && claim.userId !== viewerId,
    ) ??
    item.claims.find(
      (claim) => claim.status === "PENDING" && claim.userId !== viewerId,
    ) ??
    null;
  const [deciding, setDeciding] = useState<{
    claim: FoundItemClaim;
    accept: boolean;
  } | null>(null);
  // Each opening mounts the drawer anew (blank, with its claim).
  const [returning, setReturning] = useState<{
    claimId: string | null;
    key: number;
  } | null>(
    kept && returnClaimId
      ? {
          // A claim of this item, or (any other value) the default one.
          claimId: item.claims.some((claim) => claim.id === returnClaimId)
            ? returnClaimId
            : (target?.id ?? null),
          key: 0,
        }
      : null,
  );
  const [closing, setClosing] = useState<CloseFoundItemKind | null>(null);
  const [claiming, setClaiming] = useState(false);
  // Counts the openings of the return (a fresh drawer each time).
  const openings = useRef(0);

  // The reservation ends: every resident sees the item and may claim it.
  async function release() {
    try {
      await lostAndFoundClient.release(item.id);
      showSuccess("Item liberado.", "Agora todos os moradores veem o item.");
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível liberar o item.",
      );
    }
  }

  const done = () => {
    setDeciding(null);
    setReturning(null);
    setClosing(null);
    setClaiming(false);
    router.refresh();
  };
  const openReturn = (claimId: string | null) =>
    setReturning({ claimId, key: ++openings.current });

  const mine = item.myClaim ? myClaimView(item.myClaim) : null;
  const more: MoreAction[] = kept
    ? [
        ...(item.ownerUnitLabel
          ? [
              {
                label: "Liberar para todos",
                icon: <Unlock />,
                onSelect: () => void release(),
              },
            ]
          : []),
        {
          label: "Doar",
          icon: <HeartHandshake />,
          onSelect: () => setClosing("donate"),
        },
        ...(canClaimAgain(item.myClaim?.status)
          ? [
              {
                label: "Este item é meu",
                icon: <HandHelping />,
                onSelect: () => setClaiming(true),
              },
            ]
          : []),
        {
          label: "Descartar",
          icon: <Trash2 />,
          danger: true,
          onSelect: () => setClosing("discard"),
        },
      ]
    : [];

  return (
    <>
      <Card className="overflow-visible">
        <div className="p-4 sm:p-6">{children}</div>
        {kept && (
          <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <MoreActions actions={more} />
            <Button
              className="justify-center"
              icon={<PackageCheck className="size-4" />}
              onClick={() => openReturn(target?.id ?? null)}
            >
              {target
                ? `Devolver para ${target.userName.split(" ")[0]}`
                : "Devolver com assinatura"}
            </Button>
          </div>
        )}
      </Card>

      {item.myClaim && mine && kept && (
        <Alert tone="info">
          <strong>Seu pedido: {mine.label.toLowerCase()}.</strong> Outra pessoa
          da portaria ou da gestão confere e entrega.
        </Alert>
      )}

      {item.claims.length > 0 ? (
        <Card className="space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-fg">Pedidos</h2>
            <Badge tone="neutral">{item.claims.length}</Badge>
          </div>
          <FoundItemClaimsList
            claims={item.claims}
            kept={kept}
            viewerId={viewerId}
            onAccept={(claim) => setDeciding({ claim, accept: true })}
            onReject={(claim) => setDeciding({ claim, accept: false })}
          />
        </Card>
      ) : (
        kept && (
          <p className="text-center text-[13px] text-muted">
            Nenhum morador pediu este item ainda.
          </p>
        )
      )}

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
          viewerId={viewerId}
          open
          claimId={returning.claimId}
          onClose={() => {
            setReturning(null);
            // Opened from the queue: leave the address clean.
            if (returnClaimId) router.replace(`/achados-e-perdidos/${item.id}`);
          }}
          onDone={done}
        />
      )}
      <CloseFoundItemModal
        item={closing ? item : null}
        kind={closing ?? "donate"}
        onClose={() => setClosing(null)}
        onDone={done}
      />
      <ClaimFoundItemModal
        item={claiming ? item : null}
        onClose={() => setClaiming(false)}
        onDone={done}
      />
    </>
  );
}
