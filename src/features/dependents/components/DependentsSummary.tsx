import { CircleCheck, Clock, UserX, Users } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { DependentReviewOverview } from "@/shared/contracts/dependents";

// The numbers of the dependents, whatever the filters (counted by the API):
// how many, waiting for a decision, approved and refused.
export function DependentsSummary({
  overview,
}: {
  overview: Pick<DependentReviewOverview, "pending" | "approved" | "rejected">;
}) {
  const { pending, approved, rejected } = overview;
  return (
    <StatGrid>
      <StatCard
        label="Dependentes"
        value={String(pending + approved + rejected)}
        icon={<Users />}
      />
      <StatCard
        label="Para aprovar"
        value={String(pending)}
        icon={<Clock />}
        tone={pending > 0 ? "warning" : "neutral"}
      />
      <StatCard
        label="Aprovados"
        value={String(approved)}
        icon={<CircleCheck />}
        tone="success"
      />
      <StatCard
        label="Recusados"
        value={String(rejected)}
        icon={<UserX />}
        tone="neutral"
      />
    </StatGrid>
  );
}
