import { AccessDenied } from "@/features/access/components/AccessDenied";
import { getSessionUser } from "@/server/auth/current-user";
import { canRunPlatform } from "@/shared/lib/access";

// The platform area (Plataforma): the administrator of Dora, across every
// condominium; no condominium needs to be open.
export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!canRunPlatform(user)) return <AccessDenied />;
  return children;
}
