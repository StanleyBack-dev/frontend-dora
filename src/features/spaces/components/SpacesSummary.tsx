import { CircleCheck, ShieldCheck, Trees, Wrench } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { Space } from "@/shared/contracts/spaces";

// The numbers of the condominium's spaces (from every space the API
// listed): how many, open to bookings, under maintenance and how many need
// the managers' approval.
export function SpacesSummary({
  spaces,
}: {
  spaces: Pick<Space, "active" | "rules">[];
}) {
  const active = spaces.filter((space) => space.active).length;
  const approval = spaces.filter(
    (space) => space.active && space.rules.requiresApproval,
  ).length;
  return (
    <StatGrid>
      <StatCard
        label="Espaços"
        value={String(spaces.length)}
        icon={<Trees />}
      />
      <StatCard
        label="Disponíveis"
        value={String(active)}
        icon={<CircleCheck />}
        tone="success"
      />
      <StatCard
        label="Em manutenção"
        value={String(spaces.length - active)}
        icon={<Wrench />}
        tone={spaces.length - active > 0 ? "warning" : "neutral"}
      />
      <StatCard
        label="Com aprovação"
        value={String(approval)}
        hint="reservas aprovadas pela gestão"
        icon={<ShieldCheck />}
        tone="info"
      />
    </StatGrid>
  );
}
