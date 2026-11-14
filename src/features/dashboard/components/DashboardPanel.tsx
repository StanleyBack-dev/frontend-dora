import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Building,
  CalendarCheck,
  CalendarClock,
  MapPin,
  LifeBuoy,
  MailWarning,
  UserPlus,
  Users,
} from "lucide-react";
import { StatCard, type Tone } from "@/design-system";
import type { Dashboard } from "@/shared/contracts/dashboard";

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

type DashboardCard = {
  href: string | null;
  label: string;
  value: number;
  hint: string;
  icon: ReactNode;
  tone: Tone;
};

// Manager's overview of the condominium on the home page: what needs
// attention now. The platform's own numbers (support, failed deliveries)
// come only for the Dora administration. Each new module (bookings…) adds
// its own cards here.
export function DashboardPanel({
  dashboard,
  canManageUsers,
  canManageUnits,
  canManageSupport,
  canManageBookings,
  canManageSpaces,
}: {
  dashboard: Dashboard;
  /** Links to the admin pages only for who can open them. */
  canManageUsers: boolean;
  canManageUnits: boolean;
  canManageSupport: boolean;
  canManageBookings: boolean;
  canManageSpaces: boolean;
}) {
  const failed = dashboard.failedNotifications;
  const cards: DashboardCard[] = [
    {
      href: canManageBookings ? "/reservas/gestao?situacao=PENDING" : null,
      label: "Reservas para aprovar",
      value: dashboard.pendingBookings,
      hint:
        dashboard.pendingBookings > 0
          ? "Aguardando sua decisão"
          : "Nada pendente",
      icon: <CalendarClock className="size-5" />,
      tone: dashboard.pendingBookings > 0 ? "warning" : "neutral",
    },
    {
      href: canManageBookings ? "/reservas/gestao" : null,
      label: "Reservas hoje",
      value: dashboard.bookingsToday,
      hint: "Confirmadas ou aguardando",
      icon: <CalendarCheck className="size-5" />,
      tone: "brand",
    },
    {
      href: canManageUsers ? "/admin/usuarios" : null,
      label: "Moradores ativos",
      value: dashboard.activeUsers,
      hint: "Moradores e gestores com acesso",
      icon: <Users className="size-5" />,
      tone: "neutral",
    },
    {
      href: canManageUsers ? "/admin/cadastros" : null,
      label: "Cadastros pendentes",
      value: dashboard.pendingEnrollments,
      hint:
        dashboard.pendingEnrollments > 0
          ? "Aguardando sua análise"
          : "Nada pendente",
      icon: <UserPlus className="size-5" />,
      tone: dashboard.pendingEnrollments > 0 ? "warning" : "neutral",
    },
    {
      href: canManageSpaces ? "/espacos" : null,
      label: "Espaços ativos",
      value: dashboard.activeSpaces,
      hint:
        dashboard.activeSpaces > 0
          ? "Disponíveis para os moradores"
          : "Cadastre os espaços",
      icon: <MapPin className="size-5" />,
      tone: dashboard.activeSpaces > 0 ? "neutral" : "warning",
    },
    {
      href: canManageUnits ? "/admin/unidades" : null,
      label: "Unidades",
      value: dashboard.units,
      hint:
        dashboard.units > 0
          ? "Cadastradas no condomínio"
          : "Cadastre as unidades",
      icon: <Building className="size-5" />,
      tone: dashboard.units > 0 ? "neutral" : "warning",
    },
  ];
  if (dashboard.openSupportRequests !== null) {
    cards.push({
      href: canManageSupport ? "/suporte" : null,
      label: "Suporte em aberto",
      value: dashboard.openSupportRequests,
      hint:
        dashboard.openSupportRequests > 0
          ? "Pedidos sem resposta"
          : "Tudo respondido",
      icon: <LifeBuoy className="size-5" />,
      tone: dashboard.openSupportRequests > 0 ? "warning" : "success",
    });
  }
  if (failed !== null) {
    cards.push({
      href: null,
      label: "Envios com falha",
      value: failed,
      hint:
        failed > 0
          ? "E-mails ou avisos não entregues"
          : "Todos os avisos entregues",
      icon: <MailWarning className="size-5" />,
      tone: failed > 0 ? "danger" : "neutral",
    });
  }

  return (
    <section aria-label="Painel de gestão" className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map(({ href, ...card }) =>
          href ? (
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
      {failed !== null && failed > 0 && (
        <p className="flex items-start gap-2 text-sm text-danger">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {plural(
            failed,
            "notificação não pôde ser enviada",
            "notificações não puderam ser enviadas",
          )}{" "}
          depois de várias tentativas. Verifique a configuração de e-mail.
        </p>
      )}
    </section>
  );
}
