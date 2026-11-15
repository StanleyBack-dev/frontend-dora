import {
  Bell,
  Building2,
  ChartColumn,
  CalendarDays,
  CircleHelp,
  CircleUserRound,
  DoorOpen,
  House,
  LifeBuoy,
  MapPin,
  Megaphone,
  Settings,
  ShieldCheck,
  UserCog,
  UsersRound,
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
    tour: "Sua página inicial: atalhos para o que você mais usa no condomínio aberto no topo do menu.",
    sections: {
      purpose: [
        {
          text: "Mostrar logo ao entrar o que importa agora e os atalhos do app.",
        },
        {
          text: "Gestores também veem o painel de gestão: moradores ativos, cadastros pendentes, espaços e unidades.",
          only: ["DASHBOARD_READ"],
        },
      ],
      howto: [
        {
          text: "Use os cartões de acesso rápido para ir direto a notificações, suporte e perfil.",
        },
        {
          text: "Participa de mais de um condomínio? Troque pelo seletor no topo do menu lateral. O app lembra a escolha: ao entrar de novo, você volta para o mesmo condomínio.",
        },
        {
          text: "Os cartões do painel levam direto à lista correspondente quando você pode abri-la.",
          only: ["DASHBOARD_READ"],
        },
      ],
    },
  },
  {
    id: "espacos",
    href: "/espacos",
    title: "Espaços",
    icon: MapPin,
    permission: "SPACES_MANAGE",
    area: "main",
    tour: "Os espaços do condomínio: cadastre, edite e desative quadras, salão e outros, com fotos, horário e regras de reserva e de uso.",
    sections: {
      purpose: [
        {
          text: "Ver os espaços do condomínio: quando funcionam, quanto dura cada reserva e as regras de uso.",
        },
      ],
      howto: [
        {
          text: "Use “Novo espaço” para cadastrar: dados, horário de funcionamento, regras de reserva e regras de uso.",
          only: ["SPACES_MANAGE"],
        },
        {
          text: "No espaço, “Desativar” tira o espaço da lista dos moradores durante uma reforma ou manutenção, sem perder nada.",
          only: ["SPACES_MANAGE"],
        },
      ],
      rules: [
        {
          text: "As regras de reserva (antecedência, limite por unidade, prazo para cancelar e aprovação) valem para as próximas reservas.",
        },
        {
          text: "Em “Taxa, convidados e recorrência”, defina se o espaço é pago (e o valor por reserva), se aceita lista de convidados (com limite e documento) e se moradores podem reservar toda semana. A taxa fica gravada em cada reserva: mudar o valor não altera as já feitas.",
          only: ["SPACES_MANAGE"],
        },
      ],
    },
  },
  {
    id: "reservas",
    href: "/reservas",
    title: "Reservas",
    icon: CalendarDays,
    area: "main",
    tour: "Reserve quadras e espaços em “Nova reserva” e acompanhe as suas reservas: as próximas e as passadas, com a situação de cada uma.",
    sections: {
      howto: [
        {
          text: "Toque em “Nova reserva”, escolha o espaço, o dia e um horário livre e confirme. Espaços com aprovação guardam o horário até a administração decidir.",
        },
        {
          text: "Na grade, horários em vermelho já têm reserva, os seus ficam em laranja e os cinza estão bloqueados ou fora do prazo.",
        },
        {
          text: "Toque num horário reservado para entrar na lista de espera: se ele for liberado, todos da lista são avisados e quem reservar primeiro fica com ele.",
          only: ["BOOKINGS_CREATE"],
        },
        {
          text: "Ao confirmar, marque “Repetir toda semana” para reservar o mesmo horário por 2 a 26 semanas (quando o espaço permite). Datas ocupadas são puladas e informadas.",
          only: ["BOOKINGS_CREATE"],
        },
        {
          text: "Em espaços com lista de convidados, use “Convidados” na reserva: cada convidado recebe o próprio convite com QR code; envie um por um pelo WhatsApp ou todos numa mensagem só.",
          only: ["BOOKINGS_CREATE"],
        },
        {
          text: "Na tela de reserva do espaço, use “Bloquear período” para fechá-lo numa manutenção ou evento; se houver reservas no período, você confirma o cancelamento e os moradores são avisados.",
          only: ["BOOKINGS_MANAGE"],
        },
        {
          text: "Em “Próximas”, veja as reservas marcadas e cancele se precisar.",
        },
        {
          text: "Em “Gestão”, veja todas as reservas do condomínio, aprove ou recuse as pendentes (com motivo), veja os convidados e cancele quando necessário.",
          only: ["BOOKINGS_MANAGE"],
        },
        {
          text: "Em “Taxas”, veja as taxas de uso do mês por unidade, marque as que já foram lançadas na cobrança do condomínio e exporte a planilha.",
          only: ["BOOKINGS_MANAGE"],
        },
      ],
      rules: [
        {
          text: "Cada espaço tem o seu prazo para cancelar; depois dele, só a administração cancela.",
        },
        {
          text: "O limite de reservas é por unidade: vale para todos os moradores da mesma unidade.",
        },
        {
          text: "Espaços pagos têm uma taxa por reserva, mostrada antes de confirmar. Reservas canceladas ou recusadas não são cobradas.",
        },
      ],
      notices: [
        {
          text: "Reserva confirmada chega no app e no e-mail, com um convite que coloca o horário na agenda do celular. Recusa e cancelamento também são avisados.",
        },
        {
          text: "Você é avisado quando uma reserva precisa da sua aprovação.",
          only: ["BOOKINGS_MANAGE"],
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
          text: "Ao abrir as notificações, todas ficam lidas; as novas continuam destacadas enquanto você está na página. Toque num aviso para abrir o que ele trata.",
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
    id: "moradores",
    href: "/moradores",
    title: "Moradores",
    icon: UsersRound,
    permission: "USERS_MANAGE",
    area: "main",
    tour: "Quem mora no condomínio: unidade, complemento, telefone e acesso de cada morador.",
    sections: {
      purpose: [
        {
          text: "A lista dos moradores do condomínio aberto, com a foto, a unidade e o complemento (ex.: casa dos fundos), o telefone, o e-mail e o último acesso. A administração e a portaria ficam em Equipe.",
        },
      ],
      howto: [
        {
          text: "Use “Adicionar” para incluir um morador: nome, e-mail, unidade, complemento e telefone. Conta nova recebe a senha temporária por e-mail.",
        },
        {
          text: "Toque no lápis para abrir a pessoa: corrija os dados, redefina a senha, desative o acesso ou abra exceções de permissão.",
        },
        {
          text: "Filtre por nome, e-mail ou telefone, por unidade ou situação.",
        },
      ],
      rules: [
        {
          text: "O login é sempre o e-mail. Quem já usa o Dora em outro condomínio entra com a mesma conta; os dados de acesso dela (nome, e-mail, telefone e senha) só a própria pessoa altera.",
        },
        {
          text: "Unidade, complemento e papel valem só para este condomínio. Mudar o papel de alguém para Administrador ou Portaria leva a pessoa para Equipe.",
        },
      ],
    },
  },
  {
    id: "equipe",
    href: "/equipe",
    title: "Equipe",
    icon: UserCog,
    permission: "USERS_MANAGE",
    area: "main",
    tour: "A administração e a portaria do condomínio: contato, papel e acesso de cada pessoa.",
    sections: {
      purpose: [
        {
          text: "Quem trabalha no condomínio com acesso ao Dora: os administradores (síndico, administração) e a portaria. Moradores ficam em Moradores.",
        },
      ],
      howto: [
        {
          text: "Use “Adicionar” para incluir alguém da equipe: nome, e-mail, papel (Administrador ou Portaria) e telefone. Conta nova recebe a senha temporária por e-mail.",
        },
        {
          text: "Funcionários também podem se cadastrar pelo link de cadastro, marcando “Funcionário”: na aprovação, escolha Portaria ou Administrador.",
        },
        {
          text: "Toque no lápis para abrir a pessoa: corrija os dados, troque o papel, redefina a senha ou desative o acesso.",
        },
      ],
    },
  },
  {
    id: "portaria",
    href: "/portaria",
    title: "Portaria",
    icon: DoorOpen,
    permission: "GUESTS_CHECKIN",
    area: "main",
    tour: "Os convidados das reservas de hoje: confira o código do convite e libere a entrada.",
    sections: {
      howto: [
        {
          text: "Leia o QR do convite (ou digite o código de 8 letras e números) e toque em “Liberar entrada”: a entrada daquele convidado é registrada na hora. Confira o documento, se houver.",
        },
        {
          text: "Sem o convite em mãos, use a lista do dia: busque pelo nome, documento, unidade ou código e toque em “Liberar entrada”. Ela se atualiza sozinha a cada minuto.",
        },
        {
          text: "Liberou a pessoa errada? Toque na seta ao lado de “Entrou às…” para desfazer.",
        },
      ],
      rules: [
        {
          text: "A entrada é liberada a partir de 3 horas antes da reserva, até o fim dela. Convites de reservas canceladas não valem.",
        },
        {
          text: "A Portaria vê só os convidados do condomínio e não faz reservas.",
        },
      ],
    },
  },
  {
    id: "painel",
    href: "/painel",
    title: "Painel",
    icon: ChartColumn,
    permission: "CONDOMINIUMS_MANAGE",
    area: "main",
    tour: "Os números do Dora: reservas, uso dos espaços, moradores e o que precisa de atenção, em todos os condomínios ou em um.",
    sections: {
      howto: [
        {
          text: "Escolha o período nos atalhos (7 dias, 30 dias, 90 dias, 12 meses) ou pelas datas, e filtre um condomínio se quiser. O período vai até 1 ano.",
        },
        {
          text: "Passe o mouse (ou toque) numa coluna para ver o número exato; “Ver tabela” mostra os mesmos números em lista.",
        },
        {
          text: "Em “Saúde da operação”, cada linha leva para onde resolver: cadastros parados, condomínios sem gestor ou sem unidades, suporte e avisos com problema.",
        },
      ],
      rules: [
        {
          text: "As reservas contam pelo dia do horário reservado. Uso dos espaços considera só as reservas ativas (pendentes ou confirmadas).",
        },
        {
          text: "“Saúde da operação” mostra a situação de agora, não do período. Os avisos com problema são de toda a plataforma.",
        },
        {
          text: "Só a administração da plataforma vê o Painel.",
        },
      ],
    },
  },
  {
    id: "condominios",
    href: "/condominios",
    title: "Condomínios",
    icon: Building2,
    permission: "CONDOMINIUMS_MANAGE",
    area: "main",
    tour: "Todos os condomínios que usam o Dora: situação, gestores, membros e cadastros pendentes.",
    sections: {
      howto: [
        {
          text: "Crie um condomínio, entre nele para administrar como gestor, edite os dados ou suspenda o acesso.",
        },
        {
          text: "Para trocar de condomínio a qualquer momento, use o seletor no topo do menu lateral; “Visão da plataforma” sai de todos. A escolha fica salva e o próximo login abre no mesmo lugar.",
        },
        {
          text: "Filtre por nome, cidade ou situação. Os números do topo somam todos os condomínios.",
        },
      ],
      rules: [
        {
          text: "Só a administração da plataforma vê esta tela; gestores nunca recebem esta permissão.",
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
    tour: "Unidades, cadastros pelo link público, links de convite e os logs do sistema.",
    sections: {
      howto: [
        {
          text: "Unidades: cadastre blocos e números de uma vez (ex.: 101-110, 201). Os moradores ficam vinculados a uma unidade.",
          only: ["UNITS_MANAGE"],
        },
        {
          text: "Cadastros: aprove ou recuse quem se cadastrou pelo link, conferindo a unidade e o complemento informados; ao aprovar, a pessoa ganha acesso ao condomínio (conta nova: a senha temporária vai por e-mail). Se o condomínio ainda não tem unidades, a pessoa digita o bloco e o número, e a unidade é criada na aprovação.",
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
          text: "Tudo aqui vale só para o condomínio aberto no topo do menu. Algumas permissões só vêm do papel e não podem ser dadas a uma pessoa (moradores, permissões, histórico, suporte e condomínios).",
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
