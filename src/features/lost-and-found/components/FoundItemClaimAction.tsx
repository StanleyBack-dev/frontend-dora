"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandHelping, XCircle } from "lucide-react";
import { lostAndFoundClient } from "@/features/lost-and-found/api/lost-and-found.client";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";
import { Alert, Button } from "@/design-system";
import { ClaimFoundItemModal } from "@/features/lost-and-found/components/ClaimFoundItemModal";
import {
  canClaimAgain,
  myClaimView,
} from "@/features/lost-and-found/model/found-item-labels";
import type { KeptFoundItem } from "@/shared/contracts/lost-and-found";

// On an item's page, for a resident: where their claim stands (with the
// desk's answer) and, while the item is kept, "É meu" to claim it (again,
// after a rejection or a cancel).
export function FoundItemClaimAction({ item }: { item: KeptFoundItem }) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const claim = item.myClaim;
  const mine = claim ? myClaimView(claim) : null;
  const canClaim = item.status === "FOUND" && canClaimAgain(claim?.status);
  // Reserved by the desk for them (or their unit): they may say it is not.
  const reserved = item.status === "FOUND" && item.ownerUnitLabel !== null;
  const { showError, showSuccess } = useToast();
  const [releasing, setReleasing] = useState(false);

  async function notMine() {
    setReleasing(true);
    try {
      await lostAndFoundClient.release(item.id);
      showSuccess("Obrigado por avisar.", "A portaria foi avisada.");
      router.push("/achados-e-perdidos");
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível avisar a portaria.",
      );
    } finally {
      setReleasing(false);
    }
  }

  return (
    <div className="space-y-3">
      {claim && mine && (
        <Alert
          tone={
            mine.tone === "success"
              ? "success"
              : mine.tone === "danger"
                ? "danger"
                : "info"
          }
        >
          <strong>{mine.label}.</strong> {mine.hint}
        </Alert>
      )}
      {reserved && !claim && (
        <Alert tone="info">
          {item.ownerName
            ? "A portaria achou este item e sabe que é seu: retire lá com um documento."
            : `A portaria acredita que este item é de alguém da sua unidade (${item.ownerUnitLabel}). Se for seu, toque em “É meu” e retire lá com um documento.`}
        </Alert>
      )}
      {(canClaim || reserved) && (
        <div className="grid gap-2 sm:flex sm:justify-end">
          {reserved && (
            <Button
              variant="cancel"
              className="justify-center"
              loading={releasing}
              icon={<XCircle className="size-4" />}
              onClick={() => void notMine()}
            >
              {item.ownerName ? "Não é meu" : "Não é da minha unidade"}
            </Button>
          )}
          {canClaim && (
            <Button
              variant="brand"
              className="w-full justify-center sm:w-auto"
              icon={<HandHelping className="size-4" />}
              onClick={() => setClaiming(true)}
            >
              {claim ? "Pedir de novo" : "É meu"}
            </Button>
          )}
        </div>
      )}
      <ClaimFoundItemModal
        item={claiming ? item : null}
        onClose={() => setClaiming(false)}
        onDone={() => {
          setClaiming(false);
          router.refresh();
        }}
      />
    </div>
  );
}
