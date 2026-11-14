import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { SpaceForm } from "@/features/spaces/components/SpaceForm";
import { getSessionUser } from "@/server/auth/current-user";
import { loadSpace } from "@/server/loaders/load-space";
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
      <Link
        href={`/espacos/${space.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> {space.name}
      </Link>
      <PageHeader title={`Editar ${space.name}`} />
      <SpaceForm space={space} />
    </>
  );
}
