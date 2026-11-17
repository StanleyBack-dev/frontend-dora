import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonClasses, PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { BookingGuestsBoard } from "@/features/bookings/components/BookingGuestsBoard";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { requestTime } from "@/server/request-time";
import { bookingsService } from "@/server/services/bookings.service";
import { can } from "@/shared/lib/access";
import { formatLongDay } from "@/shared/lib/datetime";
import { firstParam, type RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Convidados" };

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** YYYY-MM-DD of a moment in the app's time zone. */
const localDay = (moment: Date) =>
  moment.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

/** The day before or after (dates at noon, so time zones don't shift them). */
const shiftDay = (day: string, by: number) => {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + by);
  return date.toISOString().slice(0, 10);
};

// The guests of a day's bookings (Gestão, Reservas, Convidados), for the
// managers to follow who comes: by booking, with who invited and who already
// came in. Read-only: the gate (Portaria) lets them in.
export default async function BookingGuestsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "GUESTS_CHECKIN")) return <AccessDenied />;
  const today = localDay(await requestTime());
  const asked = firstParam(await searchParams, "data") ?? "";
  const day = DAY.test(asked) ? asked : today;
  const guests = await authed((token) =>
    bookingsService.gateGuests(token, day),
  );
  const dayHref = (target: string) =>
    target === today
      ? "/gestao/reservas/convidados"
      : `/gestao/reservas/convidados?data=${target}`;

  return (
    <>
      <PageHeader
        title="Convidados"
        description={`Os convidados das reservas de ${day === today ? "hoje" : formatLongDay(`${day}T12:00:00Z`)}: quem convidou e quem já entrou pela portaria.`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={dayHref(shiftDay(day, -1))}
              className={buttonClasses("secondary", "sm")}
              aria-label="Dia anterior"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </Link>
            {day !== today && (
              <Link
                href={dayHref(today)}
                className={buttonClasses("secondary", "sm")}
              >
                Hoje
              </Link>
            )}
            <Link
              href={dayHref(shiftDay(day, 1))}
              className={buttonClasses("secondary", "sm")}
              aria-label="Dia seguinte"
            >
              <ChevronRight aria-hidden className="size-4" />
            </Link>
          </div>
        }
      />
      <BookingGuestsBoard guests={guests} />
    </>
  );
}
