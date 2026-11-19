import { Building, DoorClosed, Home, Users } from "lucide-react";
import { StatCard, StatGrid } from "@/design-system";
import type { Unit } from "@/shared/contracts/condominiums";

// The numbers of the condominium's units, whatever the filters (from every
// unit the API listed): how many, occupied, empty and the active residents.
export function UnitsSummary({
  units,
  house,
}: {
  units: Pick<Unit, "residents">[];
  house: boolean;
}) {
  const occupied = units.filter((unit) => unit.residents > 0).length;
  const residents = units.reduce((sum, unit) => sum + unit.residents, 0);
  return (
    <StatGrid>
      <StatCard
        label={house ? "Casas" : "Unidades"}
        value={String(units.length)}
        icon={<Building />}
      />
      <StatCard
        label="Ocupadas"
        value={String(occupied)}
        icon={<Home />}
        tone="success"
      />
      <StatCard
        label="Vazias"
        value={String(units.length - occupied)}
        icon={<DoorClosed />}
        tone="neutral"
      />
      <StatCard
        label="Moradores ativos"
        value={String(residents)}
        icon={<Users />}
        tone="info"
      />
    </StatGrid>
  );
}
