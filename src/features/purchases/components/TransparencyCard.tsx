"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Megaphone } from "lucide-react";
import {
  Badge,
  Button,
  buttonClasses,
  cn,
  ConfirmModal,
} from "@/design-system";
import { purchaseIndicatorsClient } from "@/features/purchases/api/purchase-indicators.client";
import { SectionCard } from "@/features/purchases/components/SectionCard";
import type { TransparencyStatus } from "@/shared/contracts/purchase-indicators";
import { errorMessage } from "@/shared/lib/api-client";
import { formatDateTime } from "@/shared/lib/datetime";
import { useToast } from "@/shared/toast/useToast";

/**
 * Whether the residents see the purchases' accounts (prestação de contas):
 * off by default; the approvers publish or withdraw them, confirming first.
 * Whoever manages may open the page before publishing, to check it.
 */
export function TransparencyCard({ status }: { status: TransparencyStatus }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const next = !status.enabled;

  async function toggle() {
    setPending(true);
    try {
      await purchaseIndicatorsClient.publish(next);
      showSuccess(
        next
          ? "Prestação de contas publicada."
          : "Prestação de contas retirada.",
        next
          ? "Os moradores veem em Compras > Prestação de contas."
          : "Os moradores não veem mais a página.",
      );
      setConfirming(false);
      router.refresh();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível alterar a publicação."));
    } finally {
      setPending(false);
    }
  }

  return (
    <SectionCard
      icon={<Megaphone />}
      title="Prestação de contas aos moradores"
      description="O gasto por categoria e por mês e as compras concluídas (fornecedor, valor e cotações), sem anexos."
      actions={
        <>
          <Link
            href="/compras/prestacao-de-contas"
            className={cn(buttonClasses("secondary", "sm"), "justify-center")}
          >
            <Eye aria-hidden className="size-4" />
            {status.enabled ? "Ver a página" : "Ver como fica"}
          </Link>
          {status.canManage && (
            <Button
              size="sm"
              variant={status.enabled ? "danger" : "primary"}
              className="justify-center"
              icon={
                status.enabled ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Megaphone className="size-4" />
                )
              }
              onClick={() => setConfirming(true)}
            >
              {status.enabled ? "Retirar" : "Publicar"}
            </Button>
          )}
        </>
      }
    >
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Badge tone={status.enabled ? "success" : "neutral"}>
          {status.enabled ? "Publicada" : "Não publicada"}
        </Badge>
        {status.updatedAt
          ? `${status.enabled ? "Publicada" : "Retirada"} por ${status.updatedByName ?? "—"} em ${formatDateTime(status.updatedAt)}.`
          : "Só a gestão e os aprovadores veem por enquanto."}
      </p>
      <ConfirmModal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={
          next ? "Publicar prestação de contas" : "Retirar prestação de contas"
        }
        confirmLabel={next ? "Publicar" : "Retirar"}
        tone={next ? "neutral" : "danger"}
        pending={pending}
        onConfirm={() => void toggle()}
      >
        {next
          ? "Todos os moradores passam a ver, em Compras, o gasto por categoria e por mês e as compras concluídas (fornecedor, valor e número de cotações)."
          : "Os moradores deixam de ver a prestação de contas. A gestão e os aprovadores continuam vendo."}
      </ConfirmModal>
    </SectionCard>
  );
}
