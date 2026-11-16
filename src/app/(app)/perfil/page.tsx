import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  buttonClasses,
} from "@/design-system";
import { UsersRound } from "lucide-react";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { MyPhotoField } from "@/features/auth/components/MyPhotoField";
import { ProfileForm } from "@/features/auth/components/ProfileForm";
import { isResidentHere } from "@/shared/lib/access";
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
            description="O e-mail recebe avisos, comunicados e a recuperação de senha. O telefone ajuda a administração a falar com você."
          />
          <CardBody>
            <ProfileForm
              initialName={user.name}
              initialEmail={user.email}
              initialPhone={user.phone}
              initialBirthDate={user.birthDate}
              username={user.username}
              groupLabel={GROUP_LABELS[user.group]}
            />
          </CardBody>
        </Card>
        {isResidentHere(user) && (
          <Card className="lg:col-span-2">
            <CardHeader
              title="Dependentes"
              description="Quem mora com você e não usa o app (filhos, cônjuge…). Aprovados uma vez, entram nos pedidos de ingressos com a idade certa."
              action={
                <Link
                  href="/perfil/dependentes"
                  className={buttonClasses("secondary", "sm")}
                >
                  <UsersRound aria-hidden className="size-4" />
                  Meus dependentes
                </Link>
              }
            />
          </Card>
        )}
      </div>
    </>
  );
}
