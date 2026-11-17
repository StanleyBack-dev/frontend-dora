import { redirect } from "next/navigation";
import { AppShell } from "@/features/layout/components/AppShell";
import { authed, getSessionUser } from "@/server/auth/current-user";
import { pixReceiver } from "@/server/config/pix";
import { notificationsService } from "@/server/services/notifications.service";
import { canManageHere } from "@/shared/lib/access";

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
      showAdmin={canManageHere(user)}
      showSupportProject={pixReceiver() !== null}
      unreadNotifications={unread}
    >
      {children}
    </AppShell>
  );
}
