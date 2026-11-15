import type { Metadata } from "next";
import { PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { GateConsole } from "@/features/bookings/components/GateConsole";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { bookingsService } from "@/server/services/bookings.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Portaria" };

// The gate (Portaria): today's guests of the condominium's bookings and
// their entry. For the gate staff and the managers.
export default async function GatePage() {
  const user = await getSessionUser();
  if (!can(user, "GUESTS_CHECKIN")) return <AccessDenied />;
  if (!user.condominium) return <NoCondominium user={user} />;
  const guests = await authed((token) => bookingsService.gateGuests(token));

  return (
    <>
      <PageHeader
        title="Portaria"
        description="Os convidados das reservas de hoje. Digite o código do convite ou libere a entrada pela lista."
      />
      <GateConsole initial={guests} />
    </>
  );
}
