import type { Metadata } from "next";
import { PageHeader } from "@/design-system";
import { DashboardPanel } from "@/features/dashboard/components/DashboardPanel";
import { LostFoundIndicatorsPanel } from "@/features/dashboard/components/LostFoundIndicatorsPanel";
import { ParcelIndicatorsPanel } from "@/features/dashboard/components/ParcelIndicatorsPanel";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { dashboardService } from "@/server/services/dashboard.service";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Visão geral" };

// The condominium's overview (Condomínio, Visão geral): its numbers and
// what needs attention, for whoever reads the dashboard.
export default async function ManagementPage() {
  const user = await getSessionUser();
  const condominium = user.condominium;
  const dashboard = can(user, "DASHBOARD_READ")
    ? await authed((token) => dashboardService.get(token))
    : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Visão geral"
        description={`Os números do ${condominium?.name ?? "condomínio"} e o que precisa de atenção.`}
      />

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
      {dashboard?.parcels && (
        <ParcelIndicatorsPanel
          indicators={dashboard.parcels}
          canOpenDesk={can(user, "PARCELS_MANAGE")}
        />
      )}
      {dashboard?.lostAndFound && (
        <LostFoundIndicatorsPanel
          indicators={dashboard.lostAndFound}
          canOpenDesk={can(user, "LOST_FOUND_MANAGE")}
        />
      )}
    </div>
  );
}
