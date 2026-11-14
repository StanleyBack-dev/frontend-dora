import { Card, CardBody, CardHeader } from "@/design-system";
import { ColumnChart } from "@/features/platform-metrics/components/ColumnChart";
import { RankBars } from "@/features/platform-metrics/components/RankBars";
import {
  WEEKDAY_NAMES,
  WEEKDAYS,
  hourLabel,
  hourTitle,
} from "@/features/platform-metrics/model/metrics-labels";
import type { PlatformMetrics } from "@/shared/contracts/platform-metrics";
import { formatNumber } from "@/shared/lib/format";

const hours = (value: number) =>
  `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)} h`;

// How the spaces are used: the most and least booked, and when people book
// (weekday and starting hour, active bookings only).
export function SpacesSection({
  spaces,
  allCondominiums,
}: {
  spaces: PlatformMetrics["spaces"];
  allCondominiums: boolean;
}) {
  // Every hour from the first to the last booked one, empty ones included,
  // so the columns keep their place on the clock.
  const booked = new Map(spaces.byHour.map((row) => [row.hour, row.bookings]));
  const first = spaces.byHour[0]?.hour ?? 0;
  const last = spaces.byHour.at(-1)?.hour ?? 0;
  const hourPoints = Array.from({ length: last - first + 1 }, (_, i) => {
    const hour = first + i;
    return {
      key: String(hour),
      axis: hourLabel(hour),
      title: hourTitle(hour),
      value: booked.get(hour) ?? 0,
    };
  });

  return (
    <section aria-labelledby="painel-espacos" className="space-y-4">
      <h2 id="painel-espacos" className="text-base font-bold text-fg">
        Uso dos espaços
        <span className="ml-2 text-sm font-normal text-muted">
          {formatNumber(spaces.activeSpaces)}{" "}
          {spaces.activeSpaces === 1 ? "espaço ativo" : "espaços ativos"}
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader
            title="Espaços mais reservados"
            description="Reservas ativas no período e as horas reservadas."
          />
          <CardBody className="pt-0">
            <RankBars
              emptyText="Nenhum espaço reservado no período."
              items={spaces.mostUsed.map((space) => ({
                key: space.spaceId,
                name: space.name,
                hint: allCondominiums ? space.condominiumName : undefined,
                value: space.bookings,
                note: hours(space.hours),
              }))}
            />
          </CardBody>
        </Card>
        <Card className="min-w-0">
          <CardHeader
            title="Espaços sem reservas"
            description={
              spaces.unusedCount === 0
                ? "Todos os espaços ativos tiveram reservas."
                : `${formatNumber(spaces.unusedCount)} espaço${spaces.unusedCount === 1 ? "" : "s"} ativo${spaces.unusedCount === 1 ? "" : "s"} sem nenhuma reserva no período.`
            }
          />
          {spaces.unused.length > 0 && (
            <CardBody className="pt-0">
              <ul className="divide-y divide-border text-sm">
                {spaces.unused.map((space) => (
                  <li
                    key={space.spaceId}
                    className="flex justify-between gap-3 py-2"
                  >
                    <span className="min-w-0 truncate font-medium text-fg">
                      {space.name}
                    </span>
                    {allCondominiums && (
                      <span className="shrink-0 truncate text-muted">
                        {space.condominiumName}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardBody>
          )}
        </Card>
        <Card className="min-w-0">
          <CardHeader
            title="Por dia da semana"
            description="Em que dias os moradores mais reservam."
          />
          <CardBody className="pt-0">
            <ColumnChart
              label="Reservas por dia da semana"
              unit={["reserva", "reservas"]}
              emptyText="Nenhuma reserva ativa no período."
              points={spaces.byWeekday.map((row) => ({
                key: String(row.weekday),
                axis: WEEKDAYS[row.weekday] ?? "",
                title: WEEKDAY_NAMES[row.weekday] ?? "",
                value: row.bookings,
              }))}
            />
          </CardBody>
        </Card>
        <Card className="min-w-0">
          <CardHeader
            title="Por horário"
            description="Pelo horário de início da reserva."
          />
          <CardBody className="pt-0">
            <ColumnChart
              label="Reservas por horário de início"
              unit={["reserva", "reservas"]}
              emptyText="Nenhuma reserva ativa no período."
              points={hourPoints}
            />
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
