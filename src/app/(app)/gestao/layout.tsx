import { AccessDenied } from "@/features/access/components/AccessDenied";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { getSessionUser } from "@/server/auth/current-user";
import { canManageHere } from "@/shared/lib/access";

// The management area (Gestão) of the condominium the session works in: its
// managers, and the platform administrator inside it. Each page checks its
// own permission again (and the API checks every operation).
export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  if (!canManageHere(user)) return <AccessDenied />;
  return children;
}
