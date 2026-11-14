import { CalendarCheck, CalendarClock, CalendarX2, Clock } from "lucide-react";
import { Card, CardBody, CardHeader, StatCard } from "@/design-system";
import { ColumnChart } from "@/features/platform-metrics/components/ColumnChart";
import { RankBars } from "@/features/platform-metrics/components/RankBars";
import {
  bucketLabel,
  bucketTitle,
  percent,
} from "@/features/platform-metrics/model/metrics-labels";
import type { PlatformMetrics } from "@/shared/contracts/platform-metrics";
import { formatNumber } from "@/shared/lib/format";

const SERIES_TITLE = {
  DAY: "Reservas por dia",
  WEEK: "Reservas por semana",
  MONTH: "Reservas por mês",
} as const;

const plural = (count: number, one: string, many: string) =>
  `${formatNumber(count)} ${count === 1 ? one : many}`;

const cancelledNote = (count: number) =>
  count === 0
    ? undefined
    : `${formatNumber(count)} cancelada${count === 1 ? "" : "s"}`;

// Bookings whose slot falls in the period: totals, the series and the
// condominiums that book the most.
export function BookingsSection({
  bookings,
  allCondominiums,
}: {
  bookings: PlatformMetrics["bookings"];
  /** No condominium filter: the ranking by condominium makes sense. */
  allCondominiums: boolean;
}) {
  const decided = bookings.total - bookings.pending;
  return (
    <section aria-labelledby="painel-reservas" className="space-y-4">
      <h2 id="painel-reservas" className="text-base font-bold text-fg">
        Reservas
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Reservas no período"
          value={formatNumber(bookings.total)}
          hint={plural(bookings.confirmed, "confirmada", "confirmadas")}
          icon={<CalendarCheck />}
          tone="brand"
        />
        <StatCard
          label="Cancelamentos"
          value={percent(bookings.cancelled, bookings.total)}
          hint={plural(bookings.cancelled, "cancelada", "canceladas")}
          icon={<CalendarX2 />}
          tone="neutral"
        />
        <StatCard
          label="Recusas"
          value={percent(bookings.rejected, decided)}
          hint={`${plural(bookings.rejected, "recusada", "recusadas")} das decididas`}
          icon={<CalendarClock />}
          tone="neutral"
        />
        <StatCard
          label="Aprovação atrasada"
          value={formatNumber(bookings.stalePending)}
          hint="Pendentes há mais de 48 h"
          icon={<Clock />}
          tone={bookings.stalePending > 0 ? "warning" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="min-w-0">
          <CardHeader
            title={SERIES_TITLE[bookings.granularity]}
            description="Pelo dia do horário reservado, em qualquer situação."
          />
          <CardBody className="pt-0">
            <ColumnChart
              label={SERIES_TITLE[bookings.granularity]}
              unit={["reserva", "reservas"]}
              detailLabel="Canceladas"
              emptyText="Nenhuma reserva no período."
              points={bookings.series.map((point) => ({
                key: point.bucket,
                axis: bucketLabel(point.bucket, bookings.granularity),
                title: bucketTitle(point.bucket, bookings.granularity),
                value: point.total,
                detail: cancelledNote(point.cancelled),
              }))}
            />
          </CardBody>
        </Card>
        {allCondominiums && (
          <Card className="min-w-0">
            <CardHeader
              title="Condomínios que mais reservam"
              description="Os 10 com mais reservas no período."
            />
            <CardBody className="pt-0">
              <RankBars
                emptyText="Nenhuma reserva no período."
                items={bookings.byCondominium.map((item) => ({
                  key: item.condominiumId,
                  name: item.name,
                  value: item.total,
                  note: cancelledNote(item.cancelled),
                }))}
              />
            </CardBody>
          </Card>
        )}
      </div>
    </section>
  );
}
