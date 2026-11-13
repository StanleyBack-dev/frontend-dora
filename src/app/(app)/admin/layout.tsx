import { PageHeader } from "@/design-system";
import { NoCondominium } from "@/features/condominiums/components/NoCondominium";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { ADMIN_SECTIONS } from "@/features/admin/model/admin-sections";
import { getSessionUser } from "@/server/auth/current-user";
import { ADMIN_AREA_PERMISSIONS, can, canAny } from "@/shared/lib/access";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!canAny(user, ...ADMIN_AREA_PERMISSIONS)) return <AccessDenied />;
  // Everything here belongs to one condominium.
  if (!user.condominium) return <NoCondominium user={user} />;
  const allowed = ADMIN_SECTIONS.filter((section) =>
    can(user, section.permission),
  ).map((section) => section.href);

  return (
    <>
      <PageHeader
        title="Administração"
        description={`${user.condominium.name}: moradores, unidades, cadastros pelo link e a saúde do sistema.`}
      />
      <AdminNav allowed={allowed} />
      {children}
    </>
  );
}
