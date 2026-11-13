import type { Metadata } from "next";
import { KeyRound, MailCheck, ScrollText, Smartphone } from "lucide-react";
import { Card, CardBody, CardHeader, PageHeader } from "@/design-system";
import { SettingsLinkItem } from "@/features/settings/components/SettingsLinkItem";

export const metadata: Metadata = { title: "Configurações" };

const ITEMS = [
  {
    href: "/configuracoes/senha",
    icon: <KeyRound className="size-5" />,
    title: "Trocar senha",
    description: "Defina uma nova senha de acesso ao app.",
  },
  {
    href: "/configuracoes/aplicativo",
    icon: <Smartphone className="size-5" />,
    title: "Aplicativo no celular",
    description:
      "Instale o Dora na tela inicial e receba notificações neste aparelho.",
  },
  {
    href: "/configuracoes/notificacoes",
    icon: <MailCheck className="size-5" />,
    title: "Avisos por e-mail",
    description: "Escolha quais avisos também chegam no seu e-mail.",
  },
  {
    href: "/termos",
    icon: <ScrollText className="size-5" />,
    title: "Termos e privacidade",
    description: "Quais dados o app guarda e por quanto tempo.",
  },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Senha, aplicativo, avisos e documentos do Dora."
      />
      <Card>
        <CardHeader title="Preferências" />
        <CardBody className="space-y-3">
          {ITEMS.map((item) => (
            <SettingsLinkItem key={item.href} {...item} />
          ))}
        </CardBody>
      </Card>
    </>
  );
}
