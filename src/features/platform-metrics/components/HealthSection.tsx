import Link from "next/link";
import { ChevronRight, CircleAlert, CircleCheck } from "lucide-react";
import { Card, cn } from "@/design-system";
import type { PlatformMetrics } from "@/shared/contracts/platform-metrics";
import { formatNumber } from "@/shared/lib/format";

type Item = {
  key: keyof PlatformMetrics["health"];
  label: string;
  /** Where to act on it. */
  href: string;
  /** Only the platform's: the outbox and support are not per condominium. */
  platformWide?: boolean;
};

const ITEMS: Item[] = [
  {
    key: "staleEnrollments",
    label: "Cadastros esperando análise há mais de 3 dias",
    href: "/condominios",
  },
  {
    key: "withoutManager",
    label: "Condomínios ativos sem gestor",
    href: "/condominios",
  },
  {
    key: "withoutUnits",
    label: "Condomínios ativos sem unidades",
    href: "/condominios",
  },
  {
    key: "openSupport",
    label: "Solicitações de suporte sem resposta",
    href: "/suporte",
  },
  {
    key: "delayedNotifications",
    label: "Avisos na fila há mais de 1 hora (e-mail com problema?)",
    href: "/admin/logs",
    platformWide: true,
  },
  {
    key: "failedNotifications",
    label: "Avisos que não puderam ser entregues",
    href: "/admin/logs",
    platformWide: true,
  },
];

// What needs attention now (not limited to the period): each line with an
// icon and a word for its state, never color alone, and a link to act on it.
export function HealthSection({
  health,
  allCondominiums,
}: {
  health: PlatformMetrics["health"];
  allCondominiums: boolean;
}) {
  const pending = ITEMS.filter((item) => health[item.key] > 0).length;
  return (
    <section aria-labelledby="painel-saude" className="space-y-4">
      <h2 id="painel-saude" className="text-base font-bold text-fg">
        Saúde da operação
        <span className="ml-2 text-sm font-normal text-muted">
          {pending === 0
            ? "Tudo em dia"
            : `${pending} ponto${pending === 1 ? "" : "s"} de atenção`}
        </span>
      </h2>
      <Card>
        <ul className="divide-y divide-border">
          {ITEMS.map((item) => {
            const count = health[item.key];
            const attention = count > 0;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-surface-muted sm:px-5"
                >
                  {attention ? (
                    <CircleAlert
                      aria-hidden
                      className="size-5 shrink-0 text-warning"
                    />
                  ) : (
                    <CircleCheck
                      aria-hidden
                      className="size-5 shrink-0 text-success"
                    />
                  )}
                  <span className="min-w-0 flex-1 text-fg">
                    {item.label}
                    {item.platformWide && !allCondominiums && (
                      <span className="ml-1.5 text-xs text-muted">
                        (toda a plataforma)
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-semibold tabular-nums",
                      attention ? "text-fg" : "text-muted",
                    )}
                  >
                    {attention ? formatNumber(count) : "Em dia"}
                  </span>
                  <ChevronRight
                    aria-hidden
                    className="size-4 shrink-0 text-soft"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}
