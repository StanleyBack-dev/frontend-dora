"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Ban,
  CircleCheck,
  CircleX,
  ChevronDown,
  Hourglass,
  Undo2,
} from "lucide-react";
import { Button, Card, cn } from "@/design-system";
import {
  type ApprovalAction,
  ApprovalDecisionModal,
} from "@/features/purchases/components/ApprovalDecisionModal";
import { ApprovalHistory } from "@/features/purchases/components/ApprovalHistory";
import {
  APPROVAL_DECISION_LABELS,
  approvalRule,
  noteLabel,
} from "@/features/purchases/model/approval-labels";
import type {
  PurchaseApproval,
  PurchaseSettings,
} from "@/shared/contracts/purchase-approvals";
import type { PurchaseQuote } from "@/shared/contracts/purchase-quotes";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import { formatDateTime } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";
import { isApprovedOrLater } from "@/features/purchases/model/request-labels";

const LOOKS = {
  waiting: {
    box: "border-warning-border bg-warning-soft",
    ink: "text-warning",
    icon: Hourglass,
  },
  approved: {
    box: "border-success-border bg-success-soft",
    ink: "text-success",
    icon: CircleCheck,
  },
  rejected: {
    box: "border-danger-border bg-danger-soft",
    ink: "text-danger",
    icon: CircleX,
  },
} as const;

/**
 * The approval on the quote page: while it waits, who chose what and why
 * it waits (the rule), with "Aprovar", "Devolver" and "Reprovar" for whoever
 * approves; once decided, the decision; and every decision so far.
 */
export function ApprovalPanel({
  request,
  quotes,
  approvals,
  settings,
  canApprove,
}: {
  request: PurchaseRequest;
  quotes: PurchaseQuote[];
  approvals: PurchaseApproval[];
  settings: PurchaseSettings;
  canApprove: boolean;
}) {
  const router = useRouter();
  const [action, setAction] = useState<ApprovalAction | null>(null);
  /**
   * After a decision the page reloads its data: the buttons wait for it,
   * so a second click can't hit a purchase that no longer waits.
   */
  const [refreshing, startRefresh] = useTransition();
  const chosen = quotes.find((quote) => quote.chosen) ?? null;
  const latest = approvals[0] ?? null;
  const waiting = request.status === "AWAITING_APPROVAL";
  const decided =
    isApprovedOrLater(request.status) || request.status === "REJECTED";
  if (!waiting && !decided && approvals.length === 0) return null;
  // Sent back to quotes (the last decision) and not chosen again yet.
  const returned =
    request.status === "QUOTING" && latest?.decision === "RETURNED";

  const look = waiting
    ? LOOKS.waiting
    : request.status === "REJECTED"
      ? LOOKS.rejected
      : LOOKS.approved;
  const Icon = look.icon;

  return (
    <Card className="overflow-visible">
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
          <BadgeCheck aria-hidden className="size-4 text-soft" />
          Aprovação
        </h2>
        <p className="text-xs text-muted">{approvalRule(settings)}</p>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        {(waiting || decided) && (
          <div className={cn("rounded-xl border px-4 py-3", look.box)}>
            <p
              className={cn(
                "flex items-center gap-2 text-sm font-semibold",
                look.ink,
              )}
            >
              <Icon aria-hidden className="size-4 shrink-0" />
              {waiting
                ? "Aguardando aprovação"
                : latest
                  ? APPROVAL_DECISION_LABELS[latest.decision]
                  : request.status === "REJECTED"
                    ? "Reprovada"
                    : "Aprovada"}
            </p>
            {chosen && (
              <p className="mt-1 text-sm break-words text-fg">
                {chosen.supplierName} ·{" "}
                <strong className="tabular-nums">
                  {formatCents(chosen.totalCents)}
                </strong>
              </p>
            )}
            {request.choiceJustification && (
              <p className="mt-1 text-sm break-words text-fg">
                <span className="text-muted">Justificativa da escolha:</span>{" "}
                {request.choiceJustification}
              </p>
            )}
            <p className="text-xs text-muted">
              {waiting
                ? `Escolhida por ${request.chosenByName ?? "—"}${request.chosenAt ? ` em ${formatDateTime(request.chosenAt)}` : ""}. ${canApprove ? "Você pode decidir abaixo." : "Quem aprova as compras foi avisado."}`
                : latest
                  ? latest.decision === "AUTO_APPROVED"
                    ? `Dentro da alçada: aprovada ao ser escolhida por ${latest.chosenByName ?? "—"}, em ${formatDateTime(latest.decidedAt)}.`
                    : `Por ${latest.decidedByName ?? "—"} em ${formatDateTime(latest.decidedAt)}.`
                  : null}
            </p>
            {decided && latest?.note && (
              <p className="mt-1 text-sm break-words text-fg">
                <span className="text-muted">
                  {noteLabel(latest.decision)}:
                </span>{" "}
                {latest.note}
              </p>
            )}
          </div>
        )}

        {returned && latest && (
          <div className="rounded-xl border border-info-border bg-info-soft px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-info">
              <Undo2 aria-hidden className="size-4 shrink-0" />
              Devolvida para cotação
            </p>
            <p className="mt-1 text-sm break-words text-fg">
              <span className="text-muted">Motivo:</span> {latest.note}
            </p>
            <p className="text-xs text-muted">
              Por {latest.decidedByName ?? "—"} em{" "}
              {formatDateTime(latest.decidedAt)}. A gestão ajusta as cotações e
              escolhe de novo.{" "}
              <Link
                href={`/compras/cotacoes/${request.id}`}
                className="font-semibold text-brand-ink underline"
              >
                Ver as cotações
              </Link>
            </p>
          </div>
        )}

        {refreshing && (
          <p className="text-xs text-muted" role="status">
            Atualizando…
          </p>
        )}

        {waiting && canApprove && chosen && !refreshing && (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="danger"
              className="justify-center"
              icon={<Ban className="size-4" />}
              onClick={() => setAction("reject")}
            >
              Reprovar
            </Button>
            <Button
              variant="secondary"
              className="justify-center"
              icon={<Undo2 className="size-4" />}
              onClick={() => setAction("return")}
            >
              Devolver para cotação
            </Button>
            <Button
              className="justify-center"
              icon={<BadgeCheck className="size-4" />}
              onClick={() => setAction("approve")}
            >
              Aprovar
            </Button>
          </div>
        )}

        {approvals.length > 0 && (
          <details className="group" open={approvals.length <= 2}>
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-fg [&::-webkit-details-marker]:hidden">
              Histórico de decisões ({approvals.length})
              <ChevronDown
                aria-hidden
                className="size-4 text-muted transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="mt-2">
              <ApprovalHistory approvals={approvals} />
            </div>
          </details>
        )}
      </div>

      {action && chosen && (
        <ApprovalDecisionModal
          action={action}
          requestId={request.id}
          supplierName={chosen.supplierName}
          totalCents={chosen.totalCents}
          onClose={() => setAction(null)}
          onDone={() => {
            setAction(null);
            startRefresh(() => router.refresh());
          }}
        />
      )}
    </Card>
  );
}
