import { CircleCheck, CircleX } from "lucide-react";
import { Badge, Button } from "@/design-system";
import {
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_TONES,
} from "@/features/lost-and-found/model/found-item-labels";
import type { FoundItemClaim } from "@/shared/contracts/lost-and-found";
import { formatDateTime } from "@/shared/lib/datetime";

/** "Sônia Barbosa" → "SB". */
const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

// The residents' claims for one item, newest first: who asked, when, what
// they added and the desk's answer. A claim still waiting can be answered
// here (accept: "come for it"; reject, with the reason); handing the item
// over is the page's main action.
export function FoundItemClaimsList({
  claims,
  kept,
  viewerId,
  soleStaffMember = false,
  onAccept,
  onReject,
}: {
  claims: FoundItemClaim[];
  /** Still kept: waiting claims can be answered. */
  kept: boolean;
  /** Who is looking: their own claim is answered by a colleague. */
  viewerId: string;
  /** The viewer is the team's only member (may hand their own over). */
  soleStaffMember?: boolean;
  onAccept: (claim: FoundItemClaim) => void;
  onReject: (claim: FoundItemClaim) => void;
}) {
  return (
    <ul className="space-y-3">
      {claims.map((claim) => {
        const mine = claim.userId === viewerId;
        const open =
          kept && (claim.status === "PENDING" || claim.status === "ACCEPTED");
        return (
          <li
            key={claim.id}
            className="space-y-3 rounded-xl border border-border p-3 sm:p-4"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand-ink">
                {initials(claim.userName)}
              </span>
              {/* Phones: the state below the name (a long label would
                  squeeze it); wider screens: at the right. */}
              <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 sm:flex-row sm:justify-between sm:gap-3">
                <div className="min-w-0">
                  <p className="leading-snug font-semibold break-words text-fg">
                    {claim.userName}
                  </p>
                  <p className="text-xs text-soft">
                    {claim.unitLabel ? `${claim.unitLabel} · ` : ""}pediu em{" "}
                    {formatDateTime(claim.createdAt)}
                  </p>
                </div>
                <Badge
                  tone={CLAIM_STATUS_TONES[claim.status]}
                  className="shrink-0"
                >
                  {CLAIM_STATUS_LABELS[claim.status]}
                </Badge>
              </div>
            </div>

            {claim.message && (
              <p className="rounded-lg bg-surface-muted/70 px-3 py-2 text-[13px] break-words text-fg">
                {claim.message}
              </p>
            )}

            {claim.decidedAt && (
              <p className="text-xs text-muted">
                {CLAIM_STATUS_LABELS[claim.status]} em{" "}
                {formatDateTime(claim.decidedAt)}
                {claim.decidedByName ? ` por ${claim.decidedByName}` : ""}
                {claim.decisionNote ? ` · ${claim.decisionNote}` : ""}
              </p>
            )}

            {open && mine && (
              <p className="text-xs text-muted">
                {soleStaffMember
                  ? "Este pedido é seu. Como você é a única pessoa da equipe, use “Devolver” e assine: o comprovante registra isso."
                  : "Este pedido é seu: outra pessoa da portaria ou da gestão confere e entrega."}
              </p>
            )}

            {open && !mine && claim.status === "PENDING" && (
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
                  variant="secondary"
                  className="justify-center"
                  icon={<CircleCheck className="size-4" />}
                  onClick={() => onAccept(claim)}
                >
                  Aceitar
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
