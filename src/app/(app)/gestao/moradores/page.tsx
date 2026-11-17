import type { Metadata } from "next";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { MembersDirectory } from "@/features/admin/components/MembersDirectory";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { getSessionUser } from "@/server/auth/current-user";
import { ROLES_BY_KIND } from "@/features/admin/model/member-kind";
import { loadMembers } from "@/server/loaders/load-members";
import { can } from "@/shared/lib/access";
import type { RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Moradores" };

// The residents (a resident síndico too); the employees are in Equipe.
export default async function ResidentsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const user = await getSessionUser();
  // Checked here, not only in the layout: Next renders the page alongside
  // the layout, so a layout check alone would still send its data.
  if (!can(user, "USERS_MANAGE")) return <AccessDenied />;
  if (!user.condominium) return <NoCondominium user={user} />;

  const kind = "RESIDENT" as const;
  const roles = ROLES_BY_KIND[kind];
  const unitFilter = true;
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
        basePath: "/gestao/moradores",
        title: "Moradores",
        description: `Quem mora no ${user.condominium.name}: unidade, contato e acesso. Os funcionários ficam em Equipe.`,
        kind,
        roles,
        unitFilter,
        emptyTitle: "Nenhum morador ainda",
        emptyDescription: "Adicione os moradores ou envie um link de cadastro.",
      }}
    />
  );
}
