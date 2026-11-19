import { CircleCheck, Clock, UserX, Users } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { MemberKind, MemberStats } from "@/shared/contracts/api";

// The numbers of a members page (Moradores or Equipe), whatever the
// filters (counted by the API): how many, active, deactivated and who never
// signed in to the app.
export function MembersSummary({
  kind,
  stats,
}: {
  kind: MemberKind;
  stats: MemberStats;
}) {
  return (
    <StatGrid>
      <StatCard
        label={kind === "EMPLOYEE" ? "Na equipe" : "Moradores"}
        value={String(stats.total)}
        icon={<Users />}
      />
      <StatCard
        label="Ativos"
        value={String(stats.active)}
        icon={<CircleCheck />}
        tone="success"
      />
      <StatCard
        label="Nunca acessaram"
        value={String(stats.neverSignedIn)}
        icon={<Clock />}
        tone={stats.neverSignedIn > 0 ? "warning" : "neutral"}
      />
      <StatCard
        label="Desativados"
        value={String(stats.inactive)}
        icon={<UserX />}
        tone="neutral"
      />
    </StatGrid>
  );
}
