import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, House } from "lucide-react";
import { buttonClasses, Card, PageHeader } from "@/design-system";
import { DashboardPanel } from "@/features/dashboard/components/DashboardPanel";
import { visibleManageModules } from "@/features/layout/model/navigation";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { dashboardService } from "@/server/services/dashboard.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Gestão" };

/** What each module's card says. */
const MODULE_HINTS: Record<string, string> = {
  general:
    "Comunicados, moradores, equipe, unidades, cadastros e o PIX do condomínio.",
  bookings: "Reservas para aprovar, espaços e as taxas de uso do mês.",
  events: "Eventos, ingressos e os pedidos para conferir.",
};

// The management's home: the condominium's numbers (who reads the
// dashboard) and a card per module this person works with.
export default async function ManagementPage() {
  const user = await getSessionUser();
  const condominium = user.condominium;
  const dashboard = can(user, "DASHBOARD_READ")
    ? await authed((token) => dashboardService.get(token))
    : null;
  const modules = visibleManageModules(
    user.permissions,
    condominium?.modules ?? [],
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Gestão"
        description={`A administração do ${condominium?.name ?? "condomínio"}: escolha o módulo no menu lateral para ver só o que é dele.`}
        actions={
          <Link href="/inicio" className={buttonClasses("secondary")}>
            <House aria-hidden className="size-4" />
            Ver como morador
          </Link>
        }
      />

      <section aria-label="Módulos" className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight text-fg">Módulos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {modules.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.items[0].href}
                className="group block h-full"
              >
                <Card className="flex h-full flex-col gap-4 p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-brand-border">
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-full bg-brand-soft text-fg [&>svg]:size-5">
                      <Icon aria-hidden />
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="size-5 text-soft transition-colors group-hover:text-brand-ink"
                    />
                  </div>
                  <span>
                    <span className="block font-bold text-fg">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-muted">
                      {MODULE_HINTS[item.id]}
                    </span>
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {dashboard && (
        <DashboardPanel
          dashboard={dashboard}
          canManageUsers={can(user, "USERS_MANAGE")}
          canManageUnits={can(user, "UNITS_MANAGE")}
          canManageSupport={can(user, "SUPPORT_MANAGE")}
          canManageBookings={can(user, "BOOKINGS_MANAGE")}
          canManageSpaces={can(user, "SPACES_MANAGE")}
        />
      )}
    </div>
  );
}
