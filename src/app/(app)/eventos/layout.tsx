import { ModuleUnavailable } from "@/features/access/components/ModuleUnavailable";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { getSessionUser } from "@/server/auth/current-user";

// Events: a module contracted apart. Open to everyone of the condominium
// while it is on; each page checks the rest (and the API checks again).
export default async function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!user.condominium.modules.includes("EVENTS")) {
    return <ModuleUnavailable name="Eventos" />;
  }
  return children;
}
