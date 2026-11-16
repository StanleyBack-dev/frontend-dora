import type { Metadata } from "next";
import { PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { GateDesk } from "@/features/gate/components/GateDesk";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { bookingsService } from "@/server/services/bookings.service";
import { eventsService } from "@/server/services/events.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Portaria" };

// The gate (Portaria): today's guests of the condominium's bookings and,
// with the events module, today's event tickets, and their entry. For the
// gate staff and the managers.
export default async function GatePage() {
  const user = await getSessionUser();
  if (!can(user, "GUESTS_CHECKIN")) return <AccessDenied />;
  if (!user.condominium) return <NoCondominium user={user} />;
  const events = user.condominium.modules.includes("EVENTS");
  const [guests, tickets] = await Promise.all([
    authed((token) => bookingsService.gateGuests(token)),
    events
      ? authed((token) => eventsService.gateTickets(token)).catch(() => [])
      : Promise.resolve([]),
  ]);

  return (
    <>
      <PageHeader
        title="Portaria"
        description={
          events
            ? "Os convidados das reservas e os ingressos dos eventos de hoje. Leia o QR, digite o código ou libere a entrada pela lista."
            : "Os convidados das reservas de hoje. Digite o código do convite ou libere a entrada pela lista."
        }
      />
      <GateDesk guests={guests} tickets={tickets} events={events} />
    </>
  );
}
