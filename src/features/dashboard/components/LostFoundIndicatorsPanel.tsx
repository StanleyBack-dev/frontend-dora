import Link from "next/link";
import { Archive, HandHelping, PackageCheck, SearchX } from "lucide-react";
import { Card, CardBody, CardHeader, StatCard } from "@/design-system";
import {
  monthLabel,
  monthTitle,
} from "@/features/dashboard/model/month-labels";
import { ColumnChart } from "@/features/platform-metrics/components/ColumnChart";
import type { LostFoundIndicators } from "@/shared/contracts/dashboard";

/** "2 já devolvidos" (undefined: none, so the tooltip stays short). */
const returnedNote = (count: number) =>
  count === 0
    ? undefined
    : `${count.toLocaleString("pt-BR")} já devolvido${count === 1 ? "" : "s"}`;

// The lost and found block of the management overview: what is kept and
// waits for the desk, what residents are looking for, how much goes back
// to its owner, and the monthly volume (the shared column chart).
export function LostFoundIndicatorsPanel({
  indicators,
  canOpenDesk,
}: {
  indicators: LostFoundIndicators;
  /** Links to the desk pages only for who can open them. */
  canOpenDesk: boolean;
}) {
  const cards = [
    {
      href: "/achados-e-perdidos",
      label: "Itens guardados",
      value: String(indicators.kept),
      hint:
        indicators.expiringSoon > 0
          ? `${indicators.expiringSoon} com a guarda terminando em 7 dias`
          : "Nenhum com a guarda terminando",
      icon: <Archive className="size-5" />,
      tone:
        indicators.expiringSoon > 0
          ? ("danger" as const)
          : indicators.kept > 0
            ? ("warning" as const)
            : ("neutral" as const),
    },
    {
      href: "/achados-e-perdidos/pedidos",
      label: "Pedidos para conferir",
      value: String(indicators.pendingClaims),
      hint:
        indicators.pendingClaims > 0
          ? "Moradores dizendo que um item é seu"
          : "Nenhum pedido aguardando",
      icon: <HandHelping className="size-5" />,
      tone:
        indicators.pendingClaims > 0 ? ("info" as const) : ("neutral" as const),
    },
    {
      href: "/achados-e-perdidos/procurados",
      label: "Itens procurados",
      value: String(indicators.openLostReports),
      hint:
        indicators.openLostReports > 0
          ? "Moradores avisaram que perderam"
          : "Ninguém procurando nada",
      icon: <SearchX className="size-5" />,
      tone:
        indicators.openLostReports > 0
          ? ("warning" as const)
          : ("neutral" as const),
    },
    {
      href: null,
      label: "Devolvidos ao dono",
      value: indicators.returnRate === null ? "—" : `${indicators.returnRate}%`,
      hint: `${indicators.returnedLast90Days} devolvidos nos últimos 90 dias`,
      icon: <PackageCheck className="size-5" />,
      tone: "brand" as const,
    },
  ];

  return (
    <section aria-labelledby="lost-found-indicators" className="space-y-3">
      <h2
        id="lost-found-indicators"
        className="text-lg font-bold tracking-tight text-fg"
      >
        Achados e perdidos
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
          title="Achados por mês"
          description="Os últimos 6 meses, pelo mês em que foram achados."
        />
        <CardBody className="pt-0">
          <ColumnChart
            label="Itens achados por mês"
            unit={["item", "itens"]}
            detailLabel="Já devolvidos"
            emptyText="Nenhum item achado nos últimos 6 meses."
            points={indicators.monthly.map((month) => ({
              key: month.month,
              axis: monthLabel(month.month),
              title: monthTitle(month.month),
              value: month.found,
              detail: returnedNote(month.returned),
            }))}
          />
        </CardBody>
      </Card>
    </section>
  );
}
