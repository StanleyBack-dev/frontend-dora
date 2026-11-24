import type { Tone } from "@/design-system";
import type {
  ApprovalDecision,
  ApprovalMode,
  PurchaseSettings,
} from "@/shared/contracts/purchase-approvals";
import { formatCents } from "@/shared/lib/format";

export const APPROVAL_DECISION_LABELS: Record<ApprovalDecision, string> = {
  AUTO_APPROVED: "Aprovada na alçada",
  APPROVED: "Aprovada",
  RETURNED: "Devolvida para cotação",
  REJECTED: "Reprovada",
};

export const APPROVAL_DECISION_TONES: Record<ApprovalDecision, Tone> = {
  AUTO_APPROVED: "success",
  APPROVED: "success",
  RETURNED: "info",
  REJECTED: "danger",
};

export const APPROVAL_MODE_LABELS: Record<ApprovalMode, string> = {
  ALWAYS: "Toda compra passa pelo aprovador",
  LIMIT: "Até um valor, a compra segue aprovada",
};

/** The rule in one sentence. */
export function approvalRule(
  settings: Pick<PurchaseSettings, "approvalMode" | "approvalLimitCents">,
): string {
  return settings.approvalMode === "LIMIT" &&
    settings.approvalLimitCents !== null
    ? `Até ${formatCents(settings.approvalLimitCents)}, a compra segue aprovada ao escolher a cotação; acima disso, passa por quem aprova.`
    : "Toda cotação escolhida espera a decisão de quem aprova as compras.";
}

/** A note's label: an observation when approved, the reason otherwise. */
export const noteLabel = (decision: ApprovalDecision) =>
  decision === "APPROVED" || decision === "AUTO_APPROVED"
    ? "Observação"
    : "Motivo";

export const MAX_APPROVAL_NOTE = 300;
