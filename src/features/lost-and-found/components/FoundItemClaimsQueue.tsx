"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleCheck,
  CircleX,
  HandHelping,
  Lock,
  PackageCheck,
} from "lucide-react";
import {
  Badge,
  Button,
  buttonClasses,
  Card,
  cn,
  EmptyState,
} from "@/design-system";
import { DecideClaimModal } from "@/features/lost-and-found/components/DecideClaimModal";
import { FOUND_ITEM_CATEGORY_ICONS } from "@/features/lost-and-found/model/found-item-icons";
import {
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_TONES,
  FOUND_ITEM_CATEGORY_LABELS,
  FOUND_ITEM_STATUS_LABELS,
} from "@/features/lost-and-found/model/found-item-labels";
import type { QueuedFoundItemClaim } from "@/shared/contracts/lost-and-found";
import { formatDateTime } from "@/shared/lib/datetime";

// The desk's claims, two per row on wide screens: the item (photo or its
// category), who asked and when, what they added, the details only the desk
// sees (to ask in person), and the actions — hand it over with a signature,
// or answer beforehand. A staff member's own claim is left to a colleague.
export function FoundItemClaimsQueue({
  claims,
  open,
  viewerId,
}: {
  claims: QueuedFoundItemClaim[];
  /** The open ones (a queue) or every claim. */
  open: boolean;
  viewerId: string;
}) {
  const router = useRouter();
  const [deciding, setDeciding] = useState<{
    claim: QueuedFoundItemClaim;
    accept: boolean;
  } | null>(null);

  if (claims.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<HandHelping className="size-5" />}
          title={open ? "Nenhum pedido para conferir" : "Nenhum pedido"}
          description={
            open
              ? "Quando um morador disser que um item é seu, o pedido aparece aqui e você é avisado."
              : "Os pedidos dos moradores aparecem aqui."
          }
        />
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {claims.map((claim) => {
          const { item } = claim;
          const Icon = FOUND_ITEM_CATEGORY_ICONS[item.category];
          const kept = item.status === "FOUND";
          const mine = claim.userId === viewerId;
          const actionable =
            kept &&
            !mine &&
            (claim.status === "PENDING" || claim.status === "ACCEPTED");
          return (
            <Card key={claim.id} className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                {item.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- short-lived signed link
                  <img
                    src={item.photoUrl}
                    alt=""
                    className="size-14 shrink-0 rounded-2xl border border-border object-cover"
                  />
                ) : (
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-brand-fg shadow-sm">
                    <Icon aria-hidden className="size-7" />
                  </span>
                )}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Link
                    href={`/achados-e-perdidos/${item.id}`}
                    className="block leading-snug font-semibold break-words text-fg hover:underline"
                  >
                    {item.title}
                  </Link>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={CLAIM_STATUS_TONES[claim.status]}>
                      {CLAIM_STATUS_LABELS[claim.status]}
                    </Badge>
                    {!kept && (
                      <Badge tone="neutral">
                        Item{" "}
                        {FOUND_ITEM_STATUS_LABELS[item.status].toLowerCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="text-xs text-soft">Quem pediu</dt>
                  <dd className="break-words text-fg">
                    {claim.userName}
                    {claim.unitLabel && (
                      <span className="text-muted"> · {claim.unitLabel}</span>
                    )}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-soft">Pedido em</dt>
                  <dd className="text-fg">{formatDateTime(claim.createdAt)}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-soft">Categoria</dt>
                  <dd className="text-fg">
                    {FOUND_ITEM_CATEGORY_LABELS[item.category]}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-soft">Guardado em</dt>
                  <dd className="break-words text-fg">
                    {item.storageLocation}
                  </dd>
                </div>
              </dl>

              {claim.message && (
                <div className="rounded-xl border border-border bg-surface-muted/60 p-3">
                  <p className="text-xs text-soft">O que o morador contou</p>
                  <p className="mt-0.5 text-[13px] break-words text-fg">
                    {claim.message}
                  </p>
                </div>
              )}

              {actionable && item.privateDetails && (
                <div className="rounded-xl border border-warning-border bg-warning-soft p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-fg">
                    <Lock aria-hidden className="size-3.5" />
                    Pergunte antes de entregar (só a portaria vê)
                  </p>
                  <p className="mt-1 text-[13px] break-words text-fg">
                    {item.privateDetails}
                  </p>
                </div>
              )}

              {claim.decidedAt && (
                <p className="text-xs text-muted">
                  {CLAIM_STATUS_LABELS[claim.status]} em{" "}
                  {formatDateTime(claim.decidedAt)}
                  {claim.decidedByName ? ` por ${claim.decidedByName}` : ""}
                  {claim.decisionNote ? `: ${claim.decisionNote}` : ""}
                </p>
              )}

              {kept && mine && (
                <p className="text-xs text-muted">
                  Este pedido é seu: outra pessoa da portaria ou da gestão
                  confere e entrega.
                </p>
              )}

              {actionable && (
                <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border pt-3 sm:flex sm:justify-end">
                  {claim.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        variant="cancel"
                        className="justify-center"
                        icon={<CircleX className="size-4" />}
                        onClick={() => setDeciding({ claim, accept: false })}
                      >
                        Recusar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="justify-center"
                        icon={<CircleCheck className="size-4" />}
                        onClick={() => setDeciding({ claim, accept: true })}
                      >
                        Aceitar
                      </Button>
                    </>
                  )}
                  <Link
                    href={`/achados-e-perdidos/${item.id}?devolver=${claim.id}`}
                    className={cn(
                      buttonClasses("primary", "sm"),
                      "col-span-2 justify-center",
                    )}
                  >
                    <PackageCheck aria-hidden className="size-4" />
                    Devolver com assinatura
                  </Link>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <DecideClaimModal
        claim={deciding?.claim ?? null}
        accept={deciding?.accept ?? true}
        onClose={() => setDeciding(null)}
        onDone={() => {
          setDeciding(null);
          router.refresh();
        }}
      />
    </>
  );
}
