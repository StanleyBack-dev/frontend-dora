"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/design-system";
import { condominiumsClient } from "@/features/condominiums/api/condominiums.client";
import { ApiClientError } from "@/shared/lib/api-client";
import { startNavigation } from "@/shared/lib/navigation-progress";
import { useToast } from "@/shared/toast/useToast";

// Opens the condominium's management as the platform administrator (the
// session switches to it, then Gestão).
export function EnterCondominiumButton({
  condominiumId,
  current,
}: {
  condominiumId: string;
  /** Already the session's condominium. */
  current: boolean;
}) {
  const router = useRouter();
  const { showError } = useToast();
  const [entering, setEntering] = useState(false);

  async function enter() {
    setEntering(true);
    try {
      if (!current) await condominiumsClient.switchTo(condominiumId);
      startNavigation();
      router.push("/gestao");
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível entrar no condomínio.",
      );
      setEntering(false);
    }
  }

  return (
    <Button
      variant="brand"
      icon={<LogIn className="size-4" />}
      loading={entering}
      onClick={enter}
    >
      {current ? "Abrir a gestão" : "Entrar na gestão"}
    </Button>
  );
}
