import type { Metadata } from "next";
import Link from "next/link";
import { Maximize2, Package, SearchCheck, UsersRound } from "lucide-react";
import {
  buttonClasses,
  cn,
  MoreActions,
  PageHeader,
  type MoreAction,
} from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { GateDesk } from "@/features/gate/components/GateDesk";
import { getSessionUser } from "@/server/auth/current-user";
import { loadGateDay } from "@/server/loaders/load-gate";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Portaria" };

// The gate (Portaria): today's guests of the condominium's bookings and,
// with the events module, today's event tickets, and their entry; with
// the parcels module, the pickup codes open the handover. For the
// gate staff and the managers; "Tela cheia" opens it without the menus,
// and the other desks (parcels, lost and found, residents) are one menu.
export default async function GatePage() {
  const user = await getSessionUser();
  if (!can(user, "GUESTS_CHECKIN")) return <AccessDenied />;
  if (!user.condominium) return <NoCondominium user={user} />;
  const day = await loadGateDay(user.condominium);
  const parcels =
    user.condominium.modules.includes("PARCELS") && can(user, "PARCELS_MANAGE");
  const lostAndFound =
    user.condominium.modules.includes("LOST_AND_FOUND") &&
    can(user, "LOST_FOUND_MANAGE");
  const shortcuts: MoreAction[] = [
    ...(parcels
      ? [{ label: "Encomendas", href: "/encomendas", icon: <Package /> }]
      : []),
    ...(lostAndFound
      ? [
          {
            label: "Achados e perdidos",
            href: "/achados-e-perdidos",
            icon: <SearchCheck />,
          },
        ]
      : []),
    ...(can(user, "RESIDENTS_READ")
      ? [{ label: "Moradores", href: "/moradores", icon: <UsersRound /> }]
      : []),
  ];

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
          <div
            className={cn(
              "grid w-full gap-2 sm:flex sm:w-auto",
              shortcuts.length > 0 && "grid-cols-2",
            )}
          >
            <MoreActions label="Atalhos" actions={shortcuts} />
            <Link
              href="/guarita"
              className={cn(buttonClasses("secondary"), "justify-center")}
            >
              <Maximize2 aria-hidden className="size-4" />
              Tela cheia
            </Link>
          </div>
        }
      />
      <GateDesk
        guests={day.guests}
        tickets={day.tickets}
        events={day.events}
        parcels={parcels}
      />
    </>
  );
}
