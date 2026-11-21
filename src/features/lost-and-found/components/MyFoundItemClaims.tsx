"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, HandHelping, XCircle } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  buttonClasses,
  Card,
  EmptyState,
  Modal,
  type Tone,
} from "@/design-system";
import { lostAndFoundClient } from "@/features/lost-and-found/api/lost-and-found.client";
import { FOUND_ITEM_CATEGORY_ICONS } from "@/features/lost-and-found/model/found-item-icons";
import {
  FOUND_ITEM_CATEGORY_LABELS,
  myClaimView,
} from "@/features/lost-and-found/model/found-item-labels";
import type { FoundItemClaim } from "@/shared/contracts/lost-and-found";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatDateTime } from "@/shared/lib/datetime";
import { useToast } from "@/shared/toast/useToast";

/** The status box takes the claim's tone (neutral reads as information). */
const ALERT_TONES: Record<Tone, "info" | "success" | "warning" | "danger"> = {
  accent: "info",
  brand: "info",
  info: "info",
  neutral: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
};

// The resident's claims, newest first, two per row on wide screens: the
// item with its category, where the claim stands (in the colour of its
// state), cancelling one still waiting and, once handed back, the receipt.
export function MyFoundItemClaims({ claims }: { claims: FoundItemClaim[] }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [withdrawing, setWithdrawing] = useState<FoundItemClaim | null>(null);
  const [sending, setSending] = useState(false);

  async function withdraw() {
    if (!withdrawing) return;
    setSending(true);
    try {
      await lostAndFoundClient.withdraw(withdrawing.id);
      showSuccess("Pedido cancelado.");
      setWithdrawing(null);
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível cancelar o pedido.",
      );
    } finally {
      setSending(false);
    }
  }

  if (claims.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<HandHelping className="size-5" />}
          title="Nenhum pedido"
          description="Viu um item seu entre os achados? Toque em “É meu” e retire na portaria com um documento."
          action={
            <Link
              href="/achados-e-perdidos"
              className={buttonClasses("brand", "sm")}
            >
              Ver itens achados
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {claims.map((claim) => {
          const view = myClaimView(claim);
          const Icon = FOUND_ITEM_CATEGORY_ICONS[claim.itemCategory];
          const receipt =
            claim.status === "ACCEPTED" && claim.itemStatus === "RETURNED";
          const cancellable =
            claim.status === "PENDING" && claim.itemStatus === "FOUND";
          const facts = [
            {
              label: "Categoria",
              value: FOUND_ITEM_CATEGORY_LABELS[claim.itemCategory],
            },
            { label: "Pedido em", value: formatDateTime(claim.createdAt) },
            {
              label: "Respondido",
              value: claim.decidedAt
                ? `${formatDateTime(claim.decidedAt)}${claim.decidedByName ? ` por ${claim.decidedByName}` : ""}`
                : null,
            },
          ].filter((fact) => fact.value);

          return (
            <Card key={claim.id} className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-brand-fg shadow-sm">
                  <Icon aria-hidden className="size-7" />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="leading-snug font-semibold break-words text-fg">
                    {claim.itemTitle}
                  </p>
                  <Badge tone={view.tone}>{view.label}</Badge>
                </div>
              </div>

              <Alert tone={ALERT_TONES[view.tone]}>{view.hint}</Alert>

              {claim.message && (
                <div className="rounded-xl border border-border bg-surface-muted/60 p-3">
                  <p className="text-xs text-soft">O que você contou</p>
                  <p className="mt-0.5 text-[13px] break-words text-fg">
                    {claim.message}
                  </p>
                </div>
              )}

              <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                {facts.map((fact) => (
                  <div key={fact.label} className="min-w-0">
                    <dt className="text-xs text-soft">{fact.label}</dt>
                    <dd className="break-words text-fg">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/achados-e-perdidos/${claim.itemId}`}
                  className="inline-flex shrink-0 items-center justify-center gap-1 text-sm font-semibold text-brand-ink hover:underline"
                >
                  {receipt ? "Ver comprovante" : "Ver detalhes"}
                  <ChevronRight aria-hidden className="size-4" />
                </Link>
                {cancellable && (
                  <Button
                    size="sm"
                    variant="cancel"
                    className="w-full justify-center sm:w-auto"
                    icon={<XCircle className="size-4" />}
                    onClick={() => setWithdrawing(claim)}
                  >
                    Cancelar pedido
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <Modal
        open={withdrawing !== null}
        onClose={() => setWithdrawing(null)}
        busy={sending}
        tone="danger"
        icon={<XCircle className="size-5" />}
        title="Cancelar pedido"
        footer={
          <>
            <Button
              variant="cancel"
              onClick={() => setWithdrawing(null)}
              disabled={sending}
            >
              Voltar
            </Button>
            <Button
              variant="danger"
              loading={sending}
              onClick={() => void withdraw()}
            >
              Cancelar pedido
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          A portaria deixa de esperar você para “{withdrawing?.itemTitle}”. Você
          pode pedir de novo depois.
        </p>
      </Modal>
    </>
  );
}
