import { Activity, UserPlus, Users, UsersRound } from "lucide-react";
import { Card, CardBody, CardHeader, StatCard } from "@/design-system";
import { percent } from "@/features/platform-metrics/model/metrics-labels";
import type { PlatformMetrics } from "@/shared/contracts/platform-metrics";
import { formatDate, formatNumber } from "@/shared/lib/format";

// Residents and access: who uses the app, who arrived in the period, and the
// condominiums nobody opened for a month.
export function EngagementSection({
  engagement,
  allCondominiums,
}: {
  engagement: PlatformMetrics["engagement"];
  allCondominiums: boolean;
}) {
  return (
    <section aria-labelledby="painel-moradores" className="space-y-4">
      <h2 id="painel-moradores" className="text-base font-bold text-fg">
        Moradores
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Pessoas com acesso"
          value={formatNumber(engagement.members)}
          hint="Moradores e gestores"
          icon={<Users />}
          tone="neutral"
        />
        <StatCard
          label="Ativos em 7 dias"
          value={formatNumber(engagement.active7d)}
          hint={`${percent(engagement.active7d, engagement.members)} entraram no app`}
          icon={<Activity />}
          tone="brand"
        />
        <StatCard
          label="Ativos em 30 dias"
          value={formatNumber(engagement.active30d)}
          hint={`${percent(engagement.active30d, engagement.members)} entraram no app`}
          icon={<Activity />}
          tone="neutral"
        />
        <StatCard
          label="Novos no período"
          value={formatNumber(engagement.newMembers)}
          hint={`${formatNumber(engagement.enrollments)} cadastro${engagement.enrollments === 1 ? "" : "s"} pelo link`}
          icon={<UserPlus />}
          tone="neutral"
        />
      </div>
      {allCondominiums && (
        <Card>
          <CardHeader
            title="Condomínios parados"
            description={
              engagement.inactiveCount === 0
                ? "Todos os condomínios ativos tiveram acessos nos últimos 30 dias."
                : `${formatNumber(engagement.inactiveCount)} condomínio${engagement.inactiveCount === 1 ? "" : "s"} sem nenhum acesso nos últimos 30 dias.`
            }
            action={<UsersRound aria-hidden className="size-5 text-soft" />}
          />
          {engagement.inactiveCondominiums.length > 0 && (
            <CardBody className="pt-0">
              <ul className="divide-y divide-border text-sm">
                {engagement.inactiveCondominiums.map((item) => (
                  <li
                    key={item.condominiumId}
                    className="flex justify-between gap-3 py-2"
                  >
                    <span className="min-w-0 truncate font-medium text-fg">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-muted">
                      {item.lastActivityAt
                        ? `Último acesso em ${formatDate(item.lastActivityAt)}`
                        : "Ninguém entrou ainda"}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          )}
        </Card>
      )}
    </section>
  );
}
