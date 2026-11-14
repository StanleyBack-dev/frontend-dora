import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { getSessionUser } from "@/server/auth/current-user";

// Members, sign-ups, links and units belong to one condominium; the
// platform's own sections (logs) live outside this group.
export default async function CondominiumAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  return children;
}
