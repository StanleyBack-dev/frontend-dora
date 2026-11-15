import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Wallet,
} from "lucide-react";
import { PageHeader, StatCard, buttonClasses } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { BookingsTabs } from "@/features/bookings/components/BookingsTabs";
import { FeesConsole } from "@/features/bookings/components/FeesConsole";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { requestTime } from "@/server/request-time";
import { bookingsService } from "@/server/services/bookings.service";
import { can } from "@/shared/lib/access";
import { currentMonth, isMonth, shiftMonth } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";
import { firstParam, type RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Taxas de uso" };

const monthName = (month: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-15T12:00:00Z`));

// Usage fees of a month, by unit, for the condominium's billing.
export default async function BookingFeesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "BOOKINGS_MANAGE")) return <AccessDenied />;

  const params = await searchParams;
  const asked = firstParam(params, "mes");
  const month = isMonth(asked) ? asked : currentMonth(await requestTime());
  const fees = await authed((token) => bookingsService.fees(token, month));
  const pendingCents = fees.totalCents - fees.billedCents;

  return (
    <>
      <PageHeader
        title="Taxas de uso"
        description="Reservas confirmadas de espaços pagos, por unidade, para lançar na cobrança do condomínio."
      />
      <BookingsTabs current="fees" manager />

      <div className="mb-5 flex items-center justify-between gap-2">
        <Link
          href={`/reservas/taxas?mes=${shiftMonth(month, -1)}`}
          className={buttonClasses("secondary", "sm")}
          aria-label="Mês anterior"
        >
          <ChevronLeft aria-hidden className="size-4" />
        </Link>
        <p className="text-base font-bold text-fg capitalize">
          {monthName(month)}
        </p>
        <Link
          href={`/reservas/taxas?mes=${shiftMonth(month, 1)}`}
          className={buttonClasses("secondary", "sm")}
          aria-label="Próximo mês"
        >
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      </div>

      <section
        aria-label="Resumo do mês"
        className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
      >
        <StatCard
          label="Total do mês"
          value={formatCents(fees.totalCents)}
          hint={`${fees.items.length} reserva${fees.items.length === 1 ? "" : "s"}`}
          icon={<Wallet />}
          tone="brand"
        />
        <StatCard
          label="Lançado na cobrança"
          value={formatCents(fees.billedCents)}
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

      <FeesConsole key={month} fees={fees} />
    </>
  );
}
