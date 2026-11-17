import { AccessDenied } from "@/features/access/components/AccessDenied";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { getSessionUser } from "@/server/auth/current-user";
import { can } from "@/shared/lib/access";

// The residents of one condominium, for its managers and the platform.
// Each page checks again: Next renders a page alongside its layout.
export default async function ResidentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!can(user, "USERS_MANAGE")) return <AccessDenied />;
  if (!user.condominium) return <NoCondominium user={user} />;
  return children;
}
