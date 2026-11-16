import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/design-system";
import { MyDependents } from "@/features/dependents/components/MyDependents";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { getSessionUser } from "@/server/auth/current-user";
import { loadMyDependents } from "@/server/loaders/load-dependents";

export const metadata: Metadata = { title: "Meus dependentes" };

// The resident's dependents (registered once, approved by the managers).
export default async function MyDependentsPage() {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  const dependents = await loadMyDependents();
  return (
    <>
      <Link
        href="/perfil"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" /> Meu perfil
      </Link>
      <PageHeader
        title="Meus dependentes"
        description="Quem mora com você e não usa o app. A administração confere o documento uma vez."
      />
      <MyDependents dependents={dependents} />
    </>
  );
}
