import { CalendarDays, CircleCheck, Clock, Users } from "lucide-react";
import { StatCard } from "@/design-system";
import type { DayGuestsOverview } from "@/shared/contracts/bookings";

// The numbers of a day's guests, whatever the filters (counted by the API):
// how many, who came in, who is still to come and how many bookings.
export function BookingGuestsSummary({
  overview,
}: {
  overview: DayGuestsOverview;
}) {
  const { total, checkedIn, bookings } = overview;

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard label="Convidados" value={String(total)} icon={<Users />} />
      <StatCard
        label="Entraram"
        value={String(checkedIn)}
        icon={<CircleCheck />}
        tone="success"
      />
      <StatCard
        label="Faltam"
        value={String(total - checkedIn)}
        icon={<Clock />}
      />
      <StatCard
        label="Reservas"
        value={String(bookings)}
        icon={<CalendarDays />}
      />
    </div>
  );
}
