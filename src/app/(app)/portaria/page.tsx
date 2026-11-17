import type { Metadata } from "next";
import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { buttonClasses, PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { GateDesk } from "@/features/gate/components/GateDesk";
import { getSessionUser } from "@/server/auth/current-user";
import { loadGateDay } from "@/server/loaders/load-gate";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Portaria" };

// The gate (Portaria): today's guests of the condominium's bookings and,
// with the events module, today's event tickets, and their entry. For the
// gate staff and the managers; "Tela cheia" opens it without the menus.
export default async function GatePage() {
  const user = await getSessionUser();
  if (!can(user, "GUESTS_CHECKIN")) return <AccessDenied />;
  if (!user.condominium) return <NoCondominium user={user} />;
  const day = await loadGateDay(user.condominium);

  return (
    <>
      <PageHeader
        title="Portaria"
        description={
          day.events
            ? "Os convidados das reservas e os ingressos dos eventos de hoje. Leia o QR, digite o código ou libere a entrada pela lista."
            : "Os convidados das reservas de hoje. Digite o código do convite ou libere a entrada pela lista."
        }
        actions={
          <Link href="/guarita" className={buttonClasses("secondary")}>
            <Maximize2 aria-hidden className="size-4" />
            Tela cheia
          </Link>
        }
      />
      <GateDesk guests={day.guests} tickets={day.tickets} events={day.events} />
    </>
  );
}
