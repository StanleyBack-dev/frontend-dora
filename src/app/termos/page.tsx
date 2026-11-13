import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/design-system";
import { Logo } from "@/features/layout/components/Logo";

export const metadata: Metadata = { title: "Termos de uso e privacidade" };

const UPDATED_AT = "24/10/2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}

// Public (signed in or not): what the app is for, which personal data it
// keeps and for how long (LGPD), and the copyright terms of the audio files.
export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-bg px-4 py-10">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
          >
            <ArrowLeft className="size-4" /> Voltar ao app
          </Link>
        </div>
        <Card className="space-y-6 p-6 sm:p-8">
          <header>
            <h1 className="text-xl font-semibold text-fg">
              Termos de uso e privacidade
            </h1>
            <p className="mt-1 text-xs text-soft">
              Última atualização: {UPDATED_AT}
            </p>
          </header>

          <Section title="Para que serve o app">
            <p>
              O Dora organiza as reservas de quadras e espaços, os avisos e o
              atendimento do seu condomínio. O acesso é restrito aos moradores e
              à administração, com conta pessoal e intransferível, criada por um
              administrador ou aprovada a partir do cadastro pelo link.
            </p>
          </Section>

          <Section title="Quais dados pessoais o app guarda">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Conta: nome, e-mail, usuário e foto de perfil (opcional). A
                senha é guardada só de forma cifrada e ninguém, nem os
                administradores, consegue vê-la.
              </li>
              <li>Cadastro pelo link: nome completo, e-mail e telefone.</li>
              <li>
                Notificações, comunicados recebidos e solicitações de suporte.
              </li>
              <li>
                Segurança: endereço IP e navegador de cada sessão, e quem criou
                e alterou cada registro.
              </li>
            </ul>
          </Section>

          <Section title="Quem vê o quê">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Telefone e e-mail: só a administração, para falar com você sobre
                o condomínio.
              </li>
              <li>
                Suas solicitações de suporte: você e os administradores que
                respondem.
              </li>
            </ul>
          </Section>

          <Section title="Por quanto tempo">
            <ul className="list-disc space-y-1 pl-5">
              <li>Sessões encerradas (IP e navegador): 30 dias.</li>
              <li>Códigos de recuperação de senha: 7 dias depois de vencer.</li>
              <li>Notificações lidas: 1 ano.</li>
              <li>
                Dados da conta: enquanto você tiver acesso ao condomínio. A
                conta desativada deixa de entrar no app.
              </li>
            </ul>
          </Section>

          <Section title="Seus direitos">
            <p>
              Você pode ver e corrigir seu nome e e-mail em{" "}
              <Link href="/perfil" className="text-brand-ink hover:underline">
                Meu perfil
              </Link>
              , e escolher em{" "}
              <Link
                href="/configuracoes"
                className="text-brand-ink hover:underline"
              >
                Configurações
              </Link>{" "}
              quais avisos recebe por e-mail e em quais aparelhos recebe
              notificações. Para saber o que está guardado ou pedir a exclusão
              dos seus dados, fale com a administração do condomínio.
            </p>
          </Section>

          <Section title="Segurança">
            <p>
              Não compartilhe sua senha. Depois de várias tentativas erradas, a
              conta é bloqueada por alguns minutos. Se notar algo estranho, como
              um aviso de troca de senha que você não fez, avise a
              administração.
            </p>
          </Section>
        </Card>
      </div>
    </main>
  );
}
