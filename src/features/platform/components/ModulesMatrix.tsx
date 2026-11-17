"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@/design-system";
import { condominiumsClient } from "@/features/condominiums/api/condominiums.client";
import { APP_MODULES } from "@/features/condominiums/model/app-modules";
import type { AppModule, Condominium } from "@/shared/contracts/condominiums";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

// Who contracted what (Plataforma, Módulos): a row per condominium, a
// switch per module. Each switch saves on its own; turning a module off
// keeps its data and only closes its menu and pages.
export function ModulesMatrix({
  condominiums,
}: {
  condominiums: Condominium[];
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [modules, setModules] = useState<Record<string, AppModule[]>>(() =>
    Object.fromEntries(condominiums.map((item) => [item.id, item.modules])),
  );
  const [saving, setSaving] = useState<string | null>(null);

  async function toggle(
    condominium: Condominium,
    module: AppModule,
    label: string,
    on: boolean,
  ) {
    const key = `${condominium.id}:${module}`;
    setSaving(key);
    try {
      const updated = await condominiumsClient.setModule(
        condominium.id,
        module,
        on,
      );
      setModules((current) => ({
        ...current,
        [condominium.id]: updated.modules,
      }));
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

  const totals = APP_MODULES.map(
    (item) =>
      condominiums.filter((condominium) =>
        (modules[condominium.id] ?? []).includes(item.module),
      ).length,
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="px-4 py-3 font-semibold">Condomínio</th>
            {APP_MODULES.map((item, index) => (
              <th key={item.module} className="px-4 py-3 text-center">
                <span className="inline-flex items-center gap-1.5 font-semibold text-fg">
                  {item.icon}
                  {item.label}
                </span>
                <span className="block text-[11px] font-normal">
                  {totals[index]} de {condominiums.length}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {condominiums.map((condominium) => (
            <tr key={condominium.id}>
              <td className="px-4 py-3">
                <Link
                  href={`/administracao/condominios/${condominium.id}`}
                  className="font-semibold text-fg hover:underline"
                >
                  {condominium.name}
                </Link>
                <span className="block text-xs text-soft">
                  {condominium.city}/{condominium.state}
                  {condominium.status === "SUSPENDED" ? " · suspenso" : ""}
                </span>
              </td>
              {APP_MODULES.map((item) => {
                const key = `${condominium.id}:${item.module}`;
                const on = (modules[condominium.id] ?? []).includes(
                  item.module,
                );
                return (
                  <td key={item.module} className="px-4 py-3 text-center">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        className="size-4 accent-[var(--accent)]"
                        checked={on}
                        disabled={saving !== null}
                        aria-label={`${item.label} em ${condominium.name}`}
                        onChange={(change) =>
                          toggle(
                            condominium,
                            item.module,
                            item.label,
                            change.target.checked,
                          )
                        }
                      />
                      {saving === key && <Spinner size="sm" label="Salvando" />}
                    </label>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
