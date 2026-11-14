import { PageHeader } from "@/design-system";
import { AccessDenied } from "@/features/access/components/AccessDenied";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { openableSections } from "@/features/admin/model/admin-sections";
import { getSessionUser } from "@/server/auth/current-user";
import { ADMIN_AREA_PERMISSIONS, canAny } from "@/shared/lib/access";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!canAny(user, ...ADMIN_AREA_PERMISSIONS)) return <AccessDenied />;
  // Sections of a condominium need one open (their own layout says so);
  // the platform's (logs) work from anywhere.
  const allowed = openableSections(user, Boolean(user.condominium)).map(
    (section) => section.href,
  );

  return (
    <>
      <PageHeader
        title="Administração"
        description={
          user.condominium
            ? `${user.condominium.name}: unidades, cadastros pelo link e a saúde do sistema.`
            : "Os logs do sistema. Entre em um condomínio (menu Condomínios) para administrar as unidades e os cadastros."
        }
      />
      <AdminNav allowed={allowed} />
      {children}
    </>
  );
}
