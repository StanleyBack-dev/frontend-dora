import type { NotificationType } from "@/shared/contracts/notifications";

/** What each kind of notice is about (preferences page). */
export const NOTIFICATION_TYPE_LABELS: Record<
  NotificationType,
  { label: string; description: string }
> = {
  BROADCAST: {
    label: "Comunicados",
    description: "Avisos enviados pela administração do condomínio.",
  },
  BOOKING_CONFIRMED: {
    label: "Reserva confirmada",
    description:
      "Sua reserva foi confirmada (com o convite para a agenda do celular).",
  },
  BOOKING_PENDING: {
    label: "Reserva aguardando aprovação",
    description:
      "Sua reserva foi enviada para aprovação; para gestores, uma reserva aguarda a sua decisão.",
  },
  BOOKING_REJECTED: {
    label: "Reserva recusada",
    description: "A administração recusou uma reserva sua, com o motivo.",
  },
  BOOKING_CANCELLED: {
    label: "Reserva cancelada",
    description:
      "Uma reserva sua foi cancelada (por você ou pela administração).",
  },
  EVENT_PUBLISHED: {
    label: "Novo evento",
    description:
      "Um evento do condomínio foi publicado (com o convite para a agenda do celular).",
  },
  EVENT_CANCELLED: {
    label: "Evento cancelado",
    description: "Um evento publicado foi cancelado, com o motivo.",
  },
  EVENT_ORDER_RECEIPT: {
    label: "Pedido de ingressos para conferir",
    description:
      "Um morador enviou o comprovante do PIX e/ou os documentos de um pedido de ingressos.",
  },
  DEPENDENT_SUBMITTED: {
    label: "Dependente para aprovar",
    description:
      "Um morador cadastrou um dependente, com o documento da data de nascimento.",
  },
  DEPENDENT_APPROVED: {
    label: "Dependente aprovado",
    description:
      "Seu dependente foi aprovado e já pode entrar nos pedidos de ingressos.",
  },
  DEPENDENT_REJECTED: {
    label: "Dependente recusado",
    description: "Seu dependente não foi aprovado, com o motivo.",
  },
  PARCEL_RECEIVED: {
    label: "Encomenda recebida",
    description:
      "Chegou uma encomenda para a sua unidade, com o código de retirada.",
  },
  PARCEL_REMINDER: {
    label: "Encomenda aguardando retirada",
    description: "Lembrete de uma encomenda da sua unidade parada há dias.",
  },
  PARCEL_PICKED_UP: {
    label: "Encomenda retirada",
    description: "Uma encomenda da sua unidade foi retirada, e por quem.",
  },
  PARCEL_RETURNED: {
    label: "Encomenda devolvida",
    description:
      "Uma encomenda da sua unidade voltou ao remetente, com o motivo.",
  },
  PARCEL_AUTHORIZED: {
    label: "Retirada autorizada",
    description:
      "Alguém autorizou outra pessoa a retirar uma encomenda que você vê.",
  },
  PARCEL_CANCELLED: {
    label: "Aviso de encomenda cancelado",
    description: "Um aviso de encomenda registrado por engano foi cancelado.",
  },
  FOUND_ITEM_CLAIMED: {
    label: "Pedido de item achado",
    description:
      "Para a portaria e a gestão: um morador disse que um item achado é seu.",
  },
  FOUND_ITEM_CLAIM_DECIDED: {
    label: "Resposta ao seu pedido de item achado",
    description:
      "A portaria aceitou (venha buscar) ou recusou, com o motivo, o seu pedido.",
  },
  FOUND_ITEM_RETURNED: {
    label: "Item achado devolvido",
    description:
      "Um item achado que você pediu foi devolvido, com o comprovante (ou entregue a outra pessoa).",
  },
  FOUND_ITEM_FOR_YOU: {
    label: "Item achado para você",
    description:
      "A portaria achou um item e indicou que é seu (ou da sua unidade): retire lá com um documento.",
  },
  FOUND_ITEM_NOT_OWNER: {
    label: "Item achado não é do morador",
    description:
      "Para a portaria e a gestão: o morador indicado disse que o item não é seu, e ele passou a aparecer para todos.",
  },
  LOST_REPORT_MATCH: {
    label: "Pode ser o que você perdeu",
    description:
      "Você avisou em “Perdi algo” e a portaria registrou um item da mesma categoria.",
  },
  LOST_REPORT_EXPIRED: {
    label: "Aviso de item perdido encerrado",
    description:
      "Um aviso de “Perdi algo” ficou 90 dias sem notícias e foi encerrado.",
  },
  LOST_REPORT_SPOTTED: {
    label: "Um vizinho achou o que foi perdido",
    description:
      "Um vizinho viu o aviso no mural e diz que achou o item: quem perdeu e a portaria são avisados.",
  },
  PURCHASE_REQUEST_CREATED: {
    label: "Nova solicitação de compra",
    description:
      "Para a gestão: alguém da equipe pediu uma compra; confira os itens e comece as cotações.",
  },
  PURCHASE_REQUEST_CANCELLED: {
    label: "Solicitação de compra cancelada",
    description:
      "Uma solicitação de compra que você fez foi cancelada pela gestão, com o motivo.",
  },
  FOUND_ITEM_EXPIRING: {
    label: "Item achado perto do fim da guarda",
    description:
      "Para a portaria e a gestão: um item achado completa o prazo de guarda em 7 dias.",
  },
  EVENT_ORDER_CONFIRMED: {
    label: "Ingressos confirmados",
    description:
      "Seu pedido de ingressos (ou inscrição grátis) para um evento foi confirmado.",
  },
  EVENT_ORDER_REJECTED: {
    label: "Pedido de ingressos recusado",
    description:
      "O comprovante ou os documentos do seu pedido de ingressos não foram aceitos, com o motivo.",
  },
  BOOKING_SLOT_FREED: {
    label: "Horário liberado",
    description:
      "Um horário que você esperava na lista de espera foi liberado.",
  },
  SUPPORT_REQUESTED: {
    label: "Nova solicitação de suporte",
    description: "Para o administrador geral: alguém pediu ajuda pelo Suporte.",
  },
  SUPPORT_ANSWERED: {
    label: "Resposta do suporte",
    description: "O suporte respondeu uma solicitação sua.",
  },
  SUPPORT_FINALIZED: {
    label: "Suporte finalizado",
    description: "Uma solicitação sua ao suporte foi finalizada.",
  },
  ENROLLMENT_SUBMITTED: {
    label: "Novo cadastro",
    description:
      "Para o administrador geral: alguém enviou o cadastro pelo link e aguarda aprovação.",
  },
  SYSTEM_ALERT: {
    label: "Alerta do sistema",
    description:
      "Para o administrador geral: erros, eventos de segurança e rotinas que falharam (detalhes em Administração → Logs).",
  },
};

/** "há 5 min", "ontem", "12/11". */
export function formatWhen(iso: string, now: Date): string {
  const diff = (now.getTime() - new Date(iso).getTime()) / 60_000;
  if (diff < 1) return "agora";
  if (diff < 60) return `há ${Math.floor(diff)} min`;
  if (diff < 24 * 60) return `há ${Math.floor(diff / 60)} h`;
  if (diff < 48 * 60) return "ontem";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(iso));
}
