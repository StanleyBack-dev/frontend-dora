import { Medal, Trophy } from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  SegmentedNav,
  type SegmentedNavItem,
} from "@/design-system";
import {
  ANONYMOUS_SUPPORTER,
  contributionsLabel,
  podiumClasses,
} from "@/features/support-project/model/support-labels";
import type { SupportRanking } from "@/shared/contracts/supporters";
import { cn } from "@/design-system/utils/cn";
import { formatCents } from "@/shared/lib/format";

// Who supports the Dora, the biggest total first (equal totals share the
// place). Names only of who agreed to show them; the totals of the period
// on top.
export function SupportRankingCard({
  ranking,
  periods,
}: {
  ranking: SupportRanking;
  periods: SegmentedNavItem[];
}) {
  const period =
    ranking.year === null ? "desde o início" : `em ${ranking.year}`;

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Trophy aria-hidden className="size-5 text-brand" />
            Ranking de apoiadores
          </span>
        }
        description={`Quem mais apoiou o Dora ${period}.`}
        action={<SegmentedNav items={periods} label="Período do ranking" />}
      />
      <CardBody className="space-y-4 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-muted px-4 py-3">
            <p className="text-[11px] font-medium tracking-[0.06em] text-muted uppercase">
              Arrecadado
            </p>
            <p className="mt-1 text-xl font-bold text-fg tabular-nums">
              {formatCents(ranking.totalCents)}
            </p>
          </div>
          <div className="rounded-xl bg-surface-muted px-4 py-3">
            <p className="text-[11px] font-medium tracking-[0.06em] text-muted uppercase">
              Apoiadores
            </p>
            <p className="mt-1 text-xl font-bold text-fg tabular-nums">
              {ranking.supporters}
            </p>
          </div>
        </div>

        {ranking.entries.length === 0 ? (
          <EmptyState
            icon={<Medal className="size-5" aria-hidden />}
            title="Ninguém por aqui ainda"
            description="Apoie o Dora e seja o primeiro nome do ranking."
          />
        ) : (
          <ol className="divide-y divide-border" aria-label="Ranking">
            {ranking.entries.map((entry, index) => (
              <li
                key={`${entry.position}-${index}`}
                className="flex items-center gap-3 py-3"
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums",
                    podiumClasses(entry.position),
                  )}
                  aria-label={`${entry.position}º lugar`}
                >
                  {entry.position <= 3 ? (
                    <Medal aria-hidden className="size-4" />
                  ) : (
                    `${entry.position}º`
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-semibold",
                      entry.name ? "text-fg" : "text-muted italic",
                    )}
                  >
                    {entry.name ?? ANONYMOUS_SUPPORTER}
                  </p>
                  <p className="text-xs text-muted">
                    {entry.position}º lugar ·{" "}
                    {contributionsLabel(entry.contributions)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-fg tabular-nums">
                  {formatCents(entry.totalCents)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
