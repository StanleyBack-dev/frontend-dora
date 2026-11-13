import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardBody, CardHeader, PageHeader } from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { MyPhotoField } from "@/features/auth/components/MyPhotoField";
import { ProfileForm } from "@/features/auth/components/ProfileForm";
import { getSessionUser } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function ProfilePage() {
  const user = await getSessionUser();

  return (
    <>
      <PageHeader
        title="Meu perfil"
        description={
          <>
            Foto e dados pessoais. Senha, app e avisos em{" "}
            <Link
              href="/configuracoes"
              className="text-brand-ink hover:underline"
            >
              Configurações
            </Link>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Foto de perfil"
            description="Ajuda a administração e os vizinhos a identificar você."
          />
          <CardBody>
            <MyPhotoField initialUrl={user.photoUrl} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Dados pessoais"
            description="O e-mail recebe avisos, comunicados e a recuperação de senha."
          />
          <CardBody>
            <ProfileForm
              initialName={user.name}
              initialEmail={user.email}
              username={user.username}
              groupLabel={GROUP_LABELS[user.group]}
            />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
