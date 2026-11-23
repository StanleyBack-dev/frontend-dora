"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Calculator, RotateCcw, Scale } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  buttonClasses,
} from "@/design-system";
import { purchaseQuotesClient } from "@/features/purchases/api/purchase-quotes.client";
import { ChooseQuoteModal } from "@/features/purchases/components/ChooseQuoteModal";
import { QuoteComparison } from "@/features/purchases/components/QuoteComparison";
import { ShareQuoteMapMenu } from "@/features/purchases/components/ShareQuoteMapMenu";
import { quoteMapFileName } from "@/features/purchases/model/quote-share";
import { ReceiptPdfButton } from "@/features/signature/components/ReceiptPdfButton";
import {
  MIN_QUOTES,
  type PurchaseQuote,
} from "@/shared/contracts/purchase-quotes";
import type { PurchaseRequest } from "@/shared/contracts/purchase-requests";
import { errorMessage } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";
import { isApprovedOrLater } from "@/features/purchases/model/request-labels";

/**
 * The quotes of a request, for the management: "Adicionar cotação" while
 * it waits for or is in quotes, the comparison map (screen and PDF), edit
 * and remove while in quotes, and "Escolher" to pick the winner (the
 * request then waits for the approval); then "Reabrir cotações" undoes it.
 */
export function QuotesPanel({
  request,
  quotes,
  canManage,
}: {
  request: PurchaseRequest;
  quotes: PurchaseQuote[];
  /** Works the quotes (add, edit, choose, reopen); otherwise read only. */
  canManage: boolean;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [choosing, setChoosing] = useState<PurchaseQuote | null>(null);
  const [removing, setRemoving] = useState<PurchaseQuote | null>(null);
  const [reopening, setReopening] = useState(false);
  const [pending, setPending] = useState(false);

  const canAdd =
    canManage && (request.status === "OPEN" || request.status === "QUOTING");
  const editable = canManage && request.status === "QUOTING";
  const reopenable = canManage && request.status === "AWAITING_APPROVAL";
  const hasApproval =
    request.status === "AWAITING_APPROVAL" ||
    isApprovedOrLater(request.status) ||
    request.status === "REJECTED";
  const done = () => {
    setChoosing(null);
    setRemoving(null);
    setReopening(false);
    router.refresh();
  };

  async function remove() {
    if (!removing) return;
    setPending(true);
    try {
      await purchaseQuotesClient.remove(removing.id);
      showSuccess("Cotação removida.");
      done();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível remover a cotação."));
    } finally {
      setPending(false);
    }
  }

  async function reopen() {
    setPending(true);
    try {
      await purchaseQuotesClient.reopen(request.id);
      showSuccess("Cotações reabertas.", "Escolha outra ou ajuste os preços.");
      done();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível reabrir as cotações."));
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="overflow-visible">
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
          <Scale aria-hidden className="size-4 text-soft" />
          Cotações ({quotes.length})
        </h2>
        <p className="text-xs text-muted">
          Recomendado: ao menos {MIN_QUOTES} cotações. Escolher outra que não a
          mais barata pede justificativa.
        </p>
      </div>
      {(quotes.length > 0 || reopenable || canAdd || hasApproval) && (
        /**
         * As the desks: the document actions on the left (PDF, share), the
         * page's main action on the right; on phones the main one on top.
         */
        <div className="flex flex-col-reverse gap-2 border-b border-border bg-surface-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {quotes.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <ReceiptPdfButton
                path={`/purchases/requests/${request.id}/quote-map`}
                fallbackName={quoteMapFileName(request)}
                label="Mapa em PDF"
                variant="brand"
                className="w-full justify-center sm:w-auto"
              />
              <ShareQuoteMapMenu
                request={request}
                quotes={quotes}
                className="w-full sm:w-auto"
              />
            </div>
          ) : (
            <span className="hidden sm:block" />
          )}
          <div className="grid gap-2 sm:flex">
            {hasApproval && (
              <Link
                href={`/compras/aprovacoes/${request.id}`}
                className={buttonClasses("secondary")}
              >
                <BadgeCheck aria-hidden className="size-4" />
                Ver aprovação
              </Link>
            )}
            {reopenable && (
              <Button
                variant="secondary"
                className="justify-center"
                icon={<RotateCcw className="size-4" />}
                onClick={() => setReopening(true)}
              >
                Reabrir cotações
              </Button>
            )}
            {canAdd && (
              <Link
                href={`/compras/cotacoes/${request.id}/nova`}
                className={buttonClasses("primary")}
              >
                <Calculator aria-hidden className="size-4" />
                Adicionar cotação
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4 p-4 sm:p-6">
        {hasApproval && (
          <Alert
            tone={
              isApprovedOrLater(request.status)
                ? "success"
                : request.status === "REJECTED"
                  ? "danger"
                  : "warning"
            }
          >
            <strong>
              {isApprovedOrLater(request.status)
                ? "Compra aprovada."
                : request.status === "REJECTED"
                  ? "Compra reprovada."
                  : "Aguardando aprovação."}
            </strong>{" "}
            {request.status === "AWAITING_APPROVAL"
              ? "A cotação escolhida espera a decisão de quem aprova as compras."
              : "As cotações ficam aqui para consulta."}{" "}
            <Link
              href={`/compras/aprovacoes/${request.id}`}
              className="font-semibold underline"
            >
              Ver aprovação
            </Link>
          </Alert>
        )}
        {request.chosenQuoteId && request.choiceJustification && (
          <Alert tone="info">
            <strong>Justificativa da escolha:</strong>{" "}
            {request.choiceJustification}
          </Alert>
        )}
        {quotes.length === 0 ? (
          <EmptyState
            icon={<Scale className="size-5" />}
            title="Nenhuma cotação ainda"
            description={
              canAdd
                ? "Registre o preço de cada fornecedor com “Adicionar cotação”: a solicitação passa para “Em cotação”."
                : "Esta solicitação não recebeu cotações."
            }
          />
        ) : (
          <QuoteComparison
            request={request}
            quotes={quotes}
            actions={{
              editable,
              choosable: editable,
              onEdit: (quote) =>
                router.push(
                  `/compras/cotacoes/${request.id}/${quote.id}/editar`,
                ),
              onRemove: setRemoving,
              onChoose: setChoosing,
            }}
          />
        )}
      </div>

      {choosing && (
        <ChooseQuoteModal
          quote={choosing}
          total={quotes.length}
          onClose={() => setChoosing(null)}
          onDone={() => {
            setChoosing(null);
            router.push(`/compras/aprovacoes/${request.id}`);
          }}
        />
      )}
      <ConfirmModal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remover cotação"
        confirmLabel="Remover"
        pending={pending}
        onConfirm={remove}
      >
        {`A cotação de ${removing?.supplierName ?? "o fornecedor"} sai do mapa${quotes.length === 1 ? " e a solicitação volta a aguardar cotação" : ""}.`}
      </ConfirmModal>
      <ConfirmModal
        open={reopening}
        onClose={() => setReopening(false)}
        title="Reabrir cotações"
        confirmLabel="Reabrir cotações"
        tone="neutral"
        pending={pending}
        onConfirm={reopen}
      >
        A escolha é desfeita e a solicitação volta para “Em cotação”: dá para
        ajustar as cotações e escolher de novo.
      </ConfirmModal>
    </Card>
  );
}
