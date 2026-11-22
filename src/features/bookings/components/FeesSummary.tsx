import { CalendarCheck, CircleCheck, Clock, Wallet } from "lucide-react";
import { StatCard } from "@/design-system";
import type { BookingFeesOverview } from "@/shared/contracts/bookings";
import { formatCents } from "@/shared/lib/format";

// The numbers of a month's usage fees, whatever the filters (counted by the
// API): how many bookings, the total, what was sent to billing and what is
// pending (four cards, one row on desktop).
export function FeesSummary({ overview }: { overview: BookingFeesOverview }) {
  const { count, totalCents, billedCents } = overview;
  const pendingCents = totalCents - billedCents;

  return (
    <section
      aria-label="Resumo do mês"
      className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      <StatCard
        label="Reservas com taxa"
        value={String(count)}
        hint="No mês escolhido."
        icon={<CalendarCheck />}
        tone="info"
      />
      <StatCard
        label="Total do mês"
        value={formatCents(totalCents)}
        icon={<Wallet />}
        tone="brand"
      />
      <StatCard
        label="Lançado na cobrança"
        value={formatCents(billedCents)}
        icon={<CircleCheck />}
        tone="neutral"
      />
      <StatCard
        label="Pendente"
        value={formatCents(pendingCents)}
        icon={<Clock />}
        tone={pendingCents > 0 ? "warning" : "neutral"}
      />
    </section>
  );
}
