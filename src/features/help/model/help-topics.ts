import {
  Bell,
  CircleHelp,
  CircleUserRound,
  House,
  LifeBuoy,
  Megaphone,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/shared/contracts/api";

// The app's manual, in one place: the help page (Ajuda), the help button in
// each page's header and the guided tour (onboarding) all read from here.
// Items marked `only` show to whoever has any of those permissions, so each
// person reads what applies to them.

export type HelpItem = {
  text: string;
  /** Shown only with any of these permissions. */
  only?: Permission[];
};

export type HelpSectionKind =
  "purpose" | "howto" | "rules" | "access" | "notices";

export const HELP_SECTION_TITLES: Record<HelpSectionKind, string> = {
  purpose: "Para que serve",
  howto: "Como usar",
  rules: "Regras importantes",
  access: "Quem pode fazer o quê",
  notices: "Avisos e notificações",
};

export type HelpTopic = {
  id: string;
  /** The page (and the pages under it) the topic explains. */
  href: string;
  title: string;
  icon: LucideIcon;
  /** Same rule as the menu: visible with this permission… */
  permission?: Permission;
  /** …or with any of these. */
  anyPermission?: Permission[];
  /** Only for who sees the admin area. */
  admin?: boolean;
  /** Where the topic lives in the menu (tour and help page). */
  area: "main" | "account";
  /** One or two lines for the guided tour. */
  tour: string;
  sections: Partial<Record<HelpSectionKind, HelpItem[]>>;
};

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "inicio",
    href: "/inicio",
    title: "Início",
    icon: House,
    area: "main",
    tour: "Sua página inicial: atalhos para o que você mais usa. As reservas de quadras e espaços chegam aqui em breve.",
    sections: {
      purpose: [
        {
          text: "Mostrar logo ao entrar o que importa agora e os atalhos do app.",
        },
        {
          text: "Gestores também veem o painel de gestão: contas ativas, cadastros pendentes, suporte em aberto e avisos que não foram entregues.",
          only: ["DASHBOARD_READ"],
        },
      ],
      howto: [
        {
          text: "Use os cartões de acesso rápido para ir direto a notificações, suporte e perfil.",
        },
        {
          text: "Os cartões do painel levam direto à lista correspondente quando você pode abri-la.",
          only: ["DASHBOARD_READ"],
        },
      ],
    },
  },
  {
    id: "comunicados",
    href: "/comunicados",
    title: "Comunicados",
    icon: Megaphone,
    permission: "NOTIFICATIONS_BROADCAST",
    area: "main",
    tour: "Avisos para todo o condomínio ou para um grupo de acesso (moradores, gestores…).",
    sections: {
      howto: [
        { text: "Escolha o público, escreva o título e a mensagem e envie." },
        { text: "Marque “Também enviar por e-mail” para avisos importantes." },
      ],
      notices: [
        {
          text: "O aviso chega no app (e no celular, para quem ativou) com o seu nome.",
        },
      ],
    },
  },
  {
    id: "perfil",
    href: "/perfil",
    title: "Meu perfil",
    icon: CircleUserRound,
    area: "account",
    tour: "Sua foto e seus dados pessoais. O e-mail recebe avisos, comunicados e a recuperação de senha.",
    sections: {
      howto: [
        {
          text: "Troque a foto de perfil: ela ajuda a administração a identificar você.",
        },
        { text: "Mantenha o e-mail atualizado para receber os avisos." },
      ],
    },
  },
  {
    id: "notificacoes",
    href: "/notificacoes",
    title: "Notificações",
    icon: Bell,
    area: "account",
    tour: "Todos os avisos do app num só lugar; o sino no topo mostra os não lidos.",
    sections: {
      howto: [
        {
          text: "Toque num aviso para abrir o que ele trata e marcá-lo como lido.",
        },
        {
          text: "Escolha quais avisos também chegam por e-mail em Configurações → Notificações.",
        },
      ],
    },
  },
  {
    id: "suporte",
    href: "/suporte",
    title: "Suporte",
    icon: LifeBuoy,
    area: "account",
    tour: "Fale com a administração do sistema: até 3 solicitações por dia, com resposta no app e no e-mail.",
    sections: {
      howto: [
        {
          text: "Escolha a categoria, escreva o assunto e descreva o que precisa.",
        },
        { text: "Acompanhe a resposta em “Minhas solicitações”." },
        {
          text: "Na aba “Todas”, responda e finalize as solicitações de todos.",
          only: ["SUPPORT_MANAGE"],
        },
      ],
      rules: [
        {
          text: "Até 3 solicitações por dia; depois, o formulário mostra quanto falta para liberar.",
        },
        {
          text: "Cada solicitação recebe um protocolo (#000001) para referência.",
        },
      ],
      notices: [
        {
          text: "Você é avisado quando o suporte responde e quando a solicitação é finalizada.",
        },
        {
          text: "Você é avisado no app e por e-mail de cada nova solicitação.",
          only: ["SUPPORT_MANAGE"],
        },
      ],
    },
  },
  {
    id: "configuracoes",
    href: "/configuracoes",
    title: "Configurações",
    icon: Settings,
    area: "account",
    tour: "Senha, instalação do app no celular, notificações no aparelho e por e-mail, e os termos de uso.",
    sections: {
      howto: [
        {
          text: "Senha: troque a sua; as sessões em outros aparelhos são encerradas.",
        },
        {
          text: "Aplicativo: instale o Dora na tela inicial e ative os avisos no aparelho (faça em cada celular ou computador).",
        },
        {
          text: "Notificações: escolha quais avisos também chegam por e-mail.",
        },
      ],
    },
  },
  {
    id: "ajuda",
    href: "/ajuda",
    title: "Ajuda",
    icon: CircleHelp,
    area: "account",
    tour: "Este guia: como usar cada menu de acordo com o que você pode fazer no app.",
    sections: {
      howto: [
        {
          text: "Cada página também tem o ícone de ajuda no título, com as informações daquela página.",
        },
        {
          text: "Use “Rever a apresentação” para ver o passo a passo de novo.",
        },
      ],
    },
  },
  {
    id: "admin",
    href: "/admin",
    title: "Administração",
    icon: ShieldCheck,
    admin: true,
    area: "account",
    tour: "Moradores e gestores do condomínio, unidades, cadastros pelo link público, links de convite e os logs do sistema.",
    sections: {
      howto: [
        {
          text: "Moradores: adicione pessoas ao condomínio, defina o papel (Morador ou Gestor) e a unidade, abra exceções de permissão, redefina senhas e desative o acesso. Quem já usa o Dora em outro condomínio entra com a mesma conta.",
          only: ["USERS_MANAGE"],
        },
        {
          text: "Unidades: cadastre blocos e números de uma vez (ex.: 101-110, 201). Os moradores ficam vinculados a uma unidade.",
          only: ["UNITS_MANAGE"],
        },
        {
          text: "Cadastros: aprove ou recuse quem se cadastrou pelo link; ao aprovar, a pessoa ganha acesso ao condomínio (conta nova: a senha temporária vai por e-mail).",
          only: ["USERS_MANAGE"],
        },
        {
          text: "Links de cadastro: gere um código de convite e compartilhe pelo WhatsApp com os moradores.",
          only: ["USERS_MANAGE"],
        },
        {
          text: "Logs e alertas: erros da API e do banco, eventos de segurança, avisos não entregues, rotinas do GitHub que falharam e erros de tela. Filtre por período, nível, tipo, ambiente ou busca e abra a seta para ver os detalhes.",
          only: ["AUDIT_READ"],
        },
      ],
      rules: [
        {
          text: "Tudo aqui vale só para o condomínio aberto no topo do menu. Algumas permissões só vêm do papel e não podem ser dadas a uma pessoa (moradores, permissões, histórico e suporte).",
        },
        {
          text: "Os logs ficam 90 dias e não guardam senhas, tokens ou e-mails completos.",
          only: ["AUDIT_READ"],
        },
      ],
      notices: [
        {
          text: "Problemas sérios (erros, contas bloqueadas, excesso de tentativas, rotinas que falharam) também chegam no app e por e-mail, no máximo um aviso a cada 30 minutos por tipo.",
          only: ["AUDIT_READ"],
        },
      ],
    },
  },
];

/** The topics this person may read (same rule as the menu). */
export function visibleTopics(
  permissions: readonly Permission[],
  showAdmin: boolean,
): HelpTopic[] {
  return HELP_TOPICS.filter(
    (topic) =>
      (!topic.admin || showAdmin) &&
      (!topic.permission || permissions.includes(topic.permission)) &&
      (!topic.anyPermission ||
        topic.anyPermission.some((item) => permissions.includes(item))),
  );
}

/** The topic's sections with only the items for these permissions. */
export function sectionsFor(
  topic: HelpTopic,
  permissions: readonly Permission[],
): { kind: HelpSectionKind; title: string; items: string[] }[] {
  return (Object.keys(HELP_SECTION_TITLES) as HelpSectionKind[]).flatMap(
    (kind) => {
      const items = (topic.sections[kind] ?? [])
        .filter(
          (item) =>
            !item.only || item.only.some((p) => permissions.includes(p)),
        )
        .map((item) => item.text);
      return items.length > 0
        ? [{ kind, title: HELP_SECTION_TITLES[kind], items }]
        : [];
    },
  );
}

/** The topic of a page (the longest matching path). */
export function topicForPath(pathname: string): HelpTopic | null {
  return (
    HELP_TOPICS.filter(
      (topic) =>
        pathname === topic.href || pathname.startsWith(`${topic.href}/`),
    ).sort((a, b) => b.href.length - a.href.length)[0] ?? null
  );
}
