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
