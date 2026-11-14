import type { Metadata } from "next";
import { PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { SpaceForm } from "@/features/spaces/components/SpaceForm";
import { getSessionUser } from "@/server/auth/current-user";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Novo espaço" };

export default async function NewSpacePage() {
  const user = await getSessionUser();
  if (!can(user, "SPACES_MANAGE")) return <AccessDenied />;
  return (
    <>
      <PageHeader
        title="Novo espaço"
        description="Os dados do espaço, quando ele funciona e como os moradores reservam."
      />
      <SpaceForm space={null} />
    </>
  );
}
