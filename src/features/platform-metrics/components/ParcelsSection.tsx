import { Clock, Package, Snowflake, Timer } from "lucide-react";
import { Card, CardBody, CardHeader, StatCard } from "@/design-system";
import {
  pickedUpNote,
  pickupTime,
} from "@/features/parcels/model/parcel-metrics";
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
  DAY: "Encomendas por dia",
  WEEK: "Encomendas por semana",
  MONTH: "Encomendas por mês",
} as const;

const plural = (count: number, one: string, many: string) =>
  `${formatNumber(count)} ${count === 1 ? one : many}`;

// Parcels (a module contracted apart): received in the period and how they
// ended, how long residents take to pick up, what waits now, the series and
// the condominiums that receive the most.
export function ParcelsSection({
  parcels,
  allCondominiums,
}: {
  parcels: PlatformMetrics["parcels"];
  /** No condominium filter: the ranking by condominium makes sense. */
  allCondominiums: boolean;
}) {
  return (
    <section aria-labelledby="painel-encomendas" className="space-y-4">
      <div>
        <h2 id="painel-encomendas" className="text-base font-bold text-fg">
          Encomendas
        </h2>
        <p className="text-[13px] text-muted">
          {parcels.condominiumsWithModule === 0
            ? "Nenhum condomínio com o módulo ligado."
            : `Módulo ligado em ${plural(parcels.condominiumsWithModule, "condomínio", "condomínios")}.`}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Recebidas no período"
          value={formatNumber(parcels.received)}
          hint={`${percent(parcels.pickedUp, parcels.received)} já retiradas`}
          icon={<Package />}
          tone="brand"
        />
        <StatCard
          label="Tempo médio até a retirada"
          value={pickupTime(parcels.averagePickupHours)}
          hint="Das retiradas no período"
          icon={<Timer />}
          tone="neutral"
        />
        <StatCard
          label="Aguardando agora"
          value={formatNumber(parcels.waitingNow)}
          hint={plural(
            parcels.stuckNow,
            "parada há mais de 3 dias",
            "paradas há mais de 3 dias",
          )}
          icon={<Clock />}
          tone={parcels.stuckNow > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Perecíveis no período"
          value={formatNumber(parcels.perishable)}
          hint={
            parcels.perishableOverdueNow > 0
              ? plural(
                  parcels.perishableOverdueNow,
                  "vencida agora",
                  "vencidas agora",
                )
              : "Nenhuma vencida agora"
          }
          icon={<Snowflake />}
          tone={parcels.perishableOverdueNow > 0 ? "danger" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="min-w-0">
          <CardHeader
            title={SERIES_TITLE[parcels.granularity]}
            description={`Pelo dia em que chegaram. ${plural(parcels.returned, "devolvida", "devolvidas")} e ${plural(parcels.cancelled, "cancelada", "canceladas")} no período.`}
          />
          <CardBody className="pt-0">
            <ColumnChart
              label={SERIES_TITLE[parcels.granularity]}
              unit={["encomenda", "encomendas"]}
              detailLabel="Já retiradas"
              emptyText="Nenhuma encomenda no período."
              points={parcels.series.map((point) => ({
                key: point.bucket,
                axis: bucketLabel(point.bucket, parcels.granularity),
                title: bucketTitle(point.bucket, parcels.granularity),
                value: point.received,
                detail: pickedUpNote(point.pickedUp),
              }))}
            />
          </CardBody>
        </Card>
        {allCondominiums && (
          <Card className="min-w-0">
            <CardHeader
              title="Condomínios que mais recebem"
              description="Os 10 com mais encomendas no período."
            />
            <CardBody className="pt-0">
              <RankBars
                emptyText="Nenhuma encomenda no período."
                items={parcels.byCondominium.map((item) => ({
                  key: item.condominiumId,
                  name: item.name,
                  value: item.received,
                  note: pickedUpNote(item.pickedUp),
                }))}
              />
            </CardBody>
          </Card>
        )}
      </div>
    </section>
  );
}
