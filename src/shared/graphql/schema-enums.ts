/** Como as moradias são identificadas: apartamentos (bloco e número) ou casas (rua, quadra e lote). */
export type AddressFormat =
  | 'APARTMENT'
  | 'HOUSE';

/** Módulos contratados à parte pelo condomínio. */
export type AppModule =
  | 'BOOKINGS'
  | 'EVENTS';

/** Quem é a pessoa do pedido: eu, um dependente ou outra pessoa. */
export type AttendeeSource =
  | 'DEPENDENT'
  | 'GUEST'
  | 'SELF';

/** Situação da reserva. */
export type BookingStatus =
  | 'CANCELLED'
  | 'CONFIRMED'
  | 'PENDING'
  | 'REJECTED';

/** Próximas (ainda não terminaram) ou passadas. */
export type BookingWhen =
  | 'PAST'
  | 'UPCOMING';

/** Quem recebe o comunicado. */
export type BroadcastAudience =
  | 'GRUPO'
  | 'TODOS';

/** Situação do condomínio na plataforma. */
export type CondominiumStatus =
  | 'ACTIVE'
  | 'SUSPENDED';

/** Parentesco com o morador. */
export type DependentRelationship =
  | 'CHILD'
  | 'GRANDCHILD'
  | 'OTHER'
  | 'PARENT'
  | 'SIBLING'
  | 'SPOUSE';

/** Aguardando aprovação, aprovado ou recusado. */
export type DependentStatus =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED';

/** Documento de identidade: CPF ou RG. */
export type DocumentType =
  | 'CPF'
  | 'RG';

/** Quem se cadastra: morador ou funcionário do condomínio. */
export type EnrollmentApplicant =
  | 'EMPLOYEE'
  | 'RESIDENT';

/** Situação do cadastro enviado pelo link público. */
export type EnrollmentStatus =
  | 'APROVADA'
  | 'PENDENTE'
  | 'RECUSADA';

/** Aguardando pagamento, em conferência, confirmado, recusado, expirado ou cancelado. */
export type EventOrderStatus =
  | 'AWAITING_REVIEW'
  | 'CANCELLED'
  | 'CONFIRMED'
  | 'EXPIRED'
  | 'PENDING_PAYMENT'
  | 'REJECTED';

/** Quem recebe os ingressos: o PIX do condomínio ou outro. */
export type EventPixSource =
  | 'CONDOMINIUM'
  | 'CUSTOM';

/** Quando as vendas fecham: algumas horas antes do início, ou só no fim do evento. */
export type EventSalesClose =
  | 'AT_END'
  | 'BEFORE_START';

/** Rascunho (só gestores), publicado ou cancelado. */
export type EventStatus =
  | 'CANCELLED'
  | 'DRAFT'
  | 'PUBLISHED';

/** Próximos (ainda não terminaram) ou passados. */
export type EventWhen =
  | 'PAST'
  | 'UPCOMING';

/** Se a portaria já pode liberar a entrada do convidado. */
export type GuestCheckInWindow =
  | 'CANCELLED'
  | 'FINISHED'
  | 'OPEN'
  | 'TOO_EARLY';

/** Situação do convite: válido, cancelado ou encerrado. */
export type GuestInviteStatus =
  | 'CANCELLED'
  | 'ENDED'
  | 'VALID';

/** Período do limite de reservas por unidade. */
export type LimitPeriod =
  | 'DAY'
  | 'MONTH'
  | 'WEEK';

/** Vínculo com o condomínio: morador ou funcionário. */
export type MemberKind =
  | 'EMPLOYEE'
  | 'RESIDENT';

/** Tamanho de cada intervalo da série: dia, semana ou mês. */
export type MetricsGranularity =
  | 'DAY'
  | 'MONTH'
  | 'WEEK';

export type NotificationType =
  | 'BOOKING_CANCELLED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_PENDING'
  | 'BOOKING_REJECTED'
  | 'BOOKING_SLOT_FREED'
  | 'BROADCAST'
  | 'DEPENDENT_APPROVED'
  | 'DEPENDENT_REJECTED'
  | 'DEPENDENT_SUBMITTED'
  | 'ENROLLMENT_SUBMITTED'
  | 'EVENT_CANCELLED'
  | 'EVENT_ORDER_CONFIRMED'
  | 'EVENT_ORDER_RECEIPT'
  | 'EVENT_ORDER_REJECTED'
  | 'EVENT_PUBLISHED'
  | 'SUPPORT_ANSWERED'
  | 'SUPPORT_FINALIZED'
  | 'SUPPORT_REQUESTED'
  | 'SYSTEM_ALERT';

/** Capacidade verificada pela API. */
export type Permission =
  | 'AUDIT_READ'
  | 'BOOKINGS_CREATE'
  | 'BOOKINGS_MANAGE'
  | 'CONDOMINIUMS_MANAGE'
  | 'DASHBOARD_READ'
  | 'EVENTS_MANAGE'
  | 'GUESTS_CHECKIN'
  | 'NOTIFICATIONS_BROADCAST'
  | 'PAYMENTS_MANAGE'
  | 'PERMISSIONS_MANAGE'
  | 'SPACES_MANAGE'
  | 'SUPPORTERS_MANAGE'
  | 'SUPPORT_MANAGE'
  | 'UNITS_MANAGE'
  | 'USERS_MANAGE';

/** Tipo da chave PIX: CPF, CNPJ, celular, e-mail ou aleatória. */
export type PixKeyType =
  | 'CNPJ'
  | 'CPF'
  | 'EMAIL'
  | 'PHONE'
  | 'RANDOM';

/** Situação de um horário na grade do dia. */
export type SlotState =
  | 'BLOCKED'
  | 'FREE'
  | 'MINE'
  | 'TAKEN'
  | 'UNAVAILABLE';

/** Tipo de espaço (quadra, salão de festas…). */
export type SpaceKind =
  | 'BARBECUE'
  | 'COURT'
  | 'GAME_ROOM'
  | 'GYM'
  | 'OTHER'
  | 'PARTY_ROOM'
  | 'POOL';

/** Do que se trata a solicitação de suporte. */
export type SupportCategory =
  | 'ACESSO'
  | 'DUVIDA'
  | 'OUTRO'
  | 'PROBLEMA'
  | 'SUGESTAO';

/** Aberto → respondido → finalizado. */
export type SupportStatus =
  | 'ABERTO'
  | 'FINALIZADO'
  | 'RESPONDIDO';

/** Se a portaria pode liberar o ingresso agora: aberta, cedo demais, encerrado ou cancelado. */
export type TicketEntryWindow =
  | 'CANCELLED'
  | 'FINISHED'
  | 'OPEN'
  | 'TOO_EARLY';

/** Público do ingresso: adulto, criança, infantil, idoso, estudante, PcD ou professor. */
export type TicketKind =
  | 'ADULT'
  | 'CHILD'
  | 'INFANT'
  | 'PCD'
  | 'SENIOR'
  | 'STUDENT'
  | 'TEACHER';

/** Ingresso válido, de evento cancelado ou já encerrado. */
export type TicketPassStatus =
  | 'CANCELLED'
  | 'ENDED'
  | 'VALID';

/** Quanto o público paga: inteira, meia, grátis ou outro valor. */
export type TicketPriceMode =
  | 'CUSTOM'
  | 'FREE'
  | 'FULL'
  | 'HALF';

/** Perfil de acesso: Morador, Gestor, Portaria ou Administrador geral. */
export type UserGroup =
  /** Gestor */
  | 'ADMIN'
  /** Administrador geral */
  | 'ADMIN_MASTER'
  /** Portaria */
  | 'CONCIERGE'
  /** Morador */
  | 'USER';
