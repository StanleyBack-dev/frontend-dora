"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ShieldCheck } from "lucide-react";
import { Button, Card, ChoiceCards, Field, Modal } from "@/design-system";
import { purchaseApprovalsClient } from "@/features/purchases/api/purchase-approvals.client";
import {
  APPROVAL_MODE_LABELS,
  approvalRule,
} from "@/features/purchases/model/approval-labels";
import type {
  ApprovalMode,
  PurchaseSettings,
} from "@/shared/contracts/purchase-approvals";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatDateTime } from "@/shared/lib/datetime";
import { centsOf, maskMoney, moneyField } from "@/shared/lib/masks";
import { useToast } from "@/shared/toast/useToast";

// The condominium's approval rule (the alçada) on the approvals page, with
// "Alterar" for whoever approves: every purchase through the approver, or
// up to a value approved when the quote is chosen. Takes effect on the
// next choices.
export function ApprovalSettingsCard({
  settings,
  canEdit,
}: {
  settings: PurchaseSettings;
  canEdit: boolean;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState<ApprovalMode>(settings.approvalMode);
  const [limit, setLimit] = useState(
    settings.approvalLimitCents ? moneyField(settings.approvalLimitCents) : "",
  );
  const [tried, setTried] = useState(false);
  const [pending, setPending] = useState(false);
  const limitCents = centsOf(limit);
  const problem =
    mode === "LIMIT" && !(limitCents && limitCents > 0)
      ? "Informe o valor da alçada."
      : undefined;

  function open() {
    setMode(settings.approvalMode);
    setLimit(
      settings.approvalLimitCents
        ? moneyField(settings.approvalLimitCents)
        : "",
    );
    setTried(false);
    setEditing(true);
  }

  async function save() {
    setTried(true);
    if (problem) return;
    setPending(true);
    try {
      await purchaseApprovalsClient.updateSettings({
        approvalMode: mode,
        approvalLimitCents: mode === "LIMIT" ? limitCents : null,
      });
      showSuccess(
        "Regra de aprovação salva.",
        "Vale para as próximas escolhas.",
      );
      setEditing(false);
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível salvar a regra.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-brand-border bg-brand-soft text-brand-ink">
          <ShieldCheck aria-hidden className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg">Regra de aprovação</p>
          <p className="text-sm break-words text-muted">
            {approvalRule(settings)}
          </p>
          <p className="text-xs text-soft">
            {settings.updatedAt
              ? `Alterada por ${settings.updatedByName ?? "—"} em ${formatDateTime(settings.updatedAt)}.`
              : "Ainda não alterada: é o padrão."}
          </p>
        </div>
      </div>
      {canEdit && (
        <Button
          variant="secondary"
          className="shrink-0 justify-center"
          icon={<Pencil className="size-4" />}
          onClick={open}
        >
          Alterar
        </Button>
      )}

      <Modal
        open={editing}
        onClose={() => !pending && setEditing(false)}
        title="Regra de aprovação"
        icon={<ShieldCheck className="size-4" />}
        busy={pending}
        size="lg"
        footer={
          <>
            <Button
              variant="cancel"
              onClick={() => setEditing(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button onClick={() => void save()} loading={pending}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <ChoiceCards<ApprovalMode>
            name="approval-mode"
            legend="Como as compras são aprovadas"
            columns={2}
            value={mode}
            onChange={setMode}
            options={[
              {
                value: "ALWAYS",
                title: APPROVAL_MODE_LABELS.ALWAYS,
                hint: "Toda cotação escolhida espera a decisão de quem aprova.",
              },
              {
                value: "LIMIT",
                title: APPROVAL_MODE_LABELS.LIMIT,
                hint: "Até a alçada, segue aprovada ao escolher; acima, passa por quem aprova.",
              },
            ]}
          />
          {mode === "LIMIT" && (
            <Field
              label="Alçada (R$)"
              required
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ex.: 500,00"
              value={limit}
              error={tried ? problem : undefined}
              onChange={(event) => setLimit(maskMoney(event.target.value))}
            />
          )}
          <p className="text-xs text-muted">
            Vale para as próximas escolhas de cotação; o que já aguarda
            aprovação continua aguardando.
          </p>
        </div>
      </Modal>
    </Card>
  );
}
