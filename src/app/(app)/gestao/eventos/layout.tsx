import { AccessDenied } from "@/features/access/components/AccessDenied";
import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { getSessionUser } from "@/server/auth/current-user";
import { canAny } from "@/shared/lib/access";

// The events module in the management: whoever manages events or reviews
// their payments, while the module is on.
export default async function ManagedEventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user.condominium?.modules.includes("EVENTS")) {
    return <ModuleUnavailable name="Eventos" />;
  }
  if (!canAny(user, "EVENTS_MANAGE", "PAYMENTS_MANAGE")) {
    return <AccessDenied />;
  }
  return children;
}
