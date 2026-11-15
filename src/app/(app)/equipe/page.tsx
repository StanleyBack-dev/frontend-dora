import type { Metadata } from "next";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { MembersDirectory } from "@/features/admin/components/MembersDirectory";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { getSessionUser } from "@/server/auth/current-user";
import { loadMembers } from "@/server/loaders/load-members";
import { can } from "@/shared/lib/access";
import type { RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Equipe" };

// Who runs the condominium: managers (administração, síndico) and the gate
// (Portaria). The platform administrator is not a member, so never listed.
export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "USERS_MANAGE")) return <AccessDenied />;
  if (!user.condominium) return <NoCondominium user={user} />;

  const roles = ["ADMIN", "CONCIERGE"] as const;
  const unitFilter = false;
  const data = await loadMembers(await searchParams, { roles, unitFilter });

  return (
    <MembersDirectory
      user={user}
      data={data}
      config={{
        basePath: "/equipe",
        title: "Equipe",
        description: `A administração e a portaria do ${user.condominium.name}: contato, papel e acesso.`,
        roles,
        unitFilter,
        emptyTitle: "Ninguém na equipe ainda",
        emptyDescription:
          "Adicione a administração e a portaria, ou aprove os funcionários que se cadastrarem pelo link.",
      }}
    />
  );
}
