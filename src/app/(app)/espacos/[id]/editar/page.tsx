import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { SpaceForm } from "@/features/spaces/components/SpaceForm";
import { loadSpace } from "@/app/(app)/espacos/[id]/load-space";
import { getSessionUser } from "@/server/auth/current-user";
import { can } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Editar espaço" };

export default async function EditSpacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!can(user, "SPACES_MANAGE")) return <AccessDenied />;
  const space = await loadSpace((await params).id);
  if (!space) notFound();
  return (
    <>
      <PageHeader title={`Editar ${space.name}`} />
      <SpaceForm space={space} />
    </>
  );
}
