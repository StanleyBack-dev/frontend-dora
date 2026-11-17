import type { Metadata } from "next";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { MembersDirectory } from "@/features/admin/components/MembersDirectory";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { getSessionUser } from "@/server/auth/current-user";
import { ROLES_BY_KIND } from "@/features/admin/model/member-kind";
import { loadMembers } from "@/server/loaders/load-members";
import { can } from "@/shared/lib/access";
import type { RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Equipe" };

// The condominium's employees: the gate, the staff and a hired síndico or
// administrator, with their staff record. The platform administrator is not
// a member, so never listed.
export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  if (!can(user, "USERS_MANAGE")) return <AccessDenied />;
  if (!user.condominium) return <NoCondominium user={user} />;

  const kind = "EMPLOYEE" as const;
  const roles = ROLES_BY_KIND[kind];
  const unitFilter = false;
  const data = await loadMembers(await searchParams, {
    kind,
    roles,
    unitFilter,
  });

  return (
    <MembersDirectory
      user={user}
      data={data}
      config={{
        basePath: "/gestao/equipe",
        title: "Equipe",
        description: `Os funcionários do ${user.condominium.name}: cargo, contato, papel e acesso.`,
        kind,
        roles,
        unitFilter,
        emptyTitle: "Ninguém na equipe ainda",
        emptyDescription:
          "Adicione a administração e a portaria, ou aprove os funcionários que se cadastrarem pelo link.",
      }}
    />
  );
}
