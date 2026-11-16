import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Alert, PageHeader } from "@/design-system";
import { MyDependents } from "@/features/dependents/components/MyDependents";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { getSessionUser } from "@/server/auth/current-user";
import { loadMyDependents } from "@/server/loaders/load-dependents";
import { isResidentHere } from "@/shared/lib/access";

export const metadata: Metadata = { title: "Meus dependentes" };

// The resident's dependents (registered once, approved by the managers).
// Only residents have them: anyone else (a manager, the gate, the platform
// administrator) sees why instead of an error.
export default async function MyDependentsPage() {
  const user = await getSessionUser();
  if (!user.condominium) return <NoCondominium user={user} />;
  const resident = isResidentHere(user);
  const dependents = resident ? await loadMyDependents() : [];
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
      {resident ? (
        <MyDependents dependents={dependents} />
      ) : (
        <Alert tone="info">
          Dependentes são cadastrados pelos moradores, para entrarem nos pedidos
          de ingressos dos eventos. Sua conta não é de morador em{" "}
          {user.condominium.name}.
        </Alert>
      )}
    </>
  );
}
