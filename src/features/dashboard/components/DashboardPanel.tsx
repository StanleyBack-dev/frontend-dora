import Link from "next/link";
import {
  AlertTriangle,
  LifeBuoy,
  MailWarning,
  UserPlus,
  Users,
} from "lucide-react";
import { StatCard } from "@/design-system";
import type { Dashboard } from "@/shared/contracts/dashboard";

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

// Manager's overview on the home page: what needs attention now. Each new
// module (bookings…) adds its own cards here.
export function DashboardPanel({
  dashboard,
  canManageUsers,
  canManageSupport,
}: {
  dashboard: Dashboard;
  /** Links to the admin pages only for who can open them. */
  canManageUsers: boolean;
  canManageSupport: boolean;
}) {
  const cards = [
    {
      href: canManageUsers ? "/admin/usuarios" : null,
      label: "Contas ativas",
      value: dashboard.activeUsers,
      hint: "Moradores e gestores com acesso",
      icon: <Users className="size-5" />,
      tone: "brand" as const,
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
      tone:
        dashboard.pendingEnrollments > 0
          ? ("warning" as const)
          : ("neutral" as const),
    },
    {
      href: canManageSupport ? "/suporte" : null,
      label: "Suporte em aberto",
      value: dashboard.openSupportRequests,
      hint:
        dashboard.openSupportRequests > 0
          ? "Pedidos sem resposta"
          : "Tudo respondido",
      icon: <LifeBuoy className="size-5" />,
      tone:
        dashboard.openSupportRequests > 0
          ? ("warning" as const)
          : ("success" as const),
    },
    {
      href: null,
      label: "Envios com falha",
      value: dashboard.failedNotifications,
      hint:
        dashboard.failedNotifications > 0
          ? "E-mails ou avisos não entregues"
          : "Todos os avisos entregues",
      icon: <MailWarning className="size-5" />,
      tone:
        dashboard.failedNotifications > 0
          ? ("danger" as const)
          : ("neutral" as const),
    },
  ];

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
      {dashboard.failedNotifications > 0 && (
        <p className="flex items-start gap-2 text-sm text-danger">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {plural(
            dashboard.failedNotifications,
            "notificação não pôde ser enviada",
            "notificações não puderam ser enviadas",
          )}{" "}
          depois de várias tentativas. Verifique a configuração de e-mail.
        </p>
      )}
    </section>
  );
}
