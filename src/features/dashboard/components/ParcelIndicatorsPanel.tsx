import Link from "next/link";
import { Clock, Package, Snowflake, Timer } from "lucide-react";
import { Card, CardBody, CardHeader, StatCard } from "@/design-system";
import {
  pickedUpNote,
  pickupTime,
} from "@/features/parcels/model/parcel-metrics";
import { ColumnChart } from "@/features/platform-metrics/components/ColumnChart";
import type { ParcelIndicators } from "@/shared/contracts/dashboard";

/** "nov" from "2026-11" (the month's short name). */
const monthLabel = (month: string) =>
  new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
    .format(new Date(`${month}-01T12:00:00Z`))
    .replace(".", "");

/** "novembro de 2026" from "2026-11". */
const monthTitle = (month: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T12:00:00Z`));

// The parcels block of the management overview: what waits now, how long
// residents take to pick up, and the monthly volume (the shared column
// chart: tooltip, peak label and a table view).
export function ParcelIndicatorsPanel({
  indicators,
  canOpenDesk,
}: {
  indicators: ParcelIndicators;
  /** Links to the desk page only for who can open it. */
  canOpenDesk: boolean;
}) {
  const cards = [
    {
      href: "/encomendas",
      label: "Encomendas aguardando",
      value: String(indicators.waiting),
      hint:
        indicators.waiting > 0 ? "Na guarda do condomínio" : "Nada aguardando",
      icon: <Package className="size-5" />,
      tone:
        indicators.waiting > 0 ? ("warning" as const) : ("neutral" as const),
    },
    {
      href: "/encomendas",
      label: "Paradas há mais de 3 dias",
      value: String(indicators.stuck),
      hint:
        indicators.stuck > 0
          ? "Os moradores já foram lembrados"
          : "Nenhuma parada",
      icon: <Clock className="size-5" />,
      tone: indicators.stuck > 0 ? ("danger" as const) : ("neutral" as const),
    },
    {
      href: "/encomendas?situacao=pereciveis",
      label: "Perecíveis vencidas",
      value: String(indicators.perishableOverdue),
      hint:
        indicators.perishableOverdue > 0
          ? "Prazo de retirada vencido"
          : "Nenhuma vencida",
      icon: <Snowflake className="size-5" />,
      tone:
        indicators.perishableOverdue > 0
          ? ("danger" as const)
          : ("neutral" as const),
    },
    {
      href: null,
      label: "Tempo médio até a retirada",
      value: pickupTime(indicators.averagePickupHours),
      hint: `${indicators.pickedUpLast30Days} retiradas nos últimos 30 dias`,
      icon: <Timer className="size-5" />,
      tone: "brand" as const,
    },
  ];

  return (
    <section aria-labelledby="parcel-indicators" className="space-y-3">
      <h2
        id="parcel-indicators"
        className="text-lg font-bold tracking-tight text-fg"
      >
        Encomendas
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map(({ href, ...card }) =>
          href && canOpenDesk ? (
            <Link
              key={card.label}
              href={href}
              className="block h-full rounded-xl transition-opacity hover:opacity-90"
            >
              <StatCard {...card} />
            </Link>
          ) : (
            <StatCard key={card.label} {...card} />
          ),
        )}
      </div>

      <Card className="min-w-0">
        <CardHeader
          title="Recebidas por mês"
          description="Os últimos 6 meses, pelo mês em que chegaram."
        />
        <CardBody className="pt-0">
          <ColumnChart
            label="Encomendas recebidas por mês"
            unit={["encomenda", "encomendas"]}
            detailLabel="Já retiradas"
            emptyText="Nenhuma encomenda nos últimos 6 meses."
            points={indicators.monthly.map((month) => ({
              key: month.month,
              axis: monthLabel(month.month),
              title: monthTitle(month.month),
              value: month.received,
              detail: pickedUpNote(month.pickedUp),
            }))}
          />
        </CardBody>
      </Card>
    </section>
  );
}
