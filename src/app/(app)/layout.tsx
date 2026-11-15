import { redirect } from "next/navigation";
import { AppShell } from "@/features/layout/components/AppShell";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { pixReceiver } from "@/server/config/pix";
import { notificationsService } from "@/server/services/notifications.service";
import { ADMIN_AREA_PERMISSIONS, canAny } from "@/shared/lib/access";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (user.mustChangePassword) redirect("/primeiro-acesso");
  const unread = await authed((token) =>
    notificationsService.unreadCount(token),
  );

  return (
    <AppShell
      user={user}
      showAdmin={canAny(user, ...ADMIN_AREA_PERMISSIONS)}
      showSupportProject={pixReceiver() !== null}
      unreadNotifications={unread}
    >
      {children}
    </AppShell>
  );
}
