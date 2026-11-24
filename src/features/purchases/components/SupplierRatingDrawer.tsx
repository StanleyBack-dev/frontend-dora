"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Star } from "lucide-react";
import {
  Button,
  cn,
  CollapsibleSection,
  Drawer,
  DrawerActions,
  TextArea,
} from "@/design-system";
import { purchaseOrdersClient } from "@/features/purchases/api/purchase-orders.client";
import { MAX_RATING_COMMENT } from "@/features/purchases/model/order-labels";
import type { PurchaseOrderRating } from "@/shared/contracts/purchase-orders";
import { errorMessage } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

const WORDS = ["Péssimo", "Ruim", "Regular", "Bom", "Ótimo"];

/**
 * Rates the supplier of a completed purchase, in a drawer: 1 to 5 stars
 * (deadline, quality, service) and a comment. Rating again replaces it; it
 * counts in the supplier's average.
 */
export function SupplierRatingDrawer({
  requestId,
  supplierName,
  rating,
  onClose,
}: {
  requestId: string;
  supplierName: string;
  rating: PurchaseOrderRating | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [stars, setStars] = useState(rating?.rating ?? 0);
  const [comment, setComment] = useState(rating?.comment ?? "");
  const [tried, setTried] = useState(false);
  const [pending, setPending] = useState(false);

  async function save() {
    setTried(true);
    if (stars < 1) return;
    setPending(true);
    try {
      await purchaseOrdersClient.rate(requestId, stars, comment.trim() || null);
      showSuccess("Avaliação salva.", `Conta na média de ${supplierName}.`);
      onClose();
      router.refresh();
    } catch (cause) {
      showError(errorMessage(cause, "Não foi possível salvar a avaliação."));
      setPending(false);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title="Avaliar fornecedor"
      subtitle={`Como foi comprar de ${supplierName}: prazo, qualidade e atendimento.`}
      busy={pending}
      footer={
        <DrawerActions>
          <Button variant="cancel" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={<Star className="size-4" />}
            loading={pending}
            onClick={() => void save()}
          >
            Salvar avaliação
          </Button>
        </DrawerActions>
      }
    >
      <div className="space-y-4">
        <CollapsibleSection icon={<Star />} title="Nota">
          <div
            role="radiogroup"
            aria-label="Nota de 1 a 5 estrelas"
            className="flex flex-wrap items-center gap-1"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={stars === value}
                aria-label={`${value} de 5 (${WORDS[value - 1]})`}
                className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-brand"
                onClick={() => setStars(value)}
              >
                <Star
                  aria-hidden
                  className={cn(
                    "size-8",
                    value <= stars
                      ? "fill-warning text-warning"
                      : "text-border-strong",
                  )}
                />
              </button>
            ))}
            {stars > 0 && (
              <span className="ml-2 text-sm font-medium text-fg">
                {WORDS[stars - 1]}
              </span>
            )}
          </div>
          {tried && stars < 1 && (
            <p className="mt-1 text-[11px] font-medium text-danger">
              Escolha de 1 a 5 estrelas.
            </p>
          )}
        </CollapsibleSection>
        <CollapsibleSection
          icon={<MessageSquare />}
          title="Comentário (opcional)"
        >
          <TextArea
            label="Comentário"
            hideLabel
            rows={3}
            maxLength={MAX_RATING_COMMENT}
            placeholder="Ex.: entregou no prazo, mas uma peça veio com defeito e foi trocada."
            value={comment}
            hint={`${comment.length}/${MAX_RATING_COMMENT}`}
            onChange={(event) => setComment(event.target.value)}
          />
        </CollapsibleSection>
      </div>
    </Drawer>
  );
}
