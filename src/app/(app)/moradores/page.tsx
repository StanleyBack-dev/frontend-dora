import type { Metadata } from "next";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { MembersDirectory } from "@/features/admin/components/MembersDirectory";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { getSessionUser } from "@/server/auth/current-user";
import { loadMembers } from "@/server/loaders/load-members";
import { can } from "@/shared/lib/access";
import type { RawSearchParams } from "@/shared/lib/search-params";

export const metadata: Metadata = { title: "Moradores" };

// The residents only: managers and the gate are in Equipe.
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

  const roles = ["USER"] as const;
  const unitFilter = true;
  const data = await loadMembers(await searchParams, { roles, unitFilter });

  return (
    <MembersDirectory
      user={user}
      data={data}
      config={{
        basePath: "/moradores",
        title: "Moradores",
        description: `Quem mora no ${user.condominium.name}: unidade, contato e acesso. A administração e a portaria ficam em Equipe.`,
        roles,
        unitFilter,
        emptyTitle: "Nenhum morador ainda",
        emptyDescription: "Adicione os moradores ou envie um link de cadastro.",
      }}
    />
  );
}
