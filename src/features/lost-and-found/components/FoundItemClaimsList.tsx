import { CircleCheck, CircleX, HandHelping, PackageCheck } from "lucide-react";
import { Badge, Button, EmptyState } from "@/design-system";
import {
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_TONES,
} from "@/features/lost-and-found/model/found-item-labels";
import type { FoundItemClaim } from "@/shared/contracts/lost-and-found";
import { formatDateTime } from "@/shared/lib/datetime";

// The residents' claims for one item, newest first: the desk compares what
// they wrote with the item (and its private details) and answers; an
// accepted claim is handed over from here.
export function FoundItemClaimsList({
  claims,
  kept,
  onAccept,
  onReject,
  onReturn,
}: {
  claims: FoundItemClaim[];
  /** Still kept: claims can be answered and handed over. */
  kept: boolean;
  onAccept: (claim: FoundItemClaim) => void;
  onReject: (claim: FoundItemClaim) => void;
  onReturn: (claim: FoundItemClaim) => void;
}) {
  if (claims.length === 0) {
    return (
      <EmptyState
        icon={<HandHelping className="size-5" />}
        title="Nenhum pedido"
        description={
          kept
            ? "Quando um morador disser que o item é seu, o pedido aparece aqui e você é avisado."
            : "Ninguém pediu este item."
        }
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {claims.map((claim) => (
        <li key={claim.id} className="space-y-2 py-3 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-fg">
                {claim.userName}
                {claim.unitLabel && (
                  <span className="font-normal text-muted">
                    {" "}
                    · {claim.unitLabel}
                  </span>
                )}
              </p>
              <p className="text-xs text-soft">
                Pedido em {formatDateTime(claim.createdAt)}
              </p>
            </div>
            <Badge tone={CLAIM_STATUS_TONES[claim.status]}>
              {CLAIM_STATUS_LABELS[claim.status]}
            </Badge>
          </div>
          <blockquote className="rounded-xl border border-border bg-surface-muted p-3 text-[13px] break-words text-fg">
            {claim.message}
          </blockquote>
          {claim.decidedAt && (
            <p className="text-xs text-muted">
              {CLAIM_STATUS_LABELS[claim.status]} em{" "}
              {formatDateTime(claim.decidedAt)}
              {claim.decidedByName ? ` por ${claim.decidedByName}` : ""}
              {claim.decisionNote ? `: ${claim.decisionNote}` : ""}
            </p>
          )}
          {kept && claim.status === "PENDING" && (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <Button
                size="sm"
                variant="cancel"
                className="justify-center"
                icon={<CircleX className="size-4" />}
                onClick={() => onReject(claim)}
              >
                Recusar
              </Button>
              <Button
                size="sm"
                variant="brand"
                className="justify-center"
                icon={<CircleCheck className="size-4" />}
                onClick={() => onAccept(claim)}
              >
                Aceitar
              </Button>
            </div>
          )}
          {kept && claim.status === "ACCEPTED" && (
            <div className="flex sm:justify-end">
              <Button
                size="sm"
                className="w-full justify-center sm:w-auto"
                icon={<PackageCheck className="size-4" />}
                onClick={() => onReturn(claim)}
              >
                Devolver para {claim.userName.split(" ")[0]}
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
