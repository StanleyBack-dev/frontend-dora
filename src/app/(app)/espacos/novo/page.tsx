import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <Link
        href="/espacos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> Espaços
      </Link>
      <PageHeader
        title="Novo espaço"
        description="Os dados do espaço, quando ele funciona e como os moradores reservam."
      />
      <SpaceForm space={null} />
    </>
  );
}
