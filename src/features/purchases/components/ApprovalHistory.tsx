import { Badge } from "@/design-system";
import {
  APPROVAL_DECISION_LABELS,
  APPROVAL_DECISION_TONES,
  noteLabel,
} from "@/features/purchases/model/approval-labels";
import type { PurchaseApproval } from "@/shared/contracts/purchase-approvals";
import { formatDateTime } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";

// Every decision on a purchase, the latest first: what it was, the quote
// as it was then, who chose and who decided, when, and the note or reason.
export function ApprovalHistory({
  approvals,
}: {
  approvals: PurchaseApproval[];
}) {
  return (
    <ol className="space-y-2">
      {approvals.map((approval) => (
        <li
          key={approval.id}
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone={APPROVAL_DECISION_TONES[approval.decision]}>
              {APPROVAL_DECISION_LABELS[approval.decision]}
            </Badge>
            <span className="text-xs text-soft">
              {formatDateTime(approval.decidedAt)}
            </span>
          </div>
          <p className="mt-1.5 break-words text-fg">
            {approval.supplierName} ·{" "}
            <strong className="tabular-nums">
              {formatCents(approval.totalCents)}
            </strong>
            {approval.limitCents !== null && (
              <span className="text-muted">
                {" "}
                (alçada de {formatCents(approval.limitCents)})
              </span>
            )}
          </p>
          <p className="text-xs text-muted">
            {approval.decision === "AUTO_APPROVED"
              ? `Escolhida por ${approval.chosenByName ?? "—"}, dentro da alçada.`
              : `Escolhida por ${approval.chosenByName ?? "—"} · decidida por ${approval.decidedByName ?? "—"}`}
          </p>
          {approval.note && (
            <p className="mt-1 break-words text-fg">
              <span className="text-muted">
                {noteLabel(approval.decision)}:
              </span>{" "}
              {approval.note}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
