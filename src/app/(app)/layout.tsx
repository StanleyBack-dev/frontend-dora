import { redirect } from "next/navigation";
import { AppShell } from "@/features/layout/components/AppShell";
import type { NavFeature } from "@/features/layout/model/navigation";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { pixReceiver } from "@/server/config/pix";
import { notificationsService } from "@/server/services/notifications.service";
import { purchaseIndicatorsService } from "@/server/services/purchase-indicators.service";
import { canManageHere } from "@/shared/lib/access";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (user.mustChangePassword) redirect("/primeiro-acesso");
  const purchases = user.condominium?.modules.includes("PURCHASES") ?? false;
  const [unread, transparency] = await Promise.all([
    authed((token) => notificationsService.unreadCount(token)),
    // The purchases accounts' menu entry, once published (a failure only
    // hides it).
    purchases
      ? authed((token) =>
          purchaseIndicatorsService.transparencyStatus(token),
        ).catch(() => null)
      : null,
  ]);
  const features: NavFeature[] = transparency?.enabled
    ? ["purchasesTransparency"]
    : [];

  return (
    <AppShell
      user={user}
      showAdmin={canManageHere(user)}
      showSupportProject={pixReceiver() !== null}
      features={features}
      unreadNotifications={unread}
    >
      {children}
    </AppShell>
  );
}
