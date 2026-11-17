import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { getSessionUser } from "@/server/auth/current-user";

// The bookings module in the management (spaces, bookings, fees): a module
// contracted apart.
export default async function ManagedBookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user.condominium?.modules.includes("BOOKINGS")) {
    return <ModuleUnavailable name="Reservas" />;
  }
  return children;
}
