"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, PartyPopper } from "lucide-react";
import { Spinner } from "@/design-system";
import { condominiumsClient } from "@/features/condominiums/api/condominiums.client";
import type { AppModule, Condominium } from "@/shared/contracts/condominiums";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

const MODULES: {
  module: AppModule;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    module: "BOOKINGS",
    label: "Reservas",
    description:
      "Espaços reservados pelos moradores: aprovações, convidados com convite e taxas de uso.",
    icon: <CalendarDays aria-hidden className="size-4" />,
  },
  {
    module: "EVENTS",
    label: "Eventos",
    description:
      "Eventos do condomínio com ingressos (gratuitos ou pagos por Pix) e entrada por QR code.",
    icon: <PartyPopper aria-hidden className="size-4" />,
  },
];

// The optional modules a condominium contracted apart (platform only).
// Each switch saves on its own; turning one off keeps its data and only
// closes its menu and pages.
export function CondominiumModules({
  condominium,
}: {
  condominium: Condominium;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [enabled, setEnabled] = useState<AppModule[]>(condominium.modules);
  const [saving, setSaving] = useState<AppModule | null>(null);

  async function toggle(module: AppModule, label: string, on: boolean) {
    setSaving(module);
    try {
      const updated = await condominiumsClient.setModule(
        condominium.id,
        module,
        on,
      );
      setEnabled(updated.modules);
      showSuccess(
        on
          ? `${label} ligado para ${condominium.name}.`
          : `${label} desligado para ${condominium.name}.`,
      );
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível mudar o módulo.",
      );
    }
    setSaving(null);
  }

  return (
    <fieldset className="space-y-2 border-t border-border pt-4">
      <legend className="text-sm font-semibold text-fg">
        Módulos contratados
      </legend>
      <p className="text-xs text-soft">
        Cobrados à parte. Desligar não apaga nada: só fecha o menu e as páginas
        do módulo.
      </p>
      {MODULES.map((item) => {
        const on = enabled.includes(item.module);
        return (
          <label
            key={item.module}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
          >
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-[var(--accent)]"
              checked={on}
              disabled={saving !== null}
              onChange={(change) =>
                toggle(item.module, item.label, change.target.checked)
              }
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                {item.icon}
                {item.label}
                {saving === item.module && (
                  <Spinner size="sm" label="Salvando" />
                )}
              </span>
              <span className="block text-xs text-muted">
                {item.description}
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
