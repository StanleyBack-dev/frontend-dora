import { AccessDenied } from "@/features/access/components/AccessDenied";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { getSessionUser } from "@/server/auth/current-user";
import { can } from "@/shared/lib/access";

// The spaces of one condominium, managed by its managers and the platform.
// Residents see what they need of each space when booking (Reservas).
export default async function SpacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!can(user, "SPACES_MANAGE")) return <AccessDenied />;
  if (!user.condominium) return <NoCondominium user={user} />;
  return children;
}
