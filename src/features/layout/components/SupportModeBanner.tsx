"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LifeBuoy, LogOut } from "lucide-react";
import { Button } from "@/design-system";
import { condominiumsClient } from "@/features/condominiums/api/condominiums.client";
import { ApiClientError } from "@/shared/lib/api-client";
import { startNavigation } from "@/shared/lib/navigation-progress";
import { useToast } from "@/shared/toast/useToast";

// The platform administrator inside a condominium they are not a member of
// (support mode): a band over every page says so and leads back to the
// platform, leaving the condominium.
export function SupportModeBanner({
  condominiumName,
}: {
  condominiumName: string;
}) {
  const router = useRouter();
  const { showError } = useToast();
  const [leaving, setLeaving] = useState(false);

  async function leave() {
    setLeaving(true);
    try {
      await condominiumsClient.switchTo(null);
      startNavigation();
      router.push("/plataforma");
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível voltar à plataforma.",
      );
      setLeaving(false);
    }
  }

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-warning-border bg-warning-soft px-4 py-2 text-sm text-fg sm:px-6 lg:px-10"
    >
      <LifeBuoy aria-hidden className="size-4 shrink-0 text-warning" />
      <span className="min-w-0 flex-1">
        Você está em <strong>{condominiumName}</strong> pela administração do
        Dora (modo suporte): o que fizer aqui vale para o condomínio.
      </span>
      <Button
        size="sm"
        variant="secondary"
        icon={<LogOut className="size-3.5" />}
        loading={leaving}
        onClick={leave}
      >
        Voltar à plataforma
      </Button>
    </div>
  );
}
