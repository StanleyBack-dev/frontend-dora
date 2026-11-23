/** Como as moradias são identificadas: apartamentos (bloco e número) ou casas (rua, quadra e lote). */
export type AddressFormat =
  | 'APARTMENT'
  | 'HOUSE';

/** Módulos contratados à parte pelo condomínio. */
export type AppModule =
  | 'BOOKINGS'
  | 'EVENTS'
  | 'LOST_AND_FOUND'
  | 'PARCELS'
  | 'PURCHASES';

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

/** Categoria de uma compra, de um fornecedor ou de outro registro (manutenção, elétrica, limpeza, alimentação…); o que não estiver na lista é OTHER, com o texto digitado. */
export type Category =
  | 'CLEANING'
  | 'CONSTRUCTION'
  | 'ELECTRICAL'
  | 'ELEVATORS'
  | 'EVENTS'
  | 'FOOD'
  | 'FURNITURE'
  | 'GARDENING'
  | 'GAS'
  | 'MAINTENANCE'
  | 'OFFICE'
  | 'OTHER'
  | 'PAINTING'
  | 'PEST_CONTROL'
  | 'PLUMBING'
  | 'POOL'
  | 'PROFESSIONAL'
  | 'SECURITY'
  | 'TECHNOLOGY'
  | 'UNIFORMS';

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

/** O tipo do item achado. */
export type FoundItemCategory =
  | 'ACCESSORY'
  | 'BAG'
  | 'CLOTHING'
  | 'DOCUMENT'
  | 'ELECTRONICS'
  | 'KEYS'
  | 'OTHER'
  | 'TOY';

/** Pedido aguardando, aceito, recusado ou cancelado pelo morador. */
export type FoundItemClaimStatus =
  | 'ACCEPTED'
  | 'PENDING'
  | 'REJECTED'
  | 'WITHDRAWN';

/** Guardado, devolvido ao dono, doado ou descartado. */
export type FoundItemStatus =
  | 'DISCARDED'
  | 'DONATED'
  | 'FOUND'
  | 'RETURNED';

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

/** Tipo de tela do visitante. */
export type LandingDevice =
  | 'DESKTOP'
  | 'MOBILE'
  | 'TABLET';

/** O que aconteceu na landing page. */
export type LandingEventType =
  | 'CLICK'
  | 'DEMO_STEP'
  | 'FORM_ERROR'
  | 'FORM_START'
  | 'FORM_SUBMIT'
  | 'FORM_SUCCESS'
  | 'PAGE_VIEW'
  | 'SCROLL_DEPTH'
  | 'SECTION_VIEW'
  | 'VIDEO_COMPLETE'
  | 'VIDEO_PLAY';

/** Se o e-mail chegou à caixa do Dora. */
export type LandingLeadMailStatus =
  | 'FAILED'
  | 'HELD'
  | 'PENDING'
  | 'SENT';

/** Quem escreveu pelo site (síndico, administradora…). */
export type LandingLeadRole =
  | 'ADMINISTRADORA'
  | 'CONSELHO'
  | 'MORADOR'
  | 'OUTRO'
  | 'SINDICO';

/** Assunto da mensagem enviada pelo site. */
export type LandingLeadSubject =
  | 'DEMONSTRACAO'
  | 'DUVIDA'
  | 'ORCAMENTO'
  | 'PARCERIA'
  | 'SUPORTE';

/** Tamanho do condomínio, em unidades. */
export type LandingLeadUnitsRange =
  | 'ATE_50'
  | 'DE_51_A_150'
  | 'DE_151_A_400'
  | 'MAIS_DE_400';

/** Período do limite de reservas por unidade. */
export type LimitPeriod =
  | 'DAY'
  | 'MONTH'
  | 'WEEK';

/** Aviso de item perdido: procurando, encontrado, cancelado ou encerrado sem notícias. */
export type LostReportStatus =
  | 'CANCELLED'
  | 'EXPIRED'
  | 'FOUND'
  | 'OPEN';

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
  | 'FOUND_ITEM_CLAIMED'
  | 'FOUND_ITEM_CLAIM_DECIDED'
  | 'FOUND_ITEM_EXPIRING'
  | 'FOUND_ITEM_FOR_YOU'
  | 'FOUND_ITEM_NOT_OWNER'
  | 'FOUND_ITEM_RETURNED'
  | 'LOST_REPORT_EXPIRED'
  | 'LOST_REPORT_MATCH'
  | 'LOST_REPORT_SPOTTED'
  | 'PARCEL_AUTHORIZED'
  | 'PARCEL_CANCELLED'
  | 'PARCEL_PICKED_UP'
  | 'PARCEL_RECEIVED'
  | 'PARCEL_REMINDER'
  | 'PARCEL_RETURNED'
  | 'PURCHASE_APPROVAL_REQUESTED'
  | 'PURCHASE_APPROVED'
  | 'PURCHASE_COMPLETED'
  | 'PURCHASE_ORDERED'
  | 'PURCHASE_ORDER_CANCELLED'
  | 'PURCHASE_RECEIVED'
  | 'PURCHASE_REJECTED'
  | 'PURCHASE_REQUEST_CANCELLED'
  | 'PURCHASE_REQUEST_CREATED'
  | 'PURCHASE_RETURNED'
  | 'SUPPORT_ANSWERED'
  | 'SUPPORT_FINALIZED'
  | 'SUPPORT_REQUESTED'
  | 'SYSTEM_ALERT';

/** Na portaria, retirada, devolvida ao remetente ou cancelada (registrada por engano). */
export type ParcelStatus =
  | 'CANCELLED'
  | 'PICKED_UP'
  | 'RECEIVED'
  | 'RETURNED';

/** Forma de pagamento de uma cotação: PIX, dinheiro, cartão de débito ou de crédito, boleto, transferência, faturado ou outra (digitada). */
export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'BOLETO'
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'INVOICE'
  | 'OTHER'
  | 'PIX';

/** Capacidade verificada pela API. */
export type Permission =
  | 'AUDIT_READ'
  | 'BOOKINGS_CREATE'
  | 'BOOKINGS_MANAGE'
  | 'CONDOMINIUMS_MANAGE'
  | 'DASHBOARD_READ'
  | 'EVENTS_MANAGE'
  | 'GUESTS_CHECKIN'
  | 'LOST_FOUND_MANAGE'
  | 'NOTIFICATIONS_BROADCAST'
  | 'PARCELS_MANAGE'
  | 'PAYMENTS_MANAGE'
  | 'PERMISSIONS_MANAGE'
  | 'PURCHASES_APPROVE'
  | 'PURCHASES_MANAGE'
  | 'PURCHASES_REQUEST'
  | 'RESIDENTS_READ'
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

/** Decisão sobre uma compra: aprovada na alçada (ao escolher), aprovada, devolvida para cotação ou reprovada. */
export type PurchaseApprovalDecision =
  | 'APPROVED'
  | 'AUTO_APPROVED'
  | 'REJECTED'
  | 'RETURNED';

/** Como o condomínio aprova as compras: toda compra passa pelo aprovador (ALWAYS) ou, até o limite (alçada), segue aprovada ao escolher a cotação (LIMIT). */
export type PurchaseApprovalMode =
  | 'ALWAYS'
  | 'LIMIT';

/** Parcela a pagar: em aberto, vencida, vencendo em até 7 dias ou paga. */
export type PurchaseInstallmentState =
  | 'DUE_SOON'
  | 'OPEN'
  | 'OVERDUE'
  | 'PAID';

/** Prioridade de uma solicitação de compra. */
export type PurchasePriority =
  | 'HIGH'
  | 'LOW'
  | 'NORMAL'
  | 'URGENT';

/** Solicitação de compra: aguardando cotação, em cotação, aguardando aprovação, aprovada, pedido feito, recebida, concluída, reprovada ou cancelada. */
export type PurchaseRequestStatus =
  | 'APPROVED'
  | 'AWAITING_APPROVAL'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'OPEN'
  | 'ORDERED'
  | 'QUOTING'
  | 'RECEIVED'
  | 'REJECTED';

/** Localização do aparelho na assinatura: obtida, recusada ou indisponível. */
export type SignatureLocationStatus =
  | 'DENIED'
  | 'GRANTED'
  | 'UNAVAILABLE';

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

/** Fornecedor com CNPJ (empresa) ou CPF (autônomo). */
export type SupplierDocumentType =
  | 'CNPJ'
  | 'CPF';

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

/** Unidade com moradores ativos (ocupada) ou sem nenhum (vazia). */
export type UnitOccupancy =
  | 'EMPTY'
  | 'OCCUPIED';

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
