/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AddBookingGuestsInput = {
  bookingId: string | number;
  guests: Array<GuestInput>;
};

/** Como as moradias são identificadas: apartamentos (bloco e número) ou casas (rua, quadra e lote). */
export type AddressFormat =
  | 'APARTMENT'
  | 'HOUSE';

/** Módulos contratados à parte pelo condomínio. */
export type AppModule =
  | 'BOOKINGS'
  | 'EVENTS'
  | 'LOST_AND_FOUND'
  | 'PARCELS';

export type AttendeeInput = {
  /** Com GUEST: idade. */
  age?: number | null | undefined;
  /** Com DEPENDENT: qual. */
  dependentId?: string | number | null | undefined;
  /** Com GUEST: nome completo. */
  name?: string | null | undefined;
  /** Com GUEST: convidado de fora do condomínio. */
  outside: boolean;
  /** Eu, um dependente aprovado ou outra pessoa. */
  source: AttendeeSource;
  /** Ingresso (público) da pessoa, em evento com ingresso. */
  ticketTypeId?: string | number | null | undefined;
};

/** Quem é a pessoa do pedido: eu, um dependente ou outra pessoa. */
export type AttendeeSource =
  | 'DEPENDENT'
  | 'GUEST'
  | 'SELF';

/** Pessoa autorizada a retirar uma encomenda. */
export type AuthorizeParcelPickupInput = {
  /** CPF ou RG (opcional). */
  document?: string | null | undefined;
  documentType?: DocumentType | null | undefined;
  /** Nome completo de quem vai retirar. */
  name: string;
  parcelId: string | number;
};

export type BookingFilterInput = {
  /** Começa a partir deste instante (início do calendário). */
  from?: string | null | undefined;
  spaceId?: string | number | null | undefined;
  status?: BookingStatus | null | undefined;
  /** Começa antes deste instante (fim do calendário, exclusivo). */
  to?: string | null | undefined;
  when?: BookingWhen | null | undefined;
};

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

export type BroadcastInput = {
  audience: BroadcastAudience;
  body: string;
  /** Também envia por e-mail. */
  sendEmail: boolean;
  targetGroup?: UserGroup | null | undefined;
  title: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type CheckInEventTicketInput = {
  /** A pessoa do pedido. */
  attendeeId?: string | number | null | undefined;
  /** Código do ingresso. */
  code?: string | null | undefined;
};

export type CheckInGuestInput = {
  /** Código do convite. */
  code?: string | null | undefined;
  guestId?: string | number | null | undefined;
};

export type CondominiumFilterInput = {
  search?: string | null | undefined;
  status?: CondominiumStatus | null | undefined;
};

export type CondominiumInput = {
  /** Apartamentos (bloco e número, padrão) ou casas (rua, quadra e lote). */
  addressFormat?: AddressFormat | null | undefined;
  city: string;
  /** CNPJ (opcional). */
  document?: string | null | undefined;
  name: string;
  /** UF. */
  state: string;
};

/** Situação do condomínio na plataforma. */
export type CondominiumStatus =
  | 'ACTIVE'
  | 'SUSPENDED';

export type CreateBookingInput = {
  /** Observação (até 300). */
  notes?: string | null | undefined;
  spaceId: string | number;
  /** Início de um dos horários da grade. */
  startsAt: string;
};

export type CreateBookingSeriesInput = {
  /** Observação (até 300). */
  notes?: string | null | undefined;
  spaceId: string | number;
  /** Primeira data: um dos horários da grade. */
  startsAt: string;
  /** Quantas semanas (2 a 26). */
  weeks: number;
};

export type CreateEnrollmentInviteInput = {
  label: string;
  /** Validade em dias (1 a 30). */
  validDays: number;
};

export type CreateSpaceBlockInput = {
  /** Cancela as reservas ativas do período (cada morador é avisado). Sem isso, a API diz quantas há. */
  cancelOverlapping: boolean;
  endsAt: string;
  reason: string;
  spaceId: string | number;
  startsAt: string;
};

export type CreateUnitsInput = {
  /** Bloco ou torre. */
  block?: string | null | undefined;
  /** Números e faixas: "101-104, 201". */
  numbers: string;
  /** Rua (só em condomínios de casas). */
  street?: string | null | undefined;
};

export type CreateUserInput = {
  /** Data de nascimento AAAA-MM-DD. */
  birthDate?: string | null | undefined;
  email: string;
  /** Só para funcionários. */
  employee?: EmployeeProfileInput | null | undefined;
  /** Permissões: USER, CONCIERGE (portaria) ou ADMIN (gestor). */
  group: UserGroup;
  /** Morador (padrão) ou funcionário. */
  kind?: MemberKind | null | undefined;
  name: string;
  /** Telefone de contato. */
  phone?: string | null | undefined;
  /** Complemento do endereço no condomínio ("casa dos fundos"). */
  unitComplement?: string | null | undefined;
  /** Só para moradores. */
  unitId?: string | number | null | undefined;
};

/** Filtros dos convidados de um dia. */
export type DayGuestFilterInput = {
  /** true: só quem já entrou; false: só quem ainda não entrou. */
  checkedIn?: boolean | null | undefined;
  /** Um convidado. */
  guestId?: string | number | null | undefined;
  /** Quem reservou (quem convidou). */
  hostId?: string | number | null | undefined;
  /** O espaço reservado. */
  spaceId?: string | number | null | undefined;
  /** A unidade da reserva. */
  unitId?: string | number | null | undefined;
};

export type DependentInput = {
  /** Data de nascimento AAAA-MM-DD. */
  birthDate: string;
  /** Documento com a data de nascimento (imagem ou PDF em base64, até 1,2 MB). */
  document: string;
  /** Nome completo. */
  name: string;
  relationship: DependentRelationship;
};

/** Parentesco com o morador. */
export type DependentRelationship =
  | 'CHILD'
  | 'GRANDCHILD'
  | 'OTHER'
  | 'PARENT'
  | 'SIBLING'
  | 'SPOUSE';

/** O que filtra a lista de dependentes da gestão. */
export type DependentReviewFilterInput = {
  dependentId?: string | number | null | undefined;
  /** O morador que cadastrou (id do usuário). */
  holderId?: string | number | null | undefined;
  relationship?: DependentRelationship | null | undefined;
  status?: DependentStatus | null | undefined;
  unitId?: string | number | null | undefined;
};

/** Aguardando aprovação, aprovado ou recusado. */
export type DependentStatus =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED';

/** Documento de identidade: CPF ou RG. */
export type DocumentType =
  | 'CPF'
  | 'RG';

/** Ficha do funcionário (todos os campos opcionais). */
export type EmployeeProfileInput = {
  /** Empresa terceirizada, quando houver. */
  contractor?: string | null | undefined;
  /** Data de admissão (AAAA-MM-DD). */
  hiredOn?: string | null | undefined;
  /** Cargo. */
  jobTitle?: string | null | undefined;
  /** Turno ou jornada. */
  workShift?: string | null | undefined;
};

/** Quem se cadastra: morador ou funcionário do condomínio. */
export type EnrollmentApplicant =
  | 'EMPLOYEE'
  | 'RESIDENT';

/** Dados do cadastro (formulário ou correção). */
export type EnrollmentDataInput = {
  /** Data de nascimento AAAA-MM-DD (obrigatória no formulário público). */
  birthDate?: string | null | undefined;
  email: string;
  fullName: string;
  phone: string;
  /** Bloco ou torre digitado (quando o condomínio ainda não tem unidades); em casas, a quadra. */
  unitBlock?: string | null | undefined;
  /** Complemento do endereço no condomínio ("casa dos fundos"). */
  unitComplement?: string | null | undefined;
  /** Unidade (obrigatória quando o condomínio tem unidades). Na aprovação, ausente mantém a escolhida. */
  unitId?: string | number | null | undefined;
  /** Número da casa ou apartamento digitado (quando o condomínio ainda não tem unidades). Na aprovação, ausente mantém o informado. */
  unitNumber?: string | null | undefined;
  /** Rua digitada (condomínio de casas; com a quadra em unitBlock e o lote em unitNumber). */
  unitStreet?: string | null | undefined;
};

export type EnrollmentRequestFilterInput = {
  /** Exatamente este e-mail. */
  email?: string | null | undefined;
  /** Exatamente este cadastro. */
  requestId?: string | number | null | undefined;
  search?: string | null | undefined;
  status?: EnrollmentStatus | null | undefined;
};

/** Situação do cadastro enviado pelo link público. */
export type EnrollmentStatus =
  | 'APROVADA'
  | 'PENDENTE'
  | 'RECUSADA';

/** Endereço do local fora do condomínio. */
export type EventAddressInput = {
  city: string;
  complement?: string | null | undefined;
  district: string;
  /** Número ou "S/N". */
  number: string;
  /** UF. */
  state: string;
  street: string;
  /** CEP (8 números). */
  zip: string;
};

export type EventInput = {
  /** Obrigatório sem espaço: o evento é fora do condomínio. */
  address?: EventAddressInput | null | undefined;
  /** Lotação total. */
  capacity: number;
  /** Com pixSource CUSTOM: o PIX do evento. */
  customPix?: EventPixInput | null | undefined;
  description?: string | null | undefined;
  endsAt: string;
  /** Convidados de fora do condomínio (0: só moradores). */
  externalGuestLimit: number;
  /** Com ingresso: o valor da inteira, em centavos. */
  fullPriceCents?: number | null | undefined;
  /** Com espaço, um detalhe ("área coberta"); fora, o nome do local ("Chácara Bela Vista"). */
  location?: string | null | undefined;
  /** Com ingresso: o PIX do condomínio ou outro. */
  pixSource?: EventPixSource | null | undefined;
  /** Quando as vendas fecham (padrão: no início do evento). */
  salesClose?: EventSalesClose | null | undefined;
  /** BEFORE_START: quantas horas antes do início (0 a 720). */
  salesCloseHours?: number | null | undefined;
  /** Espaço do condomínio (sem espaço: informe o endereço). */
  spaceId?: string | number | null | undefined;
  startsAt: string;
  /** Com ingresso: os públicos aceitos, na ordem. */
  ticketTypes?: Array<TicketTypeInput> | null | undefined;
  /** Entrada com ingresso pago (Pix). */
  ticketed: boolean;
  title: string;
  /** Máximo de ingressos por unidade (vazio: sem limite). */
  unitTicketLimit?: number | null | undefined;
};

/** Filtros dos pedidos de um evento. */
export type EventOrderFilterInput = {
  /** Quem fez o pedido. */
  buyerId?: string | number | null | undefined;
  /** O código do pedido. */
  code?: string | null | undefined;
  /** Só estas situações (vazio: todas). */
  statuses?: Array<EventOrderStatus> | null | undefined;
  /** A unidade do pedido. */
  unitId?: string | number | null | undefined;
};

/** Aguardando pagamento, em conferência, confirmado, recusado, expirado ou cancelado. */
export type EventOrderStatus =
  | 'AWAITING_REVIEW'
  | 'CANCELLED'
  | 'CONFIRMED'
  | 'EXPIRED'
  | 'PENDING_PAYMENT'
  | 'REJECTED';

export type EventPixInput = {
  /** Cidade de quem recebe. */
  city: string;
  /** Chave PIX. */
  key: string;
  /** Tipo da chave: define como ela é conferida. */
  keyType: PixKeyType;
  /** Nome de quem recebe, como aparece no banco. */
  name: string;
};

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

/** Filtros dos ingressos de um evento. */
export type EventTicketFilterInput = {
  /** Uma pessoa (o id do ingresso). */
  attendeeId?: string | number | null | undefined;
  /** true: só quem fez o pedido; false: só os acompanhantes. */
  buyer?: boolean | null | undefined;
  /** true: só quem já entrou; false: só quem ainda não entrou. */
  checkedIn?: boolean | null | undefined;
  /** O código de um ingresso. */
  code?: string | null | undefined;
  /** true: só convidados de fora; false: só do condomínio. */
  outside?: boolean | null | undefined;
  /** O tipo de ingresso (pelo nome). */
  ticketName?: string | null | undefined;
  /** A unidade de quem pediu. */
  unitId?: string | number | null | undefined;
};

/** Próximos (ainda não terminaram) ou passados. */
export type EventWhen =
  | 'PAST'
  | 'UPCOMING';

/** Filtros das taxas de uso de um mês. */
export type FeeFilterInput = {
  /** true: só as lançadas na cobrança; false: só as pendentes. */
  billed?: boolean | null | undefined;
  /** O espaço reservado. */
  spaceId?: string | number | null | undefined;
  /** A unidade da reserva. */
  unitId?: string | number | null | undefined;
  /** Quem reservou. */
  userId?: string | number | null | undefined;
};

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

/** Filtros dos itens achados. */
export type FoundItemFilterInput = {
  category?: FoundItemCategory | null | undefined;
  /** Exatamente este local onde foi achado. */
  foundLocation?: string | null | undefined;
  from?: string | null | undefined;
  /** Itens reservados para este morador ou que ele pediu. */
  residentId?: string | number | null | undefined;
  /** Parte do que é, da descrição ou de onde foi achado. */
  search?: string | null | undefined;
  statuses?: Array<FoundItemStatus> | null | undefined;
  /** Exatamente este local de guarda. */
  storageLocation?: string | null | undefined;
  /** Exatamente este item (o que é). */
  title?: string | null | undefined;
  to?: string | null | undefined;
  /** Só os itens com pedidos aguardando. */
  withPendingClaims?: boolean | null | undefined;
};

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

export type GuestInput = {
  /** CPF (11 números) ou RG (7 a 10: números e um X no fim). */
  document?: string | null | undefined;
  /** Tipo do documento (obrigatório com documento). */
  documentType?: DocumentType | null | undefined;
  name: string;
  phone?: string | null | undefined;
};

/** Situação do convite: válido, cancelado ou encerrado. */
export type GuestInviteStatus =
  | 'CANCELLED'
  | 'ENDED'
  | 'VALID';

export type GuestRulesInput = {
  /** Quem reserva pode levar convidados. */
  allowed: boolean;
  /** A portaria exige o documento de cada convidado. */
  documentRequired: boolean;
  /** Máximo de convidados por reserva (vazio: sem limite). */
  max?: number | null | undefined;
};

/** Período do limite de reservas por unidade. */
export type LimitPeriod =
  | 'DAY'
  | 'MONTH'
  | 'WEEK';

export type LoginInput = {
  /** Usuário ou e-mail. */
  login: string;
  password: string;
};

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
  | 'SUPPORT_ANSWERED'
  | 'SUPPORT_FINALIZED'
  | 'SUPPORT_REQUESTED'
  | 'SYSTEM_ALERT';

export type OpeningHoursInput = {
  /** "HH:MM" ("24:00" = até meia-noite). */
  closesAt: string;
  /** "HH:MM". */
  opensAt: string;
  /** 0 = domingo … 6 = sábado. */
  weekday: number;
};

export type PageInput = {
  limit?: number;
  page?: number;
};

/** Filtros das encomendas do condomínio. */
export type ParcelFilterInput = {
  /** A transportadora (exata). */
  carrier?: string | null | undefined;
  /** Recebidas a partir deste instante. */
  from?: string | null | undefined;
  /** Só as perecíveis. */
  perishable?: boolean | null | undefined;
  /** O destinatário (exato, sem diferenciar acentos). */
  recipientName?: string | null | undefined;
  /** Parte do código de retirada, do rastreio, do destinatário ou da transportadora. */
  search?: string | null | undefined;
  /** Só estas situações (vazio: todas). */
  statuses?: Array<ParcelStatus> | null | undefined;
  /** Recebidas antes deste instante. */
  to?: string | null | undefined;
  /** O código de rastreio (exato). */
  trackingCode?: string | null | undefined;
  /** A unidade. */
  unitId?: string | number | null | undefined;
};

/** Na portaria, retirada, devolvida ao remetente ou cancelada (registrada por engano). */
export type ParcelStatus =
  | 'CANCELLED'
  | 'PICKED_UP'
  | 'RECEIVED'
  | 'RETURNED';

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
  | 'RESIDENTS_READ'
  | 'SPACES_MANAGE'
  | 'SUPPORTERS_MANAGE'
  | 'SUPPORT_MANAGE'
  | 'UNITS_MANAGE'
  | 'USERS_MANAGE';

/** Entrega da encomenda pelo código de retirada, com a assinatura de quem retira. */
export type PickUpParcelInput = {
  /** Hora do aparelho ao assinar. */
  clientSignedAt?: string | null | undefined;
  /** Fuso do aparelho (ex.: America/Sao_Paulo). */
  clientTimeZone?: string | null | undefined;
  /** Código de retirada (digitado ou do QR). */
  code: string;
  /** A declaração exibida a quem assinou. */
  declarationShown: string;
  device?: SignatureDeviceInput | null | undefined;
  location: SignatureLocationInput;
  /** Traços da assinatura em JSON: { width, height, strokes: [[x, y, t, pressão]…] }. */
  signatureDrawing: string;
  /** Imagem da assinatura (PNG ou WebP em base64). */
  signatureImage: string;
  /** CPF ou RG (opcional). */
  signerDocument?: string | null | undefined;
  signerDocumentType?: DocumentType | null | undefined;
  /** Nome completo de quem retira. */
  signerName: string;
};

/** Tipo da chave PIX: CPF, CNPJ, celular, e-mail ou aleatória. */
export type PixKeyType =
  | 'CNPJ'
  | 'CPF'
  | 'EMAIL'
  | 'PHONE'
  | 'RANDOM';

export type PixReceiverInput = {
  /** Cidade de quem recebe. */
  city: string;
  /** Chave PIX: e-mail, CPF/CNPJ, celular com DDD ou aleatória. */
  key: string;
  /** Tipo da chave: define como ela é conferida. */
  keyType: PixKeyType;
  /** Nome de quem recebe, como aparece no banco. */
  name: string;
};

export type PlatformMetricsFilterInput = {
  /** Um condomínio (vazio: todos). */
  condominiumId?: string | number | null | undefined;
  /** Primeiro dia (YYYY-MM-DD). Padrão: 30 dias antes do fim. */
  from?: string | null | undefined;
  /** Último dia (YYYY-MM-DD). Padrão: hoje. */
  to?: string | null | undefined;
};

export type PlatformPeopleFilterInput = {
  condominiumId?: string | number | null | undefined;
  /** ADMIN_MASTER: a plataforma; os outros: o papel em algum condomínio. */
  role?: UserGroup | null | undefined;
  /** Nome, e-mail ou usuário (a partir de 2 letras). */
  search?: string | null | undefined;
};

/** PushSubscription do navegador (PushManager). */
export type PushSubscriptionInput = {
  /** Segredo de autenticação (base64url). */
  auth: string;
  endpoint: string;
  /** Chave pública do aparelho (base64url). */
  p256dh: string;
};

export type RecordSupportContributionInput = {
  /** Valor em centavos. */
  amountCents: number;
  /** Nome do apoiador. Um nome que já está na lista soma a esse apoiador. */
  name: string;
  /** Observação interna (não aparece no ranking). */
  note?: string | null | undefined;
  /** Dia em que o apoio chegou (YYYY-MM-DD). */
  receivedOn: string;
  /** Falso: o ranking mostra "Apoiador anônimo" no lugar do nome. */
  showName: boolean;
};

/** Item achado no condomínio. */
export type RegisterFoundItemInput = {
  category: FoundItemCategory;
  /** O que os moradores veem sobre o item. */
  description?: string | null | undefined;
  /** Quando foi achado (padrão: agora). */
  foundAt?: string | null | undefined;
  /** Onde foi achado. */
  foundLocation: string;
  /** O aviso de "Perdi algo" que o item atende: ele se encerra como encontrado, ligado ao item. */
  lostReportId?: string | number | null | undefined;
  /** De quem é, se a portaria sabe: a unidade (os moradores dela são avisados e veem o item). */
  ownerUnitId?: string | number | null | undefined;
  /** Ou um morador da unidade (com ownerUnitId), ou alguém da equipe (sem unidade): só essa pessoa é avisada e vê o item, com o pedido já aceito. */
  ownerUserId?: string | number | null | undefined;
  /** Foto (JPEG, PNG ou WebP em base64, até 1 MB). */
  photo?: string | null | undefined;
  /** Esconder a foto dos moradores (padrão: só documentos). */
  photoHidden?: boolean | null | undefined;
  /** Só a portaria e a gestão veem: detalhes para conferir o dono (ex.: o que tem dentro). */
  privateDetails?: string | null | undefined;
  /** Onde ficou guardado. */
  storageLocation: string;
  /** O que é (ex.: chave com chaveiro azul). */
  title: string;
};

/** Encomenda recebida na portaria. */
export type RegisterParcelInput = {
  /** Transportadora ou loja (Correios, Mercado Livre… ou digitada). Obrigatório. */
  carrier?: string | null | undefined;
  /** Observação. */
  notes?: string | null | undefined;
  /** Perecível (alimento, remédio, flores…): retirar dentro do prazo, com lembretes a cada 2 horas. */
  perishable?: boolean | null | undefined;
  /** Perecível: prazo em horas (2, 4, 8, 12, 24 ou 48; padrão 4). */
  perishableHours?: number | null | undefined;
  /** Foto da encomenda (JPEG, PNG ou WebP em base64, até 1 MB). */
  photo?: string | null | undefined;
  /** Nome na etiqueta. */
  recipientName?: string | null | undefined;
  /** Escolhido pelo nome: só este morador (da unidade) é avisado e vê a encomenda (surpresa, presente). Nulo: todos da unidade. */
  recipientUserId?: string | number | null | undefined;
  /** Onde ficou guardada (prateleira, armário, administração…). Obrigatório. */
  storageLocation?: string | null | undefined;
  /** Código de rastreio. */
  trackingCode?: string | null | undefined;
  /** A unidade de destino. */
  unitId: string | number;
};

/** "Perdi algo": o que o morador perdeu. */
export type ReportLostItemInput = {
  category: FoundItemCategory;
  /** Detalhes que ajudam a reconhecer (cor, marca…). */
  description?: string | null | undefined;
  /** Onde pode ter perdido. */
  lostLocation?: string | null | undefined;
  /** O dia em que perdeu (AAAA-MM-DD), se souber. */
  lostOn?: string | null | undefined;
  /** Foto do objeto ou de um parecido: JPEG, PNG ou WebP em base64 (sem o prefixo data:), até 1 MB. */
  photo?: string | null | undefined;
  /** Mostrar no mural dos vizinhos (sem o nome, a unidade e os detalhes). */
  shared?: boolean | null | undefined;
  /** O que é (ex.: chave com chaveiro azul). */
  title: string;
};

export type ResetPasswordInput = {
  newPassword: string;
  resetToken: string;
};

/** Filtros da consulta de moradores. */
export type ResidentsFilterInput = {
  /** A unidade. */
  unitId?: string | number | null | undefined;
  /** Um morador (pelo nome). */
  userId?: string | number | null | undefined;
};

/** Devolução de um item achado, com a assinatura de quem retira feita na tela. */
export type ReturnFoundItemInput = {
  /** O pedido aceito que ela atende (vazio: sem pedido). */
  claimId?: string | number | null | undefined;
  /** Hora do aparelho. */
  clientSignedAt?: string | null | undefined;
  clientTimeZone?: string | null | undefined;
  /** A declaração exibida a quem assinou. */
  declarationShown: string;
  device?: SignatureDeviceInput | null | undefined;
  itemId: string | number;
  location: SignatureLocationInput;
  /** Traços da assinatura (JSON). */
  signatureDrawing: string;
  /** Imagem da assinatura (PNG ou WebP em base64). */
  signatureImage: string;
  /** CPF ou RG (opcional). */
  signerDocument?: string | null | undefined;
  signerDocumentType?: DocumentType | null | undefined;
  /** Nome completo de quem retira. */
  signerName: string;
};

export type SetBookingFeesBilledInput = {
  /** true: lançadas na cobrança; false: desfaz. */
  billed: boolean;
  bookingIds: Array<string | number>;
};

export type SetUserPermissionsInput = {
  /** Conjunto completo desejado (ignorado com useGroupDefaults). */
  permissions?: Array<Permission> | null | undefined;
  /** true descarta as exceções e volta ao padrão do grupo. */
  useGroupDefaults: boolean;
  userId: string | number;
};

/** O aparelho em que a assinatura foi feita. */
export type SignatureDeviceInput = {
  language?: string | null | undefined;
  maxTouchPoints?: number | null | undefined;
  pixelRatio?: number | null | undefined;
  platform?: string | null | undefined;
  /** touch, pen ou mouse: como a assinatura foi feita. */
  pointerType?: string | null | undefined;
  screenHeight?: number | null | undefined;
  screenWidth?: number | null | undefined;
};

/** Localização do aparelho no momento da assinatura. */
export type SignatureLocationInput = {
  /** Precisão em metros. */
  accuracyMeters?: number | null | undefined;
  latitude?: number | null | undefined;
  longitude?: number | null | undefined;
  status: SignatureLocationStatus;
};

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

/** O formulário completo do espaço. */
export type SpaceInput = {
  capacity?: number | null | undefined;
  description?: string | null | undefined;
  kind: SpaceKind;
  name: string;
  rules: SpaceRulesInput;
  usageRules?: string | null | undefined;
};

/** Tipo de espaço (quadra, salão de festas…). */
export type SpaceKind =
  | 'BARBECUE'
  | 'COURT'
  | 'GAME_ROOM'
  | 'GYM'
  | 'OTHER'
  | 'PARTY_ROOM'
  | 'POOL';

export type SpaceRulesInput = {
  cancelUntilHours: number;
  /** Taxa de uso por reserva, em centavos (vazio: gratuito). */
  feeCents?: number | null | undefined;
  guests: GuestRulesInput;
  maxAdvanceDays: number;
  minAdvanceHours: number;
  openingHours: Array<OpeningHoursInput>;
  /** Moradores podem reservar toda semana no mesmo horário. */
  recurringAllowed: boolean;
  requiresApproval: boolean;
  slotMinutes: number;
  unitLimit?: UnitLimitInput | null | undefined;
};

export type SubmitEnrollmentInput = {
  /** Morador (padrão) ou funcionário. Funcionário não informa unidade nem endereço. */
  applicant?: EnrollmentApplicant | null | undefined;
  /** Aceite do uso dos dados (LGPD). */
  consent: boolean;
  data: EnrollmentDataInput;
  formToken: string;
  /** Foto de perfil em base64 (JPEG, PNG ou WebP, até 2 MB). */
  photo?: string | null | undefined;
};

/** Do que se trata a solicitação de suporte. */
export type SupportCategory =
  | 'ACESSO'
  | 'DUVIDA'
  | 'OUTRO'
  | 'PROBLEMA'
  | 'SUGESTAO';

export type SupportRequestInput = {
  category: SupportCategory;
  message: string;
  subject: string;
};

/** Aberto → respondido → finalizado. */
export type SupportStatus =
  | 'ABERTO'
  | 'FINALIZADO'
  | 'RESPONDIDO';

export type SystemLogFilterInput = {
  categories?: Array<string> | null | undefined;
  environment?: string | null | undefined;
  from?: string | null | undefined;
  levels?: Array<string> | null | undefined;
  search?: string | null | undefined;
  to?: string | null | undefined;
};

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

export type TicketTypeInput = {
  /** Com Outro valor: o valor em centavos. */
  customPriceCents?: number | null | undefined;
  /** Público já existente (vazio: novo). */
  id?: string | number | null | undefined;
  /** Público (uma vez por evento). */
  kind: TicketKind;
  /** Idade máxima. */
  maxAge?: number | null | undefined;
  /** Idade mínima. */
  minAge?: number | null | undefined;
  /** Quanto paga. */
  priceMode: TicketPriceMode;
};

/** O que filtra a página de unidades. */
export type UnitFilterInput = {
  /** Exatamente este bloco (a quadra, em casas; "" = sem bloco). */
  block?: string | null | undefined;
  occupancy?: UnitOccupancy | null | undefined;
  /** Exatamente esta rua (casas). */
  street?: string | null | undefined;
  unitId?: string | number | null | undefined;
};

export type UnitLimitInput = {
  count: number;
  period: LimitPeriod;
};

/** Unidade com moradores ativos (ocupada) ou sem nenhum (vazia). */
export type UnitOccupancy =
  | 'EMPTY'
  | 'OCCUPIED';

export type UpdateMyProfileInput = {
  /** Data de nascimento AAAA-MM-DD (ausente: mantém; vazio: remove). */
  birthDate?: string | null | undefined;
  email: string;
  name: string;
  /** Telefone de contato (ausente: mantém; vazio: remove). */
  phone?: string | null | undefined;
};

export type UpdateSupporterInput = {
  name: string;
  /** Falso: aparece como "Apoiador anônimo". */
  showName: boolean;
};

export type UpdateUnitInput = {
  block?: string | null | undefined;
  number: string;
  /** Rua (só em condomínios de casas). */
  street?: string | null | undefined;
};

export type UpdateUserInput = {
  /** Data de nascimento AAAA-MM-DD. */
  birthDate?: string | null | undefined;
  email?: string | null | undefined;
  /** Só para funcionários. */
  employee?: EmployeeProfileInput | null | undefined;
  group?: UserGroup | null | undefined;
  /** Ausente: não muda. */
  kind?: MemberKind | null | undefined;
  name?: string | null | undefined;
  /** Telefone de contato. */
  phone?: string | null | undefined;
  /** Complemento do endereço no condomínio ("casa dos fundos"). */
  unitComplement?: string | null | undefined;
  /** Ausente: não muda. null: sem unidade. */
  unitId?: string | number | null | undefined;
};

export type UserFilterInput = {
  active?: boolean | null | undefined;
  /** Exatamente este e-mail. */
  email?: string | null | undefined;
  group?: UserGroup | null | undefined;
  /** Qualquer um destes papéis (ex.: a equipe, ADMIN e CONCIERGE). */
  groups?: Array<UserGroup> | null | undefined;
  /** Só moradores ou só funcionários. */
  kind?: MemberKind | null | undefined;
  /** Exatamente este telefone (dígitos). */
  phone?: string | null | undefined;
  search?: string | null | undefined;
  unitId?: string | number | null | undefined;
  /** Exatamente esta pessoa. */
  userId?: string | number | null | undefined;
};

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

export type VerifyRecoveryCodeInput = {
  code: string;
  login: string;
};

export type WaitlistSlotInput = {
  spaceId: string | number;
  /** Início do horário reservado. */
  startsAt: string;
};

export type MemberFilterOptionsQueryVariables = Exact<{
  kind: MemberKind;
}>;


export type MemberFilterOptionsQuery = { memberFilterOptions: Array<{ id: string, name: string, email: string, phone: string | null }> };

export type UsersQueryVariables = Exact<{
  filter?: UserFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type UsersQuery = { users: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, birthDate: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null }> } };

export type UserAccountFieldsFragment = { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, birthDate: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null };

export type UserQueryVariables = Exact<{
  id: string | number;
}>;


export type UserQuery = { user: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, birthDate: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { createUser: { temporaryPassword: string | null, emailSent: boolean, existingAccount: boolean, user: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, birthDate: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } } };

export type UpdateUserMutationVariables = Exact<{
  id: string | number;
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { updateUser: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, birthDate: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } };

export type SetUserActiveMutationVariables = Exact<{
  id: string | number;
  active: boolean;
}>;


export type SetUserActiveMutation = { setUserActive: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, birthDate: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } };

export type ResetUserPasswordMutationVariables = Exact<{
  id: string | number;
}>;


export type ResetUserPasswordMutation = { resetUserPassword: { temporaryPassword: string | null, emailSent: boolean, user: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, birthDate: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } } };

export type UnlockUserMutationVariables = Exact<{
  id: string | number;
}>;


export type UnlockUserMutation = { unlockUser: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, birthDate: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } };

export type RevokeUserSessionsMutationVariables = Exact<{
  id: string | number;
}>;


export type RevokeUserSessionsMutation = { revokeUserSessions: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, birthDate: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } };

export type UserPermissionsQueryVariables = Exact<{
  id: string | number;
}>;


export type UserPermissionsQuery = { userPermissions: { effective: Array<Permission>, defaults: Array<Permission>, overrides: Array<{ permission: Permission, allowed: boolean }> } };

export type SetUserPermissionsMutationVariables = Exact<{
  input: SetUserPermissionsInput;
}>;


export type SetUserPermissionsMutation = { setUserPermissions: { effective: Array<Permission>, defaults: Array<Permission>, overrides: Array<{ permission: Permission, allowed: boolean }> } };

export type RecordStampQueryVariables = Exact<{
  entity: string;
  id: string | number;
}>;


export type RecordStampQuery = { recordStamp: { createdAt: string, createdByName: string | null, updatedAt: string, updatedByName: string | null } | null };

export type MemberStatsQueryVariables = Exact<{
  kind: MemberKind;
}>;


export type MemberStatsQuery = { memberStats: { total: number, active: number, inactive: number, neverSignedIn: number } };

export type AppInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type AppInfoQuery = { appInfo: { version: string, commit: string | null, deployedAt: string | null } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { accessToken: string, accessTokenExpiresAt: string, refreshToken: string, refreshTokenExpiresAt: string, user: { id: string, name: string, username: string, email: string, group: UserGroup, mustChangePassword: boolean, permissions: Array<Permission>, photoUrl: string | null, phone: string | null, birthDate: string | null, onboardingCompleted: boolean, platformAdmin: boolean, member: boolean, condominium: { id: string, name: string, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, modules: Array<AppModule> } | null, condominiums: Array<{ id: string, name: string, city: string, state: string, role: UserGroup }> } } };

export type RefreshSessionMutationVariables = Exact<{
  refreshToken: string;
}>;


export type RefreshSessionMutation = { refreshSessionTokens: { accessToken: string, accessTokenExpiresAt: string, refreshToken: string, refreshTokenExpiresAt: string } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, name: string, username: string, email: string, group: UserGroup, mustChangePassword: boolean, permissions: Array<Permission>, photoUrl: string | null, phone: string | null, birthDate: string | null, onboardingCompleted: boolean, platformAdmin: boolean, member: boolean, condominium: { id: string, name: string, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, modules: Array<AppModule> } | null, condominiums: Array<{ id: string, name: string, city: string, state: string, role: UserGroup }> } };

export type CompleteOnboardingMutationVariables = Exact<{ [key: string]: never; }>;


export type CompleteOnboardingMutation = { completeOnboarding: boolean };

export type ChangeMyPasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangeMyPasswordMutation = { changeMyPassword: boolean };

export type UpdateMyProfileMutationVariables = Exact<{
  input: UpdateMyProfileInput;
}>;


export type UpdateMyProfileMutation = { updateMyProfile: { id: string, name: string, username: string, email: string, group: UserGroup, mustChangePassword: boolean, permissions: Array<Permission>, photoUrl: string | null, phone: string | null, birthDate: string | null, onboardingCompleted: boolean, platformAdmin: boolean, member: boolean, condominium: { id: string, name: string, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, modules: Array<AppModule> } | null, condominiums: Array<{ id: string, name: string, city: string, state: string, role: UserGroup }> } };

export type SetMyPhotoMutationVariables = Exact<{
  photo: string;
}>;


export type SetMyPhotoMutation = { setMyPhoto: string };

export type RemoveMyPhotoMutationVariables = Exact<{ [key: string]: never; }>;


export type RemoveMyPhotoMutation = { removeMyPhoto: boolean };

export type RequestPasswordRecoveryMutationVariables = Exact<{
  login: string;
}>;


export type RequestPasswordRecoveryMutation = { requestPasswordRecovery: boolean };

export type VerifyPasswordRecoveryCodeMutationVariables = Exact<{
  input: VerifyRecoveryCodeInput;
}>;


export type VerifyPasswordRecoveryCodeMutation = { verifyPasswordRecoveryCode: string };

export type ResetPasswordWithRecoveryMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;


export type ResetPasswordWithRecoveryMutation = { resetPasswordWithRecovery: boolean };

export type SwitchCondominiumMutationVariables = Exact<{
  condominiumId?: string | number | null | undefined;
}>;


export type SwitchCondominiumMutation = { switchCondominium: boolean };

export type BookingFieldsFragment = { id: string, spaceId: string, spaceName: string, spaceKind: SpaceKind, guestsAllowed: boolean, userId: string, userName: string, unitLabel: string | null, startsAt: string, endsAt: string, status: BookingStatus, notes: string | null, cancelUntil: string, reason: string | null, decidedAt: string | null, cancelledAt: string | null, cancelledByManager: boolean, feeCents: number | null, feeBilledAt: string | null, seriesId: string | null, createdAt: string };

export type MyBookingsQueryVariables = Exact<{
  when: BookingWhen;
  page?: PageInput | null | undefined;
}>;


export type MyBookingsQuery = { myBookings: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, spaceId: string, spaceName: string, spaceKind: SpaceKind, guestsAllowed: boolean, userId: string, userName: string, unitLabel: string | null, startsAt: string, endsAt: string, status: BookingStatus, notes: string | null, cancelUntil: string, reason: string | null, decidedAt: string | null, cancelledAt: string | null, cancelledByManager: boolean, feeCents: number | null, feeBilledAt: string | null, seriesId: string | null, createdAt: string }> } };

export type BookingsQueryVariables = Exact<{
  filter?: BookingFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type BookingsQuery = { bookings: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, spaceId: string, spaceName: string, spaceKind: SpaceKind, guestsAllowed: boolean, userId: string, userName: string, unitLabel: string | null, startsAt: string, endsAt: string, status: BookingStatus, notes: string | null, cancelUntil: string, reason: string | null, decidedAt: string | null, cancelledAt: string | null, cancelledByManager: boolean, feeCents: number | null, feeBilledAt: string | null, seriesId: string | null, createdAt: string }> } };

export type SpaceAvailabilityQueryVariables = Exact<{
  spaceId: string | number;
  date: string;
}>;


export type SpaceAvailabilityQuery = { spaceAvailability: { spaceId: string, date: string, firstDate: string, lastDate: string, slots: Array<{ startsAt: string, endsAt: string, state: SlotState, bookingId: string | null, bookingStatus: BookingStatus | null, label: string | null, waitlisted: boolean }> } };

export type CreateBookingMutationVariables = Exact<{
  input: CreateBookingInput;
}>;


export type CreateBookingMutation = { createBooking: { id: string, spaceId: string, spaceName: string, spaceKind: SpaceKind, guestsAllowed: boolean, userId: string, userName: string, unitLabel: string | null, startsAt: string, endsAt: string, status: BookingStatus, notes: string | null, cancelUntil: string, reason: string | null, decidedAt: string | null, cancelledAt: string | null, cancelledByManager: boolean, feeCents: number | null, feeBilledAt: string | null, seriesId: string | null, createdAt: string } };

export type CancelBookingMutationVariables = Exact<{
  id: string | number;
  reason?: string | null | undefined;
}>;


export type CancelBookingMutation = { cancelBooking: { id: string, spaceId: string, spaceName: string, spaceKind: SpaceKind, guestsAllowed: boolean, userId: string, userName: string, unitLabel: string | null, startsAt: string, endsAt: string, status: BookingStatus, notes: string | null, cancelUntil: string, reason: string | null, decidedAt: string | null, cancelledAt: string | null, cancelledByManager: boolean, feeCents: number | null, feeBilledAt: string | null, seriesId: string | null, createdAt: string } };

export type ApproveBookingMutationVariables = Exact<{
  id: string | number;
}>;


export type ApproveBookingMutation = { approveBooking: { id: string, spaceId: string, spaceName: string, spaceKind: SpaceKind, guestsAllowed: boolean, userId: string, userName: string, unitLabel: string | null, startsAt: string, endsAt: string, status: BookingStatus, notes: string | null, cancelUntil: string, reason: string | null, decidedAt: string | null, cancelledAt: string | null, cancelledByManager: boolean, feeCents: number | null, feeBilledAt: string | null, seriesId: string | null, createdAt: string } };

export type RejectBookingMutationVariables = Exact<{
  id: string | number;
  reason: string;
}>;


export type RejectBookingMutation = { rejectBooking: { id: string, spaceId: string, spaceName: string, spaceKind: SpaceKind, guestsAllowed: boolean, userId: string, userName: string, unitLabel: string | null, startsAt: string, endsAt: string, status: BookingStatus, notes: string | null, cancelUntil: string, reason: string | null, decidedAt: string | null, cancelledAt: string | null, cancelledByManager: boolean, feeCents: number | null, feeBilledAt: string | null, seriesId: string | null, createdAt: string } };

export type CondominiumSpaceBlocksQueryVariables = Exact<{ [key: string]: never; }>;


export type CondominiumSpaceBlocksQuery = { condominiumSpaceBlocks: Array<{ id: string, spaceId: string, startsAt: string, endsAt: string, reason: string, createdByName: string | null, createdAt: string }> };

export type SpaceBlocksQueryVariables = Exact<{
  spaceId: string | number;
}>;


export type SpaceBlocksQuery = { spaceBlocks: Array<{ id: string, spaceId: string, startsAt: string, endsAt: string, reason: string, createdByName: string | null, createdAt: string }> };

export type CreateSpaceBlockMutationVariables = Exact<{
  input: CreateSpaceBlockInput;
}>;


export type CreateSpaceBlockMutation = { createSpaceBlock: { id: string } };

export type DeleteSpaceBlockMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteSpaceBlockMutation = { deleteSpaceBlock: boolean };

export type CreateBookingSeriesMutationVariables = Exact<{
  input: CreateBookingSeriesInput;
}>;


export type CreateBookingSeriesMutation = { createBookingSeries: { seriesId: string, created: Array<{ id: string, spaceId: string, spaceName: string, spaceKind: SpaceKind, guestsAllowed: boolean, userId: string, userName: string, unitLabel: string | null, startsAt: string, endsAt: string, status: BookingStatus, notes: string | null, cancelUntil: string, reason: string | null, decidedAt: string | null, cancelledAt: string | null, cancelledByManager: boolean, feeCents: number | null, feeBilledAt: string | null, seriesId: string | null, createdAt: string }>, skipped: Array<{ startsAt: string, reason: string }> } };

export type CancelBookingSeriesMutationVariables = Exact<{
  seriesId: string | number;
}>;


export type CancelBookingSeriesMutation = { cancelBookingSeries: { cancelled: number, kept: number } };

export type JoinWaitlistMutationVariables = Exact<{
  input: WaitlistSlotInput;
}>;


export type JoinWaitlistMutation = { joinWaitlist: boolean };

export type LeaveWaitlistMutationVariables = Exact<{
  input: WaitlistSlotInput;
}>;


export type LeaveWaitlistMutation = { leaveWaitlist: boolean };

export type BookingGuestFieldsFragment = { id: string, bookingId: string, name: string, documentType: DocumentType | null, document: string | null, phone: string | null, code: string, checkedInAt: string | null, createdAt: string };

export type BookingGuestsQueryVariables = Exact<{
  bookingId: string | number;
}>;


export type BookingGuestsQuery = { bookingGuests: Array<{ id: string, bookingId: string, name: string, documentType: DocumentType | null, document: string | null, phone: string | null, code: string, checkedInAt: string | null, createdAt: string }> };

export type AddBookingGuestsMutationVariables = Exact<{
  input: AddBookingGuestsInput;
}>;


export type AddBookingGuestsMutation = { addBookingGuests: Array<{ id: string, bookingId: string, name: string, documentType: DocumentType | null, document: string | null, phone: string | null, code: string, checkedInAt: string | null, createdAt: string }> };

export type RemoveBookingGuestMutationVariables = Exact<{
  id: string | number;
}>;


export type RemoveBookingGuestMutation = { removeBookingGuest: boolean };

export type GuestInviteQueryVariables = Exact<{
  code: string;
}>;


export type GuestInviteQuery = { guestInvite: { code: string, guestName: string, hostFirstName: string, spaceName: string, condominiumName: string, startsAt: string, endsAt: string, status: GuestInviteStatus, checkedIn: boolean } | null };

export type GateGuestFieldsFragment = { id: string, bookingId: string, name: string, documentType: DocumentType | null, document: string | null, phone: string | null, code: string, checkedInAt: string | null, spaceName: string, startsAt: string, endsAt: string, hostName: string, unitLabel: string | null, checkInWindow: GuestCheckInWindow };

export type GateGuestsQueryVariables = Exact<{
  date?: string | null | undefined;
}>;


export type GateGuestsQuery = { gateGuests: Array<{ id: string, bookingId: string, name: string, documentType: DocumentType | null, document: string | null, phone: string | null, code: string, checkedInAt: string | null, spaceName: string, startsAt: string, endsAt: string, hostName: string, unitLabel: string | null, checkInWindow: GuestCheckInWindow }> };

export type DayGuestsQueryVariables = Exact<{
  date?: string | null | undefined;
  filter?: DayGuestFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type DayGuestsQuery = { dayGuests: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, bookingId: string, name: string, documentType: DocumentType | null, document: string | null, phone: string | null, code: string, checkedInAt: string | null, spaceName: string, startsAt: string, endsAt: string, hostName: string, unitLabel: string | null, checkInWindow: GuestCheckInWindow }> } };

export type DayGuestsOverviewQueryVariables = Exact<{
  date?: string | null | undefined;
}>;


export type DayGuestsOverviewQuery = { dayGuestsOverview: { total: number, checkedIn: number, bookings: number, guests: Array<{ id: string, label: string }>, hosts: Array<{ id: string, label: string }>, units: Array<{ id: string, label: string }>, spaces: Array<{ id: string, label: string }> } };

export type CheckInGuestMutationVariables = Exact<{
  input: CheckInGuestInput;
}>;


export type CheckInGuestMutation = { checkInGuest: { id: string, bookingId: string, name: string, documentType: DocumentType | null, document: string | null, phone: string | null, code: string, checkedInAt: string | null, spaceName: string, startsAt: string, endsAt: string, hostName: string, unitLabel: string | null, checkInWindow: GuestCheckInWindow } };

export type UndoGuestCheckInMutationVariables = Exact<{
  guestId: string | number;
}>;


export type UndoGuestCheckInMutation = { undoGuestCheckIn: { id: string, bookingId: string, name: string, documentType: DocumentType | null, document: string | null, phone: string | null, code: string, checkedInAt: string | null, spaceName: string, startsAt: string, endsAt: string, hostName: string, unitLabel: string | null, checkInWindow: GuestCheckInWindow } };

export type BookingFeesQueryVariables = Exact<{
  month?: string | null | undefined;
  filter?: FeeFilterInput | null | undefined;
}>;


export type BookingFeesQuery = { bookingFees: { month: string, totalCents: number, billedCents: number, items: Array<{ id: string, spaceId: string, spaceName: string, spaceKind: SpaceKind, guestsAllowed: boolean, userId: string, userName: string, unitLabel: string | null, startsAt: string, endsAt: string, status: BookingStatus, notes: string | null, cancelUntil: string, reason: string | null, decidedAt: string | null, cancelledAt: string | null, cancelledByManager: boolean, feeCents: number | null, feeBilledAt: string | null, seriesId: string | null, createdAt: string }> } };

export type BookingFeesPageQueryVariables = Exact<{
  month?: string | null | undefined;
  filter?: FeeFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type BookingFeesPageQuery = { bookingFeesPage: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, spaceId: string, spaceName: string, spaceKind: SpaceKind, guestsAllowed: boolean, userId: string, userName: string, unitLabel: string | null, startsAt: string, endsAt: string, status: BookingStatus, notes: string | null, cancelUntil: string, reason: string | null, decidedAt: string | null, cancelledAt: string | null, cancelledByManager: boolean, feeCents: number | null, feeBilledAt: string | null, seriesId: string | null, createdAt: string }> } };

export type BookingFeesOverviewQueryVariables = Exact<{
  month?: string | null | undefined;
}>;


export type BookingFeesOverviewQuery = { bookingFeesOverview: { month: string, count: number, totalCents: number, billedCents: number, units: Array<{ id: string, label: string }>, spaces: Array<{ id: string, label: string }>, users: Array<{ id: string, label: string }> } };

export type SetBookingFeesBilledMutationVariables = Exact<{
  input: SetBookingFeesBilledInput;
}>;


export type SetBookingFeesBilledMutation = { setBookingFeesBilled: number };

export type BroadcastFieldsFragment = { id: string, title: string, body: string, audience: BroadcastAudience, targetGroup: UserGroup | null, sendEmail: boolean, recipients: number, authorName: string | null, createdAt: string };

export type BroadcastsQueryVariables = Exact<{ [key: string]: never; }>;


export type BroadcastsQuery = { broadcasts: Array<{ id: string, title: string, body: string, audience: BroadcastAudience, targetGroup: UserGroup | null, sendEmail: boolean, recipients: number, authorName: string | null, createdAt: string }> };

export type SendBroadcastMutationVariables = Exact<{
  input: BroadcastInput;
}>;


export type SendBroadcastMutation = { sendBroadcast: { id: string, title: string, body: string, audience: BroadcastAudience, targetGroup: UserGroup | null, sendEmail: boolean, recipients: number, authorName: string | null, createdAt: string } };

export type BroadcastStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type BroadcastStatsQuery = { broadcastStats: { total: number, recent: number, withEmail: number, recentRecipients: number } };

export type CondominiumFieldsFragment = { id: string, name: string, document: string | null, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, modules: Array<AppModule>, activeMembers: number, managers: number, units: number, pendingEnrollments: number, lastActivityAt: string | null, createdAt: string };

export type CondominiumsQueryVariables = Exact<{
  filter?: CondominiumFilterInput | null | undefined;
}>;


export type CondominiumsQuery = { condominiums: Array<{ id: string, name: string, document: string | null, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, modules: Array<AppModule>, activeMembers: number, managers: number, units: number, pendingEnrollments: number, lastActivityAt: string | null, createdAt: string }> };

export type CreateCondominiumMutationVariables = Exact<{
  input: CondominiumInput;
}>;


export type CreateCondominiumMutation = { createCondominium: { id: string, name: string, document: string | null, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, modules: Array<AppModule>, activeMembers: number, managers: number, units: number, pendingEnrollments: number, lastActivityAt: string | null, createdAt: string } };

export type UpdateCondominiumMutationVariables = Exact<{
  id: string | number;
  input: CondominiumInput;
}>;


export type UpdateCondominiumMutation = { updateCondominium: { id: string, name: string, document: string | null, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, modules: Array<AppModule>, activeMembers: number, managers: number, units: number, pendingEnrollments: number, lastActivityAt: string | null, createdAt: string } };

export type SetCondominiumStatusMutationVariables = Exact<{
  id: string | number;
  status: CondominiumStatus;
}>;


export type SetCondominiumStatusMutation = { setCondominiumStatus: { id: string, name: string, document: string | null, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, modules: Array<AppModule>, activeMembers: number, managers: number, units: number, pendingEnrollments: number, lastActivityAt: string | null, createdAt: string } };

export type SetCondominiumModuleMutationVariables = Exact<{
  id: string | number;
  module: AppModule;
  enabled: boolean;
}>;


export type SetCondominiumModuleMutation = { setCondominiumModule: { id: string, name: string, document: string | null, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, modules: Array<AppModule>, activeMembers: number, managers: number, units: number, pendingEnrollments: number, lastActivityAt: string | null, createdAt: string } };

export type UnitFieldsFragment = { id: string, street: string, block: string, number: string, label: string, residents: number };

export type UnitsQueryVariables = Exact<{ [key: string]: never; }>;


export type UnitsQuery = { units: Array<{ id: string, street: string, block: string, number: string, label: string, residents: number }> };

export type CreateUnitsMutationVariables = Exact<{
  input: CreateUnitsInput;
}>;


export type CreateUnitsMutation = { createUnits: Array<{ id: string, street: string, block: string, number: string, label: string, residents: number }> };

export type UpdateUnitMutationVariables = Exact<{
  id: string | number;
  input: UpdateUnitInput;
}>;


export type UpdateUnitMutation = { updateUnit: { id: string, street: string, block: string, number: string, label: string, residents: number } };

export type DeleteUnitMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteUnitMutation = { deleteUnit: boolean };

export type CondominiumQueryVariables = Exact<{
  id: string | number;
}>;


export type CondominiumQuery = { condominium: { id: string, name: string, document: string | null, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, modules: Array<AppModule>, activeMembers: number, managers: number, units: number, pendingEnrollments: number, lastActivityAt: string | null, createdAt: string } };

export type UnitPageQueryVariables = Exact<{
  filter?: UnitFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type UnitPageQuery = { unitPage: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, street: string, block: string, number: string, label: string, residents: number, people: Array<{ userId: string, name: string, role: UserGroup, email: string, phone: string | null, active: boolean }> }> } };

export type DashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardQuery = { dashboard: { activeUsers: number, pendingEnrollments: number, units: number, activeSpaces: number, pendingBookings: number, bookingsToday: number, openSupportRequests: number | null, failedNotifications: number | null, parcels: { waiting: number, stuck: number, perishableOverdue: number, pickedUpLast30Days: number, averagePickupHours: number | null, monthly: Array<{ month: string, received: number, pickedUp: number }> } | null, lostAndFound: { kept: number, pendingClaims: number, expiringSoon: number, openLostReports: number, returnedLast90Days: number, returnRate: number | null, monthly: Array<{ month: string, found: number, returned: number }> } | null } };

export type DependentFieldsFragment = { id: string, name: string, birthDate: string, relationship: DependentRelationship, status: DependentStatus, holderName: string | null, unitLabel: string | null, rejectReason: string | null, reviewedAt: string | null, createdAt: string, documentUrl: string, documentContentType: string };

export type MyDependentsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyDependentsQuery = { myDependents: Array<{ id: string, name: string, birthDate: string, relationship: DependentRelationship, status: DependentStatus, holderName: string | null, unitLabel: string | null, rejectReason: string | null, reviewedAt: string | null, createdAt: string, documentUrl: string, documentContentType: string }> };

export type AddDependentMutationVariables = Exact<{
  input: DependentInput;
}>;


export type AddDependentMutation = { addDependent: { id: string, name: string, birthDate: string, relationship: DependentRelationship, status: DependentStatus, holderName: string | null, unitLabel: string | null, rejectReason: string | null, reviewedAt: string | null, createdAt: string, documentUrl: string, documentContentType: string } };

export type RemoveDependentMutationVariables = Exact<{
  id: string | number;
}>;


export type RemoveDependentMutation = { removeDependent: boolean };

export type ApproveDependentMutationVariables = Exact<{
  id: string | number;
}>;


export type ApproveDependentMutation = { approveDependent: { id: string, name: string, birthDate: string, relationship: DependentRelationship, status: DependentStatus, holderName: string | null, unitLabel: string | null, rejectReason: string | null, reviewedAt: string | null, createdAt: string, documentUrl: string, documentContentType: string } };

export type RejectDependentMutationVariables = Exact<{
  id: string | number;
  reason: string;
}>;


export type RejectDependentMutation = { rejectDependent: { id: string, name: string, birthDate: string, relationship: DependentRelationship, status: DependentStatus, holderName: string | null, unitLabel: string | null, rejectReason: string | null, reviewedAt: string | null, createdAt: string, documentUrl: string, documentContentType: string } };

export type DependentsPageQueryVariables = Exact<{
  filter?: DependentReviewFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type DependentsPageQuery = { dependentsPage: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, name: string, birthDate: string, relationship: DependentRelationship, status: DependentStatus, holderName: string | null, unitLabel: string | null, rejectReason: string | null, reviewedAt: string | null, createdAt: string, documentUrl: string, documentContentType: string }> } };

export type DependentsReviewOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type DependentsReviewOverviewQuery = { dependentsReviewOverview: { pending: number, approved: number, rejected: number, dependents: Array<{ id: string, label: string }>, holders: Array<{ id: string, label: string }>, units: Array<{ id: string, label: string }> } };

export type VerifyEnrollmentCodeMutationVariables = Exact<{
  code: string;
}>;


export type VerifyEnrollmentCodeMutation = { verifyEnrollmentCode: string };

export type EnrollmentFormQueryVariables = Exact<{
  formToken: string;
}>;


export type EnrollmentFormQuery = { enrollmentForm: { condominiumName: string, addressFormat: AddressFormat, units: Array<{ id: string, label: string }> } };

export type SubmitEnrollmentMutationVariables = Exact<{
  input: SubmitEnrollmentInput;
}>;


export type SubmitEnrollmentMutation = { submitEnrollment: boolean };

export type EnrollmentInviteFieldsFragment = { id: string, code: string, label: string, expiresAt: string, revokedAt: string | null, createdAt: string, requestCount: number };

export type EnrollmentRequestFieldsFragment = { id: string, status: EnrollmentStatus, applicant: EnrollmentApplicant, fullName: string, email: string, phone: string, birthDate: string | null, unitId: string | null, unitLabel: string | null, unitComplement: string | null, typedUnitLabel: string | null, typedUnitBlock: string | null, typedUnitNumber: string | null, typedUnitStreet: string | null, createdAt: string, reviewedAt: string | null, rejectionReason: string | null, userId: string | null, photoUrl: string | null };

export type EnrollmentInvitesQueryVariables = Exact<{ [key: string]: never; }>;


export type EnrollmentInvitesQuery = { enrollmentInvites: Array<{ id: string, code: string, label: string, expiresAt: string, revokedAt: string | null, createdAt: string, requestCount: number }> };

export type CreateEnrollmentInviteMutationVariables = Exact<{
  input: CreateEnrollmentInviteInput;
}>;


export type CreateEnrollmentInviteMutation = { createEnrollmentInvite: { id: string, code: string, label: string, expiresAt: string, revokedAt: string | null, createdAt: string, requestCount: number } };

export type RevokeEnrollmentInviteMutationVariables = Exact<{
  id: string | number;
}>;


export type RevokeEnrollmentInviteMutation = { revokeEnrollmentInvite: { id: string, code: string, label: string, expiresAt: string, revokedAt: string | null, createdAt: string, requestCount: number } };

export type EnrollmentRequestsQueryVariables = Exact<{
  filter?: EnrollmentRequestFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type EnrollmentRequestsQuery = { pendingEnrollmentCount: number, enrollmentRequests: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, status: EnrollmentStatus, applicant: EnrollmentApplicant, fullName: string, email: string, phone: string, birthDate: string | null, unitId: string | null, unitLabel: string | null, unitComplement: string | null, typedUnitLabel: string | null, typedUnitBlock: string | null, typedUnitNumber: string | null, typedUnitStreet: string | null, createdAt: string, reviewedAt: string | null, rejectionReason: string | null, userId: string | null, photoUrl: string | null }> } };

export type ApproveEnrollmentRequestMutationVariables = Exact<{
  id: string | number;
  data: EnrollmentDataInput;
  group: UserGroup;
}>;


export type ApproveEnrollmentRequestMutation = { approveEnrollmentRequest: { request: { id: string, status: EnrollmentStatus, applicant: EnrollmentApplicant, fullName: string, email: string, phone: string, birthDate: string | null, unitId: string | null, unitLabel: string | null, unitComplement: string | null, typedUnitLabel: string | null, typedUnitBlock: string | null, typedUnitNumber: string | null, typedUnitStreet: string | null, createdAt: string, reviewedAt: string | null, rejectionReason: string | null, userId: string | null, photoUrl: string | null }, access: { temporaryPassword: string | null, emailSent: boolean, existingAccount: boolean, user: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, birthDate: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } } } };

export type RejectEnrollmentRequestMutationVariables = Exact<{
  id: string | number;
  reason: string;
}>;


export type RejectEnrollmentRequestMutation = { rejectEnrollmentRequest: { id: string, status: EnrollmentStatus, applicant: EnrollmentApplicant, fullName: string, email: string, phone: string, birthDate: string | null, unitId: string | null, unitLabel: string | null, unitComplement: string | null, typedUnitLabel: string | null, typedUnitBlock: string | null, typedUnitNumber: string | null, typedUnitStreet: string | null, createdAt: string, reviewedAt: string | null, rejectionReason: string | null, userId: string | null, photoUrl: string | null } };

export type EnrollmentRequestFilterOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type EnrollmentRequestFilterOptionsQuery = { enrollmentRequestFilterOptions: Array<{ id: string, name: string, email: string }> };

export type EventFieldsFragment = { id: string, title: string, description: string | null, spaceId: string | null, spaceName: string | null, location: string | null, startsAt: string, endsAt: string, capacity: number, externalGuestLimit: number, ticketed: boolean, fullPriceCents: number | null, unitTicketLimit: number | null, salesClose: EventSalesClose, salesCloseHours: number, salesClosesAt: string, pixSource: EventPixSource | null, placesLeft: number, outsidePlacesLeft: number, status: EventStatus, cancelReason: string | null, publishedAt: string | null, cancelledAt: string | null, createdAt: string, address: { zip: string, street: string, number: string, complement: string | null, district: string, city: string, state: string } | null, ticketTypes: Array<{ id: string, kind: TicketKind, name: string, priceMode: TicketPriceMode, customPriceCents: number | null, priceCents: number, minAge: number | null, maxAge: number | null }>, customPix: { keyType: PixKeyType, key: string, name: string, city: string } | null };

export type EventsQueryVariables = Exact<{
  when?: EventWhen | null | undefined;
}>;


export type EventsQuery = { events: Array<{ id: string, title: string, description: string | null, spaceId: string | null, spaceName: string | null, location: string | null, startsAt: string, endsAt: string, capacity: number, externalGuestLimit: number, ticketed: boolean, fullPriceCents: number | null, unitTicketLimit: number | null, salesClose: EventSalesClose, salesCloseHours: number, salesClosesAt: string, pixSource: EventPixSource | null, placesLeft: number, outsidePlacesLeft: number, status: EventStatus, cancelReason: string | null, publishedAt: string | null, cancelledAt: string | null, createdAt: string, address: { zip: string, street: string, number: string, complement: string | null, district: string, city: string, state: string } | null, ticketTypes: Array<{ id: string, kind: TicketKind, name: string, priceMode: TicketPriceMode, customPriceCents: number | null, priceCents: number, minAge: number | null, maxAge: number | null }>, customPix: { keyType: PixKeyType, key: string, name: string, city: string } | null }> };

export type EventQueryVariables = Exact<{
  id: string | number;
}>;


export type EventQuery = { event: { id: string, title: string, description: string | null, spaceId: string | null, spaceName: string | null, location: string | null, startsAt: string, endsAt: string, capacity: number, externalGuestLimit: number, ticketed: boolean, fullPriceCents: number | null, unitTicketLimit: number | null, salesClose: EventSalesClose, salesCloseHours: number, salesClosesAt: string, pixSource: EventPixSource | null, placesLeft: number, outsidePlacesLeft: number, status: EventStatus, cancelReason: string | null, publishedAt: string | null, cancelledAt: string | null, createdAt: string, address: { zip: string, street: string, number: string, complement: string | null, district: string, city: string, state: string } | null, ticketTypes: Array<{ id: string, kind: TicketKind, name: string, priceMode: TicketPriceMode, customPriceCents: number | null, priceCents: number, minAge: number | null, maxAge: number | null }>, customPix: { keyType: PixKeyType, key: string, name: string, city: string } | null } };

export type CreateEventMutationVariables = Exact<{
  input: EventInput;
}>;


export type CreateEventMutation = { createEvent: { id: string, title: string, description: string | null, spaceId: string | null, spaceName: string | null, location: string | null, startsAt: string, endsAt: string, capacity: number, externalGuestLimit: number, ticketed: boolean, fullPriceCents: number | null, unitTicketLimit: number | null, salesClose: EventSalesClose, salesCloseHours: number, salesClosesAt: string, pixSource: EventPixSource | null, placesLeft: number, outsidePlacesLeft: number, status: EventStatus, cancelReason: string | null, publishedAt: string | null, cancelledAt: string | null, createdAt: string, address: { zip: string, street: string, number: string, complement: string | null, district: string, city: string, state: string } | null, ticketTypes: Array<{ id: string, kind: TicketKind, name: string, priceMode: TicketPriceMode, customPriceCents: number | null, priceCents: number, minAge: number | null, maxAge: number | null }>, customPix: { keyType: PixKeyType, key: string, name: string, city: string } | null } };

export type UpdateEventMutationVariables = Exact<{
  id: string | number;
  input: EventInput;
}>;


export type UpdateEventMutation = { updateEvent: { id: string, title: string, description: string | null, spaceId: string | null, spaceName: string | null, location: string | null, startsAt: string, endsAt: string, capacity: number, externalGuestLimit: number, ticketed: boolean, fullPriceCents: number | null, unitTicketLimit: number | null, salesClose: EventSalesClose, salesCloseHours: number, salesClosesAt: string, pixSource: EventPixSource | null, placesLeft: number, outsidePlacesLeft: number, status: EventStatus, cancelReason: string | null, publishedAt: string | null, cancelledAt: string | null, createdAt: string, address: { zip: string, street: string, number: string, complement: string | null, district: string, city: string, state: string } | null, ticketTypes: Array<{ id: string, kind: TicketKind, name: string, priceMode: TicketPriceMode, customPriceCents: number | null, priceCents: number, minAge: number | null, maxAge: number | null }>, customPix: { keyType: PixKeyType, key: string, name: string, city: string } | null } };

export type PublishEventMutationVariables = Exact<{
  id: string | number;
}>;


export type PublishEventMutation = { publishEvent: { id: string, title: string, description: string | null, spaceId: string | null, spaceName: string | null, location: string | null, startsAt: string, endsAt: string, capacity: number, externalGuestLimit: number, ticketed: boolean, fullPriceCents: number | null, unitTicketLimit: number | null, salesClose: EventSalesClose, salesCloseHours: number, salesClosesAt: string, pixSource: EventPixSource | null, placesLeft: number, outsidePlacesLeft: number, status: EventStatus, cancelReason: string | null, publishedAt: string | null, cancelledAt: string | null, createdAt: string, address: { zip: string, street: string, number: string, complement: string | null, district: string, city: string, state: string } | null, ticketTypes: Array<{ id: string, kind: TicketKind, name: string, priceMode: TicketPriceMode, customPriceCents: number | null, priceCents: number, minAge: number | null, maxAge: number | null }>, customPix: { keyType: PixKeyType, key: string, name: string, city: string } | null } };

export type CancelEventMutationVariables = Exact<{
  id: string | number;
  reason: string;
}>;


export type CancelEventMutation = { cancelEvent: { id: string, title: string, description: string | null, spaceId: string | null, spaceName: string | null, location: string | null, startsAt: string, endsAt: string, capacity: number, externalGuestLimit: number, ticketed: boolean, fullPriceCents: number | null, unitTicketLimit: number | null, salesClose: EventSalesClose, salesCloseHours: number, salesClosesAt: string, pixSource: EventPixSource | null, placesLeft: number, outsidePlacesLeft: number, status: EventStatus, cancelReason: string | null, publishedAt: string | null, cancelledAt: string | null, createdAt: string, address: { zip: string, street: string, number: string, complement: string | null, district: string, city: string, state: string } | null, ticketTypes: Array<{ id: string, kind: TicketKind, name: string, priceMode: TicketPriceMode, customPriceCents: number | null, priceCents: number, minAge: number | null, maxAge: number | null }>, customPix: { keyType: PixKeyType, key: string, name: string, city: string } | null } };

export type EventOrderFieldsFragment = { id: string, eventId: string, eventTitle: string, code: string, status: EventOrderStatus, totalCents: number, buyerId: string | null, buyerName: string | null, unitId: string | null, unitLabel: string | null, pixCode: string | null, expiresAt: string | null, receiptSentAt: string | null, receiptContentType: string | null, receiptUrl: string | null, reviewedAt: string | null, rejectReason: string | null, cancelledAt: string | null, createdAt: string, attendees: Array<{ id: string, source: AttendeeSource, dependentId: string | null, name: string, age: number, outside: boolean, ticketName: string | null, priceCents: number, needsProof: boolean, proofUrl: string | null, proofContentType: string | null, ticketCode: string | null, checkedInAt: string | null }>, pix: { keyType: PixKeyType, key: string, name: string, city: string } | null };

export type MyEventOrdersQueryVariables = Exact<{
  eventId: string | number;
}>;


export type MyEventOrdersQuery = { myEventOrders: Array<{ id: string, eventId: string, eventTitle: string, code: string, status: EventOrderStatus, totalCents: number, buyerId: string | null, buyerName: string | null, unitId: string | null, unitLabel: string | null, pixCode: string | null, expiresAt: string | null, receiptSentAt: string | null, receiptContentType: string | null, receiptUrl: string | null, reviewedAt: string | null, rejectReason: string | null, cancelledAt: string | null, createdAt: string, attendees: Array<{ id: string, source: AttendeeSource, dependentId: string | null, name: string, age: number, outside: boolean, ticketName: string | null, priceCents: number, needsProof: boolean, proofUrl: string | null, proofContentType: string | null, ticketCode: string | null, checkedInAt: string | null }>, pix: { keyType: PixKeyType, key: string, name: string, city: string } | null }> };

export type EventOrdersQueryVariables = Exact<{
  eventId: string | number;
  filter?: EventOrderFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type EventOrdersQuery = { eventOrders: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, eventId: string, eventTitle: string, code: string, status: EventOrderStatus, totalCents: number, buyerId: string | null, buyerName: string | null, unitId: string | null, unitLabel: string | null, pixCode: string | null, expiresAt: string | null, receiptSentAt: string | null, receiptContentType: string | null, receiptUrl: string | null, reviewedAt: string | null, rejectReason: string | null, cancelledAt: string | null, createdAt: string, attendees: Array<{ id: string, source: AttendeeSource, dependentId: string | null, name: string, age: number, outside: boolean, ticketName: string | null, priceCents: number, needsProof: boolean, proofUrl: string | null, proofContentType: string | null, ticketCode: string | null, checkedInAt: string | null }>, pix: { keyType: PixKeyType, key: string, name: string, city: string } | null }> } };

export type CreateEventOrderMutationVariables = Exact<{
  eventId: string | number;
  attendees: Array<AttendeeInput> | AttendeeInput;
}>;


export type CreateEventOrderMutation = { createEventOrder: { id: string, eventId: string, eventTitle: string, code: string, status: EventOrderStatus, totalCents: number, buyerId: string | null, buyerName: string | null, unitId: string | null, unitLabel: string | null, pixCode: string | null, expiresAt: string | null, receiptSentAt: string | null, receiptContentType: string | null, receiptUrl: string | null, reviewedAt: string | null, rejectReason: string | null, cancelledAt: string | null, createdAt: string, attendees: Array<{ id: string, source: AttendeeSource, dependentId: string | null, name: string, age: number, outside: boolean, ticketName: string | null, priceCents: number, needsProof: boolean, proofUrl: string | null, proofContentType: string | null, ticketCode: string | null, checkedInAt: string | null }>, pix: { keyType: PixKeyType, key: string, name: string, city: string } | null } };

export type SubmitEventOrderReceiptMutationVariables = Exact<{
  id: string | number;
  file: string;
}>;


export type SubmitEventOrderReceiptMutation = { submitEventOrderReceipt: { id: string, eventId: string, eventTitle: string, code: string, status: EventOrderStatus, totalCents: number, buyerId: string | null, buyerName: string | null, unitId: string | null, unitLabel: string | null, pixCode: string | null, expiresAt: string | null, receiptSentAt: string | null, receiptContentType: string | null, receiptUrl: string | null, reviewedAt: string | null, rejectReason: string | null, cancelledAt: string | null, createdAt: string, attendees: Array<{ id: string, source: AttendeeSource, dependentId: string | null, name: string, age: number, outside: boolean, ticketName: string | null, priceCents: number, needsProof: boolean, proofUrl: string | null, proofContentType: string | null, ticketCode: string | null, checkedInAt: string | null }>, pix: { keyType: PixKeyType, key: string, name: string, city: string } | null } };

export type CancelEventOrderMutationVariables = Exact<{
  id: string | number;
}>;


export type CancelEventOrderMutation = { cancelEventOrder: { id: string, eventId: string, eventTitle: string, code: string, status: EventOrderStatus, totalCents: number, buyerId: string | null, buyerName: string | null, unitId: string | null, unitLabel: string | null, pixCode: string | null, expiresAt: string | null, receiptSentAt: string | null, receiptContentType: string | null, receiptUrl: string | null, reviewedAt: string | null, rejectReason: string | null, cancelledAt: string | null, createdAt: string, attendees: Array<{ id: string, source: AttendeeSource, dependentId: string | null, name: string, age: number, outside: boolean, ticketName: string | null, priceCents: number, needsProof: boolean, proofUrl: string | null, proofContentType: string | null, ticketCode: string | null, checkedInAt: string | null }>, pix: { keyType: PixKeyType, key: string, name: string, city: string } | null } };

export type ApproveEventOrderMutationVariables = Exact<{
  id: string | number;
}>;


export type ApproveEventOrderMutation = { approveEventOrder: { id: string, eventId: string, eventTitle: string, code: string, status: EventOrderStatus, totalCents: number, buyerId: string | null, buyerName: string | null, unitId: string | null, unitLabel: string | null, pixCode: string | null, expiresAt: string | null, receiptSentAt: string | null, receiptContentType: string | null, receiptUrl: string | null, reviewedAt: string | null, rejectReason: string | null, cancelledAt: string | null, createdAt: string, attendees: Array<{ id: string, source: AttendeeSource, dependentId: string | null, name: string, age: number, outside: boolean, ticketName: string | null, priceCents: number, needsProof: boolean, proofUrl: string | null, proofContentType: string | null, ticketCode: string | null, checkedInAt: string | null }>, pix: { keyType: PixKeyType, key: string, name: string, city: string } | null } };

export type RejectEventOrderMutationVariables = Exact<{
  id: string | number;
  reason: string;
}>;


export type RejectEventOrderMutation = { rejectEventOrder: { id: string, eventId: string, eventTitle: string, code: string, status: EventOrderStatus, totalCents: number, buyerId: string | null, buyerName: string | null, unitId: string | null, unitLabel: string | null, pixCode: string | null, expiresAt: string | null, receiptSentAt: string | null, receiptContentType: string | null, receiptUrl: string | null, reviewedAt: string | null, rejectReason: string | null, cancelledAt: string | null, createdAt: string, attendees: Array<{ id: string, source: AttendeeSource, dependentId: string | null, name: string, age: number, outside: boolean, ticketName: string | null, priceCents: number, needsProof: boolean, proofUrl: string | null, proofContentType: string | null, ticketCode: string | null, checkedInAt: string | null }>, pix: { keyType: PixKeyType, key: string, name: string, city: string } | null } };

export type SubmitEventAttendeeProofMutationVariables = Exact<{
  orderId: string | number;
  attendeeId: string | number;
  file: string;
}>;


export type SubmitEventAttendeeProofMutation = { submitEventAttendeeProof: { id: string, eventId: string, eventTitle: string, code: string, status: EventOrderStatus, totalCents: number, buyerId: string | null, buyerName: string | null, unitId: string | null, unitLabel: string | null, pixCode: string | null, expiresAt: string | null, receiptSentAt: string | null, receiptContentType: string | null, receiptUrl: string | null, reviewedAt: string | null, rejectReason: string | null, cancelledAt: string | null, createdAt: string, attendees: Array<{ id: string, source: AttendeeSource, dependentId: string | null, name: string, age: number, outside: boolean, ticketName: string | null, priceCents: number, needsProof: boolean, proofUrl: string | null, proofContentType: string | null, ticketCode: string | null, checkedInAt: string | null }>, pix: { keyType: PixKeyType, key: string, name: string, city: string } | null } };

export type GateEventTicketFieldsFragment = { id: string, name: string, age: number, outside: boolean, source: AttendeeSource, ticketName: string | null, ticketCode: string, checkedInAt: string | null, entryWindow: TicketEntryWindow, eventId: string, eventTitle: string, eventStatus: EventStatus, startsAt: string, endsAt: string, placeName: string, orderCode: string, buyerName: string | null, unitId: string | null, unitLabel: string | null };

export type GateEventTicketsQueryVariables = Exact<{
  date?: string | null | undefined;
}>;


export type GateEventTicketsQuery = { gateEventTickets: Array<{ id: string, name: string, age: number, outside: boolean, source: AttendeeSource, ticketName: string | null, ticketCode: string, checkedInAt: string | null, entryWindow: TicketEntryWindow, eventId: string, eventTitle: string, eventStatus: EventStatus, startsAt: string, endsAt: string, placeName: string, orderCode: string, buyerName: string | null, unitId: string | null, unitLabel: string | null }> };

export type CheckInEventTicketMutationVariables = Exact<{
  input: CheckInEventTicketInput;
}>;


export type CheckInEventTicketMutation = { checkInEventTicket: { id: string, name: string, age: number, outside: boolean, source: AttendeeSource, ticketName: string | null, ticketCode: string, checkedInAt: string | null, entryWindow: TicketEntryWindow, eventId: string, eventTitle: string, eventStatus: EventStatus, startsAt: string, endsAt: string, placeName: string, orderCode: string, buyerName: string | null, unitId: string | null, unitLabel: string | null } };

export type UndoEventTicketCheckInMutationVariables = Exact<{
  attendeeId: string | number;
}>;


export type UndoEventTicketCheckInMutation = { undoEventTicketCheckIn: { id: string, name: string, age: number, outside: boolean, source: AttendeeSource, ticketName: string | null, ticketCode: string, checkedInAt: string | null, entryWindow: TicketEntryWindow, eventId: string, eventTitle: string, eventStatus: EventStatus, startsAt: string, endsAt: string, placeName: string, orderCode: string, buyerName: string | null, unitId: string | null, unitLabel: string | null } };

export type EventTicketPassQueryVariables = Exact<{
  code: string;
}>;


export type EventTicketPassQuery = { eventTicket: { code: string, name: string, ticketName: string | null, eventTitle: string, placeName: string, condominiumName: string, startsAt: string, endsAt: string, buyerFirstName: string | null, status: TicketPassStatus, checkedIn: boolean } | null };

export type EventOrdersQueueQueryVariables = Exact<{
  status?: EventOrderStatus | null | undefined;
  eventId?: string | number | null | undefined;
}>;


export type EventOrdersQueueQuery = { eventOrdersQueue: Array<{ id: string, eventId: string, eventTitle: string, code: string, status: EventOrderStatus, totalCents: number, buyerId: string | null, buyerName: string | null, unitId: string | null, unitLabel: string | null, pixCode: string | null, expiresAt: string | null, receiptSentAt: string | null, receiptContentType: string | null, receiptUrl: string | null, reviewedAt: string | null, rejectReason: string | null, cancelledAt: string | null, createdAt: string, attendees: Array<{ id: string, source: AttendeeSource, dependentId: string | null, name: string, age: number, outside: boolean, ticketName: string | null, priceCents: number, needsProof: boolean, proofUrl: string | null, proofContentType: string | null, ticketCode: string | null, checkedInAt: string | null }>, pix: { keyType: PixKeyType, key: string, name: string, city: string } | null }> };

export type EventTicketsQueryVariables = Exact<{
  eventId: string | number;
  filter?: EventTicketFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type EventTicketsQuery = { eventTickets: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, name: string, age: number, outside: boolean, source: AttendeeSource, ticketName: string | null, ticketCode: string, checkedInAt: string | null, entryWindow: TicketEntryWindow, eventId: string, eventTitle: string, eventStatus: EventStatus, startsAt: string, endsAt: string, placeName: string, orderCode: string, buyerName: string | null, unitId: string | null, unitLabel: string | null }> } };

export type EventTicketOverviewQueryVariables = Exact<{
  eventId: string | number;
}>;


export type EventTicketOverviewQuery = { eventTicketOverview: { total: number, checkedIn: number, outside: number, byType: Array<{ name: string | null, count: number }>, people: Array<{ id: string, name: string, ticketCode: string }>, units: Array<{ id: string, label: string }> } };

export type EventOrderOverviewQueryVariables = Exact<{
  eventId: string | number;
}>;


export type EventOrderOverviewQuery = { eventOrderOverview: { receivedCents: number, confirmedPeople: number, byStatus: Array<{ status: EventOrderStatus, count: number }>, buyers: Array<{ id: string, name: string }>, units: Array<{ id: string, label: string }>, codes: Array<{ code: string, buyerName: string | null }> } };

export type FoundItemFieldsFragment = { id: string, category: FoundItemCategory, title: string, description: string | null, foundLocation: string, foundAt: string, storageLocation: string, photoHidden: boolean, status: FoundItemStatus, registeredByName: string | null, keepUntil: string, closedAt: string | null, closedByName: string | null, closeReason: string | null, returnedToName: string | null, signerName: string | null, pendingClaims: number, awaitedByName: string | null, photoUrl: string | null, ownerUnitLabel: string | null, ownerName: string | null };

export type FoundItemClaimFieldsFragment = { id: string, itemId: string, itemTitle: string, itemStatus: FoundItemStatus, itemCategory: FoundItemCategory, userId: string, userName: string, unitLabel: string | null, message: string | null, status: FoundItemClaimStatus, createdAt: string, decidedAt: string | null, decidedByName: string | null, decisionNote: string | null };

export type FoundItemsQueryVariables = Exact<{
  filter?: FoundItemFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type FoundItemsQuery = { foundItems: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, category: FoundItemCategory, title: string, description: string | null, foundLocation: string, foundAt: string, storageLocation: string, photoHidden: boolean, status: FoundItemStatus, registeredByName: string | null, keepUntil: string, closedAt: string | null, closedByName: string | null, closeReason: string | null, returnedToName: string | null, signerName: string | null, pendingClaims: number, awaitedByName: string | null, photoUrl: string | null, ownerUnitLabel: string | null, ownerName: string | null }> } };

export type FoundItemOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type FoundItemOverviewQuery = { foundItemOverview: { pendingClaims: number, expiringSoon: number, titles: Array<string>, foundLocations: Array<string>, storageLocations: Array<string>, byStatus: Array<{ status: FoundItemStatus, count: number }>, residents: Array<{ id: string, name: string }> } };

export type FoundItemQueryVariables = Exact<{
  id: string | number;
}>;


export type FoundItemQuery = { foundItem: { privateDetails: string | null, returnDeclaration: string | null, soleStaffMember: boolean, id: string, category: FoundItemCategory, title: string, description: string | null, foundLocation: string, foundAt: string, storageLocation: string, photoHidden: boolean, status: FoundItemStatus, registeredByName: string | null, keepUntil: string, closedAt: string | null, closedByName: string | null, closeReason: string | null, returnedToName: string | null, signerName: string | null, pendingClaims: number, awaitedByName: string | null, photoUrl: string | null, ownerUnitLabel: string | null, ownerName: string | null, claims: Array<{ id: string, itemId: string, itemTitle: string, itemStatus: FoundItemStatus, itemCategory: FoundItemCategory, userId: string, userName: string, unitLabel: string | null, message: string | null, status: FoundItemClaimStatus, createdAt: string, decidedAt: string | null, decidedByName: string | null, decisionNote: string | null }>, myClaim: { id: string, itemId: string, itemTitle: string, itemStatus: FoundItemStatus, itemCategory: FoundItemCategory, userId: string, userName: string, unitLabel: string | null, message: string | null, status: FoundItemClaimStatus, createdAt: string, decidedAt: string | null, decidedByName: string | null, decisionNote: string | null } | null, returnReceipt: { signerName: string, signerDocumentType: DocumentType | null, signerDocumentMasked: string | null, declaration: string, imageUrl: string, imageSha256: string, strokesSha256: string, signedAt: string, clientSignedAt: string | null, clientTimeZone: string | null, ipAddress: string | null, userAgent: string | null, device: string, locationStatus: SignatureLocationStatus, latitude: number | null, longitude: number | null, locationAccuracyMeters: number | null, collectedByName: string, collectedByRole: string, evidenceSha256: string, intact: boolean, selfHandover: boolean } | null } };

export type KeptFoundItemsQueryVariables = Exact<{
  category?: FoundItemCategory | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type KeptFoundItemsQuery = { keptFoundItems: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, category: FoundItemCategory, title: string, description: string | null, foundLocation: string, foundAt: string, storageLocation: string, photoHidden: boolean, status: FoundItemStatus, registeredByName: string | null, keepUntil: string, closedAt: string | null, closedByName: string | null, closeReason: string | null, returnedToName: string | null, signerName: string | null, pendingClaims: number, awaitedByName: string | null, photoUrl: string | null, ownerUnitLabel: string | null, ownerName: string | null, myClaim: { id: string, itemId: string, itemTitle: string, itemStatus: FoundItemStatus, itemCategory: FoundItemCategory, userId: string, userName: string, unitLabel: string | null, message: string | null, status: FoundItemClaimStatus, createdAt: string, decidedAt: string | null, decidedByName: string | null, decisionNote: string | null } | null }> } };

export type MyFoundItemClaimsQueryVariables = Exact<{
  page?: PageInput | null | undefined;
}>;


export type MyFoundItemClaimsQuery = { myFoundItemClaims: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, itemId: string, itemTitle: string, itemStatus: FoundItemStatus, itemCategory: FoundItemCategory, userId: string, userName: string, unitLabel: string | null, message: string | null, status: FoundItemClaimStatus, createdAt: string, decidedAt: string | null, decidedByName: string | null, decisionNote: string | null }> } };

export type ClaimFoundItemMutationVariables = Exact<{
  itemId: string | number;
  message?: string | null | undefined;
}>;


export type ClaimFoundItemMutation = { claimFoundItem: { id: string, itemId: string, itemTitle: string, itemStatus: FoundItemStatus, itemCategory: FoundItemCategory, userId: string, userName: string, unitLabel: string | null, message: string | null, status: FoundItemClaimStatus, createdAt: string, decidedAt: string | null, decidedByName: string | null, decisionNote: string | null } };

export type WithdrawFoundItemClaimMutationVariables = Exact<{
  claimId: string | number;
}>;


export type WithdrawFoundItemClaimMutation = { withdrawFoundItemClaim: { id: string, itemId: string, itemTitle: string, itemStatus: FoundItemStatus, itemCategory: FoundItemCategory, userId: string, userName: string, unitLabel: string | null, message: string | null, status: FoundItemClaimStatus, createdAt: string, decidedAt: string | null, decidedByName: string | null, decisionNote: string | null } };

export type RegisterFoundItemMutationVariables = Exact<{
  input: RegisterFoundItemInput;
}>;


export type RegisterFoundItemMutation = { registerFoundItem: { id: string, category: FoundItemCategory, title: string, description: string | null, foundLocation: string, foundAt: string, storageLocation: string, photoHidden: boolean, status: FoundItemStatus, registeredByName: string | null, keepUntil: string, closedAt: string | null, closedByName: string | null, closeReason: string | null, returnedToName: string | null, signerName: string | null, pendingClaims: number, awaitedByName: string | null, photoUrl: string | null, ownerUnitLabel: string | null, ownerName: string | null } };

export type DecideFoundItemClaimMutationVariables = Exact<{
  claimId: string | number;
  accept: boolean;
  note?: string | null | undefined;
}>;


export type DecideFoundItemClaimMutation = { decideFoundItemClaim: { id: string, itemId: string, itemTitle: string, itemStatus: FoundItemStatus, itemCategory: FoundItemCategory, userId: string, userName: string, unitLabel: string | null, message: string | null, status: FoundItemClaimStatus, createdAt: string, decidedAt: string | null, decidedByName: string | null, decisionNote: string | null } };

export type ReturnFoundItemMutationVariables = Exact<{
  input: ReturnFoundItemInput;
}>;


export type ReturnFoundItemMutation = { returnFoundItem: { id: string, category: FoundItemCategory, title: string, description: string | null, foundLocation: string, foundAt: string, storageLocation: string, photoHidden: boolean, status: FoundItemStatus, registeredByName: string | null, keepUntil: string, closedAt: string | null, closedByName: string | null, closeReason: string | null, returnedToName: string | null, signerName: string | null, pendingClaims: number, awaitedByName: string | null, photoUrl: string | null, ownerUnitLabel: string | null, ownerName: string | null } };

export type DonateFoundItemMutationVariables = Exact<{
  id: string | number;
  reason: string;
}>;


export type DonateFoundItemMutation = { donateFoundItem: { id: string, category: FoundItemCategory, title: string, description: string | null, foundLocation: string, foundAt: string, storageLocation: string, photoHidden: boolean, status: FoundItemStatus, registeredByName: string | null, keepUntil: string, closedAt: string | null, closedByName: string | null, closeReason: string | null, returnedToName: string | null, signerName: string | null, pendingClaims: number, awaitedByName: string | null, photoUrl: string | null, ownerUnitLabel: string | null, ownerName: string | null } };

export type DiscardFoundItemMutationVariables = Exact<{
  id: string | number;
  reason: string;
}>;


export type DiscardFoundItemMutation = { discardFoundItem: { id: string, category: FoundItemCategory, title: string, description: string | null, foundLocation: string, foundAt: string, storageLocation: string, photoHidden: boolean, status: FoundItemStatus, registeredByName: string | null, keepUntil: string, closedAt: string | null, closedByName: string | null, closeReason: string | null, returnedToName: string | null, signerName: string | null, pendingClaims: number, awaitedByName: string | null, photoUrl: string | null, ownerUnitLabel: string | null, ownerName: string | null } };

export type FoundItemOwnersQueryVariables = Exact<{
  search: string;
}>;


export type FoundItemOwnersQuery = { foundItemOwners: Array<{ userId: string, name: string, unitId: string, unitLabel: string }> };

export type ReleaseFoundItemMutationVariables = Exact<{
  id: string | number;
}>;


export type ReleaseFoundItemMutation = { releaseFoundItem: { id: string, category: FoundItemCategory, title: string, description: string | null, foundLocation: string, foundAt: string, storageLocation: string, photoHidden: boolean, status: FoundItemStatus, registeredByName: string | null, keepUntil: string, closedAt: string | null, closedByName: string | null, closeReason: string | null, returnedToName: string | null, signerName: string | null, pendingClaims: number, awaitedByName: string | null, photoUrl: string | null, ownerUnitLabel: string | null, ownerName: string | null } };

export type FoundItemClaimsQueryVariables = Exact<{
  open?: boolean | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type FoundItemClaimsQuery = { foundItemClaims: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, itemId: string, itemTitle: string, itemStatus: FoundItemStatus, itemCategory: FoundItemCategory, userId: string, userName: string, unitLabel: string | null, message: string | null, status: FoundItemClaimStatus, createdAt: string, decidedAt: string | null, decidedByName: string | null, decisionNote: string | null, item: { privateDetails: string | null, id: string, category: FoundItemCategory, title: string, description: string | null, foundLocation: string, foundAt: string, storageLocation: string, photoHidden: boolean, status: FoundItemStatus, registeredByName: string | null, keepUntil: string, closedAt: string | null, closedByName: string | null, closeReason: string | null, returnedToName: string | null, signerName: string | null, pendingClaims: number, awaitedByName: string | null, photoUrl: string | null, ownerUnitLabel: string | null, ownerName: string | null } }> } };

export type FoundItemReceiptPdfQueryVariables = Exact<{
  id: string | number;
}>;


export type FoundItemReceiptPdfQuery = { foundItemReceiptPdf: { fileName: string, mimeType: string, base64Content: string } };

export type FoundItemStaffQueryVariables = Exact<{ [key: string]: never; }>;


export type FoundItemStaffQuery = { foundItemStaff: Array<{ userId: string, name: string, roleLabel: string }> };

export type LostReportFieldsFragment = { id: string, userId: string, userName: string, unitId: string | null, unitLabel: string | null, category: FoundItemCategory, title: string, description: string | null, lostLocation: string | null, lostOn: string | null, photoUrl: string | null, shared: boolean, spotCount: number, status: LostReportStatus, foundItemId: string | null, closedAt: string | null, createdAt: string };

export type MyLostReportsQueryVariables = Exact<{
  page?: PageInput | null | undefined;
}>;


export type MyLostReportsQuery = { myLostReports: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, userId: string, userName: string, unitId: string | null, unitLabel: string | null, category: FoundItemCategory, title: string, description: string | null, lostLocation: string | null, lostOn: string | null, photoUrl: string | null, shared: boolean, spotCount: number, status: LostReportStatus, foundItemId: string | null, closedAt: string | null, createdAt: string }> } };

export type LostReportsQueryVariables = Exact<{
  open?: boolean | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type LostReportsQuery = { lostReports: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, userId: string, userName: string, unitId: string | null, unitLabel: string | null, category: FoundItemCategory, title: string, description: string | null, lostLocation: string | null, lostOn: string | null, photoUrl: string | null, shared: boolean, spotCount: number, status: LostReportStatus, foundItemId: string | null, closedAt: string | null, createdAt: string }> } };

export type ReportLostItemMutationVariables = Exact<{
  input: ReportLostItemInput;
}>;


export type ReportLostItemMutation = { reportLostItem: { id: string, userId: string, userName: string, unitId: string | null, unitLabel: string | null, category: FoundItemCategory, title: string, description: string | null, lostLocation: string | null, lostOn: string | null, photoUrl: string | null, shared: boolean, spotCount: number, status: LostReportStatus, foundItemId: string | null, closedAt: string | null, createdAt: string } };

export type CloseLostReportMutationVariables = Exact<{
  id: string | number;
  found: boolean;
}>;


export type CloseLostReportMutation = { closeLostReport: { id: string, userId: string, userName: string, unitId: string | null, unitLabel: string | null, category: FoundItemCategory, title: string, description: string | null, lostLocation: string | null, lostOn: string | null, photoUrl: string | null, shared: boolean, spotCount: number, status: LostReportStatus, foundItemId: string | null, closedAt: string | null, createdAt: string } };

export type LostReportBoardQueryVariables = Exact<{
  page?: PageInput | null | undefined;
}>;


export type LostReportBoardQuery = { lostReportBoard: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, category: FoundItemCategory, title: string, lostLocation: string | null, lostOn: string | null, photoUrl: string | null, mine: boolean, spottedByMe: boolean, createdAt: string }> } };

export type SpotLostReportMutationVariables = Exact<{
  id: string | number;
  note?: string | null | undefined;
}>;


export type SpotLostReportMutation = { spotLostReport: boolean };

export type MyNotificationsQueryVariables = Exact<{
  unreadOnly: boolean;
  page?: PageInput | null | undefined;
}>;


export type MyNotificationsQuery = { myNotifications: { total: number, page: number, totalPages: number, items: Array<{ id: string, type: NotificationType, title: string, body: string, link: string | null, readAt: string | null, createdAt: string }> } };

export type UnreadNotificationsCountQueryVariables = Exact<{ [key: string]: never; }>;


export type UnreadNotificationsCountQuery = { unreadNotificationsCount: number };

export type MarkNotificationReadMutationVariables = Exact<{
  id: string | number;
}>;


export type MarkNotificationReadMutation = { markNotificationRead: boolean };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { markAllNotificationsRead: number };

export type NotificationPreferencesQueryVariables = Exact<{ [key: string]: never; }>;


export type NotificationPreferencesQuery = { myNotificationPreferences: Array<{ type: NotificationType, emailEnabled: boolean }> };

export type SetNotificationPreferenceMutationVariables = Exact<{
  type: NotificationType;
  emailEnabled: boolean;
}>;


export type SetNotificationPreferenceMutation = { setNotificationPreference: { type: NotificationType, emailEnabled: boolean } };

export type PushPublicKeyQueryVariables = Exact<{ [key: string]: never; }>;


export type PushPublicKeyQuery = { pushPublicKey: string | null };

export type SubscribePushMutationVariables = Exact<{
  input: PushSubscriptionInput;
}>;


export type SubscribePushMutation = { subscribePush: boolean };

export type UnsubscribePushMutationVariables = Exact<{
  endpoint: string;
}>;


export type UnsubscribePushMutation = { unsubscribePush: boolean };

export type SendTestPushMutationVariables = Exact<{ [key: string]: never; }>;


export type SendTestPushMutation = { sendTestPush: number };

export type ParcelFieldsFragment = { id: string, unitId: string | null, unitLabel: string | null, recipientName: string | null, recipientOnly: boolean, carrier: string | null, trackingCode: string | null, notes: string | null, storageLocation: string | null, pickupCode: string, perishable: boolean, pickupDeadline: string | null, authorizedName: string | null, authorizedDocumentMasked: string | null, authorizedByName: string | null, authorizedAt: string | null, status: ParcelStatus, receivedAt: string, receivedByName: string | null, closedAt: string | null, closedByName: string | null, closeReason: string | null, signerName: string | null, photoUrl: string | null };

export type ParcelsQueryVariables = Exact<{
  filter?: ParcelFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type ParcelsQuery = { parcels: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, unitId: string | null, unitLabel: string | null, recipientName: string | null, recipientOnly: boolean, carrier: string | null, trackingCode: string | null, notes: string | null, storageLocation: string | null, pickupCode: string, perishable: boolean, pickupDeadline: string | null, authorizedName: string | null, authorizedDocumentMasked: string | null, authorizedByName: string | null, authorizedAt: string | null, status: ParcelStatus, receivedAt: string, receivedByName: string | null, closedAt: string | null, closedByName: string | null, closeReason: string | null, signerName: string | null, photoUrl: string | null }> } };

export type ParcelOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type ParcelOverviewQuery = { parcelOverview: { waitingLong: number, perishableWaiting: number, perishableOverdue: number, recipientNames: Array<string>, carriers: Array<string>, trackingCodes: Array<string>, byStatus: Array<{ status: ParcelStatus, count: number }>, units: Array<{ id: string, label: string }> } };

export type ParcelByCodeQueryVariables = Exact<{
  code: string;
}>;


export type ParcelByCodeQuery = { parcelByCode: { pickupDeclaration: string | null, authorizedDocumentType: DocumentType | null, authorizedDocument: string | null, id: string, unitId: string | null, unitLabel: string | null, recipientName: string | null, recipientOnly: boolean, carrier: string | null, trackingCode: string | null, notes: string | null, storageLocation: string | null, pickupCode: string, perishable: boolean, pickupDeadline: string | null, authorizedName: string | null, authorizedDocumentMasked: string | null, authorizedByName: string | null, authorizedAt: string | null, status: ParcelStatus, receivedAt: string, receivedByName: string | null, closedAt: string | null, closedByName: string | null, closeReason: string | null, signerName: string | null, photoUrl: string | null } };

export type RegisterParcelMutationVariables = Exact<{
  input: RegisterParcelInput;
}>;


export type RegisterParcelMutation = { registerParcel: { id: string, unitId: string | null, unitLabel: string | null, recipientName: string | null, recipientOnly: boolean, carrier: string | null, trackingCode: string | null, notes: string | null, storageLocation: string | null, pickupCode: string, perishable: boolean, pickupDeadline: string | null, authorizedName: string | null, authorizedDocumentMasked: string | null, authorizedByName: string | null, authorizedAt: string | null, status: ParcelStatus, receivedAt: string, receivedByName: string | null, closedAt: string | null, closedByName: string | null, closeReason: string | null, signerName: string | null, photoUrl: string | null } };

export type PickUpParcelMutationVariables = Exact<{
  input: PickUpParcelInput;
}>;


export type PickUpParcelMutation = { pickUpParcel: { id: string, unitId: string | null, unitLabel: string | null, recipientName: string | null, recipientOnly: boolean, carrier: string | null, trackingCode: string | null, notes: string | null, storageLocation: string | null, pickupCode: string, perishable: boolean, pickupDeadline: string | null, authorizedName: string | null, authorizedDocumentMasked: string | null, authorizedByName: string | null, authorizedAt: string | null, status: ParcelStatus, receivedAt: string, receivedByName: string | null, closedAt: string | null, closedByName: string | null, closeReason: string | null, signerName: string | null, photoUrl: string | null } };

export type ReturnParcelMutationVariables = Exact<{
  id: string | number;
  reason: string;
}>;


export type ReturnParcelMutation = { returnParcel: { id: string, unitId: string | null, unitLabel: string | null, recipientName: string | null, recipientOnly: boolean, carrier: string | null, trackingCode: string | null, notes: string | null, storageLocation: string | null, pickupCode: string, perishable: boolean, pickupDeadline: string | null, authorizedName: string | null, authorizedDocumentMasked: string | null, authorizedByName: string | null, authorizedAt: string | null, status: ParcelStatus, receivedAt: string, receivedByName: string | null, closedAt: string | null, closedByName: string | null, closeReason: string | null, signerName: string | null, photoUrl: string | null } };

export type CancelParcelMutationVariables = Exact<{
  id: string | number;
  reason: string;
}>;


export type CancelParcelMutation = { cancelParcel: { id: string, unitId: string | null, unitLabel: string | null, recipientName: string | null, recipientOnly: boolean, carrier: string | null, trackingCode: string | null, notes: string | null, storageLocation: string | null, pickupCode: string, perishable: boolean, pickupDeadline: string | null, authorizedName: string | null, authorizedDocumentMasked: string | null, authorizedByName: string | null, authorizedAt: string | null, status: ParcelStatus, receivedAt: string, receivedByName: string | null, closedAt: string | null, closedByName: string | null, closeReason: string | null, signerName: string | null, photoUrl: string | null } };

export type ParcelRecipientsQueryVariables = Exact<{
  search: string;
}>;


export type ParcelRecipientsQuery = { parcelRecipients: Array<{ userId: string, name: string, unitId: string, unitLabel: string }> };

export type MyParcelsQueryVariables = Exact<{
  statuses?: Array<ParcelStatus> | ParcelStatus | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type MyParcelsQuery = { myParcels: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, unitId: string | null, unitLabel: string | null, recipientName: string | null, recipientOnly: boolean, carrier: string | null, trackingCode: string | null, notes: string | null, storageLocation: string | null, pickupCode: string, perishable: boolean, pickupDeadline: string | null, authorizedName: string | null, authorizedDocumentMasked: string | null, authorizedByName: string | null, authorizedAt: string | null, status: ParcelStatus, receivedAt: string, receivedByName: string | null, closedAt: string | null, closedByName: string | null, closeReason: string | null, signerName: string | null, photoUrl: string | null }> } };

export type ParcelQueryVariables = Exact<{
  id: string | number;
}>;


export type ParcelQuery = { parcel: { id: string, unitId: string | null, unitLabel: string | null, recipientName: string | null, recipientOnly: boolean, carrier: string | null, trackingCode: string | null, notes: string | null, storageLocation: string | null, pickupCode: string, perishable: boolean, pickupDeadline: string | null, authorizedName: string | null, authorizedDocumentMasked: string | null, authorizedByName: string | null, authorizedAt: string | null, status: ParcelStatus, receivedAt: string, receivedByName: string | null, closedAt: string | null, closedByName: string | null, closeReason: string | null, signerName: string | null, photoUrl: string | null, signature: { signerName: string, signerDocumentType: DocumentType | null, signerDocumentMasked: string | null, declaration: string, imageUrl: string, imageSha256: string, strokesSha256: string, signedAt: string, clientSignedAt: string | null, clientTimeZone: string | null, ipAddress: string | null, userAgent: string | null, device: string, locationStatus: SignatureLocationStatus, latitude: number | null, longitude: number | null, locationAccuracyMeters: number | null, collectedByName: string, collectedByRole: string, evidenceSha256: string, intact: boolean } | null } };

export type ParcelReceiptPdfQueryVariables = Exact<{
  id: string | number;
}>;


export type ParcelReceiptPdfQuery = { parcelReceiptPdf: { fileName: string, mimeType: string, base64Content: string } };

export type AuthorizeParcelPickupMutationVariables = Exact<{
  input: AuthorizeParcelPickupInput;
}>;


export type AuthorizeParcelPickupMutation = { authorizeParcelPickup: { id: string, unitId: string | null, unitLabel: string | null, recipientName: string | null, recipientOnly: boolean, carrier: string | null, trackingCode: string | null, notes: string | null, storageLocation: string | null, pickupCode: string, perishable: boolean, pickupDeadline: string | null, authorizedName: string | null, authorizedDocumentMasked: string | null, authorizedByName: string | null, authorizedAt: string | null, status: ParcelStatus, receivedAt: string, receivedByName: string | null, closedAt: string | null, closedByName: string | null, closeReason: string | null, signerName: string | null, photoUrl: string | null } };

export type RevokeParcelPickupAuthorizationMutationVariables = Exact<{
  parcelId: string | number;
}>;


export type RevokeParcelPickupAuthorizationMutation = { revokeParcelPickupAuthorization: { id: string, unitId: string | null, unitLabel: string | null, recipientName: string | null, recipientOnly: boolean, carrier: string | null, trackingCode: string | null, notes: string | null, storageLocation: string | null, pickupCode: string, perishable: boolean, pickupDeadline: string | null, authorizedName: string | null, authorizedDocumentMasked: string | null, authorizedByName: string | null, authorizedAt: string | null, status: ParcelStatus, receivedAt: string, receivedByName: string | null, closedAt: string | null, closedByName: string | null, closeReason: string | null, signerName: string | null, photoUrl: string | null } };

export type CondominiumPixQueryVariables = Exact<{ [key: string]: never; }>;


export type CondominiumPixQuery = { condominiumPix: { keyType: PixKeyType, key: string, name: string, city: string } | null };

export type SetCondominiumPixMutationVariables = Exact<{
  input: PixReceiverInput;
}>;


export type SetCondominiumPixMutation = { setCondominiumPix: { keyType: PixKeyType, key: string, name: string, city: string } };

export type RemoveCondominiumPixMutationVariables = Exact<{ [key: string]: never; }>;


export type RemoveCondominiumPixMutation = { removeCondominiumPix: boolean };

export type PlatformMetricsQueryVariables = Exact<{
  filter?: PlatformMetricsFilterInput | null | undefined;
}>;


export type PlatformMetricsQuery = { platformMetrics: { from: string, to: string, days: number, condominiumId: string | null, bookings: { total: number, confirmed: number, pending: number, cancelled: number, rejected: number, stalePending: number, granularity: MetricsGranularity, series: Array<{ bucket: string, total: number, cancelled: number }>, byCondominium: Array<{ condominiumId: string, name: string, total: number, cancelled: number }> }, parcels: { condominiumsWithModule: number, received: number, pickedUp: number, returned: number, cancelled: number, perishable: number, averagePickupHours: number | null, waitingNow: number, stuckNow: number, perishableOverdueNow: number, granularity: MetricsGranularity, series: Array<{ bucket: string, received: number, pickedUp: number }>, byCondominium: Array<{ condominiumId: string, name: string, received: number, pickedUp: number }> }, spaces: { activeSpaces: number, unusedCount: number, mostUsed: Array<{ spaceId: string, name: string, condominiumName: string, bookings: number, hours: number }>, unused: Array<{ spaceId: string, name: string, condominiumName: string, bookings: number, hours: number }>, byWeekday: Array<{ weekday: number, bookings: number }>, byHour: Array<{ hour: number, bookings: number }> }, engagement: { members: number, active7d: number, active30d: number, newMembers: number, enrollments: number, inactiveCount: number, inactiveCondominiums: Array<{ condominiumId: string, name: string, lastActivityAt: string | null }> }, health: { staleEnrollments: number, failedNotifications: number, delayedNotifications: number, withoutManager: number, withoutUnits: number, openSupport: number } } };

export type PlatformPeopleQueryVariables = Exact<{
  filter?: PlatformPeopleFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type PlatformPeopleQuery = { platformPeople: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, name: string, email: string, username: string, phone: string | null, platformAdmin: boolean, active: boolean, lockedUntil: string | null, lastLoginAt: string | null, createdAt: string, memberships: Array<{ condominiumId: string, condominiumName: string, role: UserGroup, kind: MemberKind, active: boolean }> }> } };

export type CondominiumMembersQueryVariables = Exact<{
  condominiumId: string | number;
}>;


export type CondominiumMembersQuery = { condominiumMembers: Array<{ userId: string, name: string, email: string, username: string, phone: string | null, role: UserGroup, kind: MemberKind, active: boolean, unitLabel: string | null, jobTitle: string | null, lastLoginAt: string | null, since: string }> };

export type ResidentsDirectoryQueryVariables = Exact<{
  filter?: ResidentsFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type ResidentsDirectoryQuery = { residentsDirectory: { total: number, page: number, limit: number, totalPages: number, items: Array<{ userId: string, name: string, photoUrl: string | null, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, dependents: Array<{ id: string, name: string, relationship: DependentRelationship }> }> } };

export type ResidentNamesQueryVariables = Exact<{ [key: string]: never; }>;


export type ResidentNamesQuery = { residentNames: Array<{ id: string, name: string }> };

export type SpaceFieldsFragment = { id: string, name: string, kind: SpaceKind, description: string | null, capacity: number | null, usageRules: string | null, active: boolean, createdAt: string, updatedAt: string, photos: Array<{ id: string, url: string }>, rules: { slotMinutes: number, minAdvanceHours: number, maxAdvanceDays: number, requiresApproval: boolean, cancelUntilHours: number, feeCents: number | null, recurringAllowed: boolean, openingHours: Array<{ weekday: number, opensAt: string, closesAt: string }>, unitLimit: { count: number, period: LimitPeriod } | null, guests: { allowed: boolean, max: number | null, documentRequired: boolean } } };

export type SpacesQueryVariables = Exact<{
  includeInactive: boolean;
}>;


export type SpacesQuery = { spaces: Array<{ id: string, name: string, kind: SpaceKind, description: string | null, capacity: number | null, usageRules: string | null, active: boolean, createdAt: string, updatedAt: string, photos: Array<{ id: string, url: string }>, rules: { slotMinutes: number, minAdvanceHours: number, maxAdvanceDays: number, requiresApproval: boolean, cancelUntilHours: number, feeCents: number | null, recurringAllowed: boolean, openingHours: Array<{ weekday: number, opensAt: string, closesAt: string }>, unitLimit: { count: number, period: LimitPeriod } | null, guests: { allowed: boolean, max: number | null, documentRequired: boolean } } }> };

export type SpaceQueryVariables = Exact<{
  id: string | number;
}>;


export type SpaceQuery = { space: { id: string, name: string, kind: SpaceKind, description: string | null, capacity: number | null, usageRules: string | null, active: boolean, createdAt: string, updatedAt: string, photos: Array<{ id: string, url: string }>, rules: { slotMinutes: number, minAdvanceHours: number, maxAdvanceDays: number, requiresApproval: boolean, cancelUntilHours: number, feeCents: number | null, recurringAllowed: boolean, openingHours: Array<{ weekday: number, opensAt: string, closesAt: string }>, unitLimit: { count: number, period: LimitPeriod } | null, guests: { allowed: boolean, max: number | null, documentRequired: boolean } } } };

export type CreateSpaceMutationVariables = Exact<{
  input: SpaceInput;
}>;


export type CreateSpaceMutation = { createSpace: { id: string, name: string, kind: SpaceKind, description: string | null, capacity: number | null, usageRules: string | null, active: boolean, createdAt: string, updatedAt: string, photos: Array<{ id: string, url: string }>, rules: { slotMinutes: number, minAdvanceHours: number, maxAdvanceDays: number, requiresApproval: boolean, cancelUntilHours: number, feeCents: number | null, recurringAllowed: boolean, openingHours: Array<{ weekday: number, opensAt: string, closesAt: string }>, unitLimit: { count: number, period: LimitPeriod } | null, guests: { allowed: boolean, max: number | null, documentRequired: boolean } } } };

export type UpdateSpaceMutationVariables = Exact<{
  id: string | number;
  input: SpaceInput;
}>;


export type UpdateSpaceMutation = { updateSpace: { id: string, name: string, kind: SpaceKind, description: string | null, capacity: number | null, usageRules: string | null, active: boolean, createdAt: string, updatedAt: string, photos: Array<{ id: string, url: string }>, rules: { slotMinutes: number, minAdvanceHours: number, maxAdvanceDays: number, requiresApproval: boolean, cancelUntilHours: number, feeCents: number | null, recurringAllowed: boolean, openingHours: Array<{ weekday: number, opensAt: string, closesAt: string }>, unitLimit: { count: number, period: LimitPeriod } | null, guests: { allowed: boolean, max: number | null, documentRequired: boolean } } } };

export type SetSpaceActiveMutationVariables = Exact<{
  id: string | number;
  active: boolean;
}>;


export type SetSpaceActiveMutation = { setSpaceActive: { id: string, name: string, kind: SpaceKind, description: string | null, capacity: number | null, usageRules: string | null, active: boolean, createdAt: string, updatedAt: string, photos: Array<{ id: string, url: string }>, rules: { slotMinutes: number, minAdvanceHours: number, maxAdvanceDays: number, requiresApproval: boolean, cancelUntilHours: number, feeCents: number | null, recurringAllowed: boolean, openingHours: Array<{ weekday: number, opensAt: string, closesAt: string }>, unitLimit: { count: number, period: LimitPeriod } | null, guests: { allowed: boolean, max: number | null, documentRequired: boolean } } } };

export type AddSpacePhotoMutationVariables = Exact<{
  spaceId: string | number;
  photo: string;
}>;


export type AddSpacePhotoMutation = { addSpacePhoto: { id: string, name: string, kind: SpaceKind, description: string | null, capacity: number | null, usageRules: string | null, active: boolean, createdAt: string, updatedAt: string, photos: Array<{ id: string, url: string }>, rules: { slotMinutes: number, minAdvanceHours: number, maxAdvanceDays: number, requiresApproval: boolean, cancelUntilHours: number, feeCents: number | null, recurringAllowed: boolean, openingHours: Array<{ weekday: number, opensAt: string, closesAt: string }>, unitLimit: { count: number, period: LimitPeriod } | null, guests: { allowed: boolean, max: number | null, documentRequired: boolean } } } };

export type RemoveSpacePhotoMutationVariables = Exact<{
  spaceId: string | number;
  photoId: string | number;
}>;


export type RemoveSpacePhotoMutation = { removeSpacePhoto: { id: string, name: string, kind: SpaceKind, description: string | null, capacity: number | null, usageRules: string | null, active: boolean, createdAt: string, updatedAt: string, photos: Array<{ id: string, url: string }>, rules: { slotMinutes: number, minAdvanceHours: number, maxAdvanceDays: number, requiresApproval: boolean, cancelUntilHours: number, feeCents: number | null, recurringAllowed: boolean, openingHours: Array<{ weekday: number, opensAt: string, closesAt: string }>, unitLimit: { count: number, period: LimitPeriod } | null, guests: { allowed: boolean, max: number | null, documentRequired: boolean } } } };

export type DeleteSpaceMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteSpaceMutation = { deleteSpace: boolean };

export type SupportRequestFieldsFragment = { id: string, protocol: number, userId: string, userName: string, condominiumName: string | null, category: SupportCategory, subject: string, message: string, status: SupportStatus, reply: string | null, repliedAt: string | null, repliedByName: string | null, finalizedAt: string | null, finalizedByName: string | null, createdAt: string };

export type SupportPageQueryVariables = Exact<{
  page?: PageInput | null | undefined;
}>;


export type SupportPageQuery = { supportQuota: { limit: number, sentToday: number, remaining: number, nextAllowedAt: string | null }, mySupportRequests: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, protocol: number, userId: string, userName: string, condominiumName: string | null, category: SupportCategory, subject: string, message: string, status: SupportStatus, reply: string | null, repliedAt: string | null, repliedByName: string | null, finalizedAt: string | null, finalizedByName: string | null, createdAt: string }> } };

export type SupportRequestsQueryVariables = Exact<{
  status?: SupportStatus | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type SupportRequestsQuery = { supportRequests: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, protocol: number, userId: string, userName: string, condominiumName: string | null, category: SupportCategory, subject: string, message: string, status: SupportStatus, reply: string | null, repliedAt: string | null, repliedByName: string | null, finalizedAt: string | null, finalizedByName: string | null, createdAt: string }> } };

export type SendSupportRequestMutationVariables = Exact<{
  input: SupportRequestInput;
}>;


export type SendSupportRequestMutation = { sendSupportRequest: { id: string, protocol: number, userId: string, userName: string, condominiumName: string | null, category: SupportCategory, subject: string, message: string, status: SupportStatus, reply: string | null, repliedAt: string | null, repliedByName: string | null, finalizedAt: string | null, finalizedByName: string | null, createdAt: string } };

export type ReplySupportRequestMutationVariables = Exact<{
  id: string | number;
  reply: string;
}>;


export type ReplySupportRequestMutation = { replySupportRequest: { id: string, protocol: number, userId: string, userName: string, condominiumName: string | null, category: SupportCategory, subject: string, message: string, status: SupportStatus, reply: string | null, repliedAt: string | null, repliedByName: string | null, finalizedAt: string | null, finalizedByName: string | null, createdAt: string } };

export type FinalizeSupportRequestMutationVariables = Exact<{
  id: string | number;
}>;


export type FinalizeSupportRequestMutation = { finalizeSupportRequest: { id: string, protocol: number, userId: string, userName: string, condominiumName: string | null, category: SupportCategory, subject: string, message: string, status: SupportStatus, reply: string | null, repliedAt: string | null, repliedByName: string | null, finalizedAt: string | null, finalizedByName: string | null, createdAt: string } };

export type SupportRankingQueryVariables = Exact<{
  year?: number | null | undefined;
}>;


export type SupportRankingQuery = { supportRanking: { year: number | null, supporters: number, totalCents: number, entries: Array<{ position: number, name: string | null, totalCents: number, contributions: number }> } };

export type SupportersQueryVariables = Exact<{ [key: string]: never; }>;


export type SupportersQuery = { supporters: Array<{ id: string, name: string, showName: boolean, totalCents: number, contributions: number, lastReceivedOn: string | null, history: Array<{ id: string, amountCents: number, receivedOn: string, note: string | null }> }> };

export type RecordSupportContributionMutationVariables = Exact<{
  input: RecordSupportContributionInput;
}>;


export type RecordSupportContributionMutation = { recordSupportContribution: { id: string } };

export type UpdateSupporterMutationVariables = Exact<{
  id: string | number;
  input: UpdateSupporterInput;
}>;


export type UpdateSupporterMutation = { updateSupporter: { id: string } };

export type DeleteSupporterMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteSupporterMutation = { deleteSupporter: boolean };

export type DeleteSupportContributionMutationVariables = Exact<{
  id: string | number;
}>;


export type DeleteSupportContributionMutation = { deleteSupportContribution: boolean };

export type SystemLogsQueryVariables = Exact<{
  filter?: SystemLogFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type SystemLogsQuery = { systemLogs: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, level: string, category: string, source: string, message: string, details: Record<string, unknown> | null, userId: string | null, userName: string | null, ip: string | null, statusCode: number | null, durationMs: number | null, environment: string, createdAt: string }> } };

export type SystemLogSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type SystemLogSummaryQuery = { systemLogSummary: Array<{ level: string, last24h: number, last7d: number }> };

export type ReportClientErrorMutationVariables = Exact<{
  message: string;
  url: string;
  digest?: string | null | undefined;
}>;


export type ReportClientErrorMutation = { reportClientError: boolean };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const UserAccountFieldsFragmentDoc = new TypedDocumentString(`
    fragment UserAccountFields on UserAccount {
  id
  name
  email
  username
  group
  active
  kind
  unitId
  unitLabel
  unitComplement
  employee {
    jobTitle
    hiredOn
    workShift
    contractor
  }
  phone
  birthDate
  photoUrl
  sharedAccount
  mustChangePassword
  lockedUntil
  locked
  lastLoginAt
  deactivatedAt
  createdAt
}
    `, {"fragmentName":"UserAccountFields"}) as unknown as TypedDocumentString<UserAccountFieldsFragment, unknown>;
export const BookingFieldsFragmentDoc = new TypedDocumentString(`
    fragment BookingFields on Booking {
  id
  spaceId
  spaceName
  spaceKind
  guestsAllowed
  userId
  userName
  unitLabel
  startsAt
  endsAt
  status
  notes
  cancelUntil
  reason
  decidedAt
  cancelledAt
  cancelledByManager
  feeCents
  feeBilledAt
  seriesId
  createdAt
}
    `, {"fragmentName":"BookingFields"}) as unknown as TypedDocumentString<BookingFieldsFragment, unknown>;
export const BookingGuestFieldsFragmentDoc = new TypedDocumentString(`
    fragment BookingGuestFields on BookingGuest {
  id
  bookingId
  name
  documentType
  document
  phone
  code
  checkedInAt
  createdAt
}
    `, {"fragmentName":"BookingGuestFields"}) as unknown as TypedDocumentString<BookingGuestFieldsFragment, unknown>;
export const GateGuestFieldsFragmentDoc = new TypedDocumentString(`
    fragment GateGuestFields on GateGuest {
  id
  bookingId
  name
  documentType
  document
  phone
  code
  checkedInAt
  spaceName
  startsAt
  endsAt
  hostName
  unitLabel
  checkInWindow
}
    `, {"fragmentName":"GateGuestFields"}) as unknown as TypedDocumentString<GateGuestFieldsFragment, unknown>;
export const BroadcastFieldsFragmentDoc = new TypedDocumentString(`
    fragment BroadcastFields on Broadcast {
  id
  title
  body
  audience
  targetGroup
  sendEmail
  recipients
  authorName
  createdAt
}
    `, {"fragmentName":"BroadcastFields"}) as unknown as TypedDocumentString<BroadcastFieldsFragment, unknown>;
export const CondominiumFieldsFragmentDoc = new TypedDocumentString(`
    fragment CondominiumFields on Condominium {
  id
  name
  document
  city
  state
  status
  addressFormat
  modules
  activeMembers
  managers
  units
  pendingEnrollments
  lastActivityAt
  createdAt
}
    `, {"fragmentName":"CondominiumFields"}) as unknown as TypedDocumentString<CondominiumFieldsFragment, unknown>;
export const UnitFieldsFragmentDoc = new TypedDocumentString(`
    fragment UnitFields on Unit {
  id
  street
  block
  number
  label
  residents
}
    `, {"fragmentName":"UnitFields"}) as unknown as TypedDocumentString<UnitFieldsFragment, unknown>;
export const DependentFieldsFragmentDoc = new TypedDocumentString(`
    fragment DependentFields on Dependent {
  id
  name
  birthDate
  relationship
  status
  holderName
  unitLabel
  rejectReason
  reviewedAt
  createdAt
  documentUrl
  documentContentType
}
    `, {"fragmentName":"DependentFields"}) as unknown as TypedDocumentString<DependentFieldsFragment, unknown>;
export const EnrollmentInviteFieldsFragmentDoc = new TypedDocumentString(`
    fragment EnrollmentInviteFields on EnrollmentInvite {
  id
  code
  label
  expiresAt
  revokedAt
  createdAt
  requestCount
}
    `, {"fragmentName":"EnrollmentInviteFields"}) as unknown as TypedDocumentString<EnrollmentInviteFieldsFragment, unknown>;
export const EnrollmentRequestFieldsFragmentDoc = new TypedDocumentString(`
    fragment EnrollmentRequestFields on EnrollmentRequest {
  id
  status
  applicant
  fullName
  email
  phone
  birthDate
  unitId
  unitLabel
  unitComplement
  typedUnitLabel
  typedUnitBlock
  typedUnitNumber
  typedUnitStreet
  createdAt
  reviewedAt
  rejectionReason
  userId
  photoUrl
}
    `, {"fragmentName":"EnrollmentRequestFields"}) as unknown as TypedDocumentString<EnrollmentRequestFieldsFragment, unknown>;
export const EventFieldsFragmentDoc = new TypedDocumentString(`
    fragment EventFields on Event {
  id
  title
  description
  spaceId
  spaceName
  location
  address {
    zip
    street
    number
    complement
    district
    city
    state
  }
  startsAt
  endsAt
  capacity
  externalGuestLimit
  ticketed
  fullPriceCents
  ticketTypes {
    id
    kind
    name
    priceMode
    customPriceCents
    priceCents
    minAge
    maxAge
  }
  unitTicketLimit
  salesClose
  salesCloseHours
  salesClosesAt
  pixSource
  customPix {
    keyType
    key
    name
    city
  }
  placesLeft
  outsidePlacesLeft
  status
  cancelReason
  publishedAt
  cancelledAt
  createdAt
}
    `, {"fragmentName":"EventFields"}) as unknown as TypedDocumentString<EventFieldsFragment, unknown>;
export const EventOrderFieldsFragmentDoc = new TypedDocumentString(`
    fragment EventOrderFields on EventOrder {
  id
  eventId
  eventTitle
  code
  status
  totalCents
  buyerId
  buyerName
  unitId
  unitLabel
  attendees {
    id
    source
    dependentId
    name
    age
    outside
    ticketName
    priceCents
    needsProof
    proofUrl
    proofContentType
    ticketCode
    checkedInAt
  }
  pix {
    keyType
    key
    name
    city
  }
  pixCode
  expiresAt
  receiptSentAt
  receiptContentType
  receiptUrl
  reviewedAt
  rejectReason
  cancelledAt
  createdAt
}
    `, {"fragmentName":"EventOrderFields"}) as unknown as TypedDocumentString<EventOrderFieldsFragment, unknown>;
export const GateEventTicketFieldsFragmentDoc = new TypedDocumentString(`
    fragment GateEventTicketFields on GateEventTicket {
  id
  name
  age
  outside
  source
  ticketName
  ticketCode
  checkedInAt
  entryWindow
  eventId
  eventTitle
  eventStatus
  startsAt
  endsAt
  placeName
  orderCode
  buyerName
  unitId
  unitLabel
}
    `, {"fragmentName":"GateEventTicketFields"}) as unknown as TypedDocumentString<GateEventTicketFieldsFragment, unknown>;
export const FoundItemFieldsFragmentDoc = new TypedDocumentString(`
    fragment FoundItemFields on FoundItem {
  id
  category
  title
  description
  foundLocation
  foundAt
  storageLocation
  photoHidden
  status
  registeredByName
  keepUntil
  closedAt
  closedByName
  closeReason
  returnedToName
  signerName
  pendingClaims
  awaitedByName
  photoUrl
  ownerUnitLabel
  ownerName
}
    `, {"fragmentName":"FoundItemFields"}) as unknown as TypedDocumentString<FoundItemFieldsFragment, unknown>;
export const FoundItemClaimFieldsFragmentDoc = new TypedDocumentString(`
    fragment FoundItemClaimFields on FoundItemClaim {
  id
  itemId
  itemTitle
  itemStatus
  itemCategory
  userId
  userName
  unitLabel
  message
  status
  createdAt
  decidedAt
  decidedByName
  decisionNote
}
    `, {"fragmentName":"FoundItemClaimFields"}) as unknown as TypedDocumentString<FoundItemClaimFieldsFragment, unknown>;
export const LostReportFieldsFragmentDoc = new TypedDocumentString(`
    fragment LostReportFields on LostReport {
  id
  userId
  userName
  unitId
  unitLabel
  category
  title
  description
  lostLocation
  lostOn
  photoUrl
  shared
  spotCount
  status
  foundItemId
  closedAt
  createdAt
}
    `, {"fragmentName":"LostReportFields"}) as unknown as TypedDocumentString<LostReportFieldsFragment, unknown>;
export const ParcelFieldsFragmentDoc = new TypedDocumentString(`
    fragment ParcelFields on Parcel {
  id
  unitId
  unitLabel
  recipientName
  recipientOnly
  carrier
  trackingCode
  notes
  storageLocation
  pickupCode
  perishable
  pickupDeadline
  authorizedName
  authorizedDocumentMasked
  authorizedByName
  authorizedAt
  status
  receivedAt
  receivedByName
  closedAt
  closedByName
  closeReason
  signerName
  photoUrl
}
    `, {"fragmentName":"ParcelFields"}) as unknown as TypedDocumentString<ParcelFieldsFragment, unknown>;
export const SpaceFieldsFragmentDoc = new TypedDocumentString(`
    fragment SpaceFields on Space {
  id
  name
  kind
  description
  capacity
  usageRules
  active
  photos {
    id
    url
  }
  createdAt
  updatedAt
  rules {
    openingHours {
      weekday
      opensAt
      closesAt
    }
    slotMinutes
    minAdvanceHours
    maxAdvanceDays
    unitLimit {
      count
      period
    }
    requiresApproval
    cancelUntilHours
    feeCents
    guests {
      allowed
      max
      documentRequired
    }
    recurringAllowed
  }
}
    `, {"fragmentName":"SpaceFields"}) as unknown as TypedDocumentString<SpaceFieldsFragment, unknown>;
export const SupportRequestFieldsFragmentDoc = new TypedDocumentString(`
    fragment SupportRequestFields on SupportRequest {
  id
  protocol
  userId
  userName
  condominiumName
  category
  subject
  message
  status
  reply
  repliedAt
  repliedByName
  finalizedAt
  finalizedByName
  createdAt
}
    `, {"fragmentName":"SupportRequestFields"}) as unknown as TypedDocumentString<SupportRequestFieldsFragment, unknown>;
export const MemberFilterOptionsDocument = new TypedDocumentString(`
    query MemberFilterOptions($kind: MemberKind!) {
  memberFilterOptions(kind: $kind) {
    id
    name
    email
    phone
  }
}
    `) as unknown as TypedDocumentString<MemberFilterOptionsQuery, MemberFilterOptionsQueryVariables>;
export const UsersDocument = new TypedDocumentString(`
    query Users($filter: UserFilterInput, $page: PageInput) {
  users(filter: $filter, page: $page) {
    total
    page
    limit
    totalPages
    items {
      ...UserAccountFields
    }
  }
}
    fragment UserAccountFields on UserAccount {
  id
  name
  email
  username
  group
  active
  kind
  unitId
  unitLabel
  unitComplement
  employee {
    jobTitle
    hiredOn
    workShift
    contractor
  }
  phone
  birthDate
  photoUrl
  sharedAccount
  mustChangePassword
  lockedUntil
  locked
  lastLoginAt
  deactivatedAt
  createdAt
}`) as unknown as TypedDocumentString<UsersQuery, UsersQueryVariables>;
export const UserDocument = new TypedDocumentString(`
    query User($id: ID!) {
  user(id: $id) {
    ...UserAccountFields
  }
}
    fragment UserAccountFields on UserAccount {
  id
  name
  email
  username
  group
  active
  kind
  unitId
  unitLabel
  unitComplement
  employee {
    jobTitle
    hiredOn
    workShift
    contractor
  }
  phone
  birthDate
  photoUrl
  sharedAccount
  mustChangePassword
  lockedUntil
  locked
  lastLoginAt
  deactivatedAt
  createdAt
}`) as unknown as TypedDocumentString<UserQuery, UserQueryVariables>;
export const CreateUserDocument = new TypedDocumentString(`
    mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    temporaryPassword
    emailSent
    existingAccount
    user {
      ...UserAccountFields
    }
  }
}
    fragment UserAccountFields on UserAccount {
  id
  name
  email
  username
  group
  active
  kind
  unitId
  unitLabel
  unitComplement
  employee {
    jobTitle
    hiredOn
    workShift
    contractor
  }
  phone
  birthDate
  photoUrl
  sharedAccount
  mustChangePassword
  lockedUntil
  locked
  lastLoginAt
  deactivatedAt
  createdAt
}`) as unknown as TypedDocumentString<CreateUserMutation, CreateUserMutationVariables>;
export const UpdateUserDocument = new TypedDocumentString(`
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    ...UserAccountFields
  }
}
    fragment UserAccountFields on UserAccount {
  id
  name
  email
  username
  group
  active
  kind
  unitId
  unitLabel
  unitComplement
  employee {
    jobTitle
    hiredOn
    workShift
    contractor
  }
  phone
  birthDate
  photoUrl
  sharedAccount
  mustChangePassword
  lockedUntil
  locked
  lastLoginAt
  deactivatedAt
  createdAt
}`) as unknown as TypedDocumentString<UpdateUserMutation, UpdateUserMutationVariables>;
export const SetUserActiveDocument = new TypedDocumentString(`
    mutation SetUserActive($id: ID!, $active: Boolean!) {
  setUserActive(id: $id, active: $active) {
    ...UserAccountFields
  }
}
    fragment UserAccountFields on UserAccount {
  id
  name
  email
  username
  group
  active
  kind
  unitId
  unitLabel
  unitComplement
  employee {
    jobTitle
    hiredOn
    workShift
    contractor
  }
  phone
  birthDate
  photoUrl
  sharedAccount
  mustChangePassword
  lockedUntil
  locked
  lastLoginAt
  deactivatedAt
  createdAt
}`) as unknown as TypedDocumentString<SetUserActiveMutation, SetUserActiveMutationVariables>;
export const ResetUserPasswordDocument = new TypedDocumentString(`
    mutation ResetUserPassword($id: ID!) {
  resetUserPassword(id: $id) {
    temporaryPassword
    emailSent
    user {
      ...UserAccountFields
    }
  }
}
    fragment UserAccountFields on UserAccount {
  id
  name
  email
  username
  group
  active
  kind
  unitId
  unitLabel
  unitComplement
  employee {
    jobTitle
    hiredOn
    workShift
    contractor
  }
  phone
  birthDate
  photoUrl
  sharedAccount
  mustChangePassword
  lockedUntil
  locked
  lastLoginAt
  deactivatedAt
  createdAt
}`) as unknown as TypedDocumentString<ResetUserPasswordMutation, ResetUserPasswordMutationVariables>;
export const UnlockUserDocument = new TypedDocumentString(`
    mutation UnlockUser($id: ID!) {
  unlockUser(id: $id) {
    ...UserAccountFields
  }
}
    fragment UserAccountFields on UserAccount {
  id
  name
  email
  username
  group
  active
  kind
  unitId
  unitLabel
  unitComplement
  employee {
    jobTitle
    hiredOn
    workShift
    contractor
  }
  phone
  birthDate
  photoUrl
  sharedAccount
  mustChangePassword
  lockedUntil
  locked
  lastLoginAt
  deactivatedAt
  createdAt
}`) as unknown as TypedDocumentString<UnlockUserMutation, UnlockUserMutationVariables>;
export const RevokeUserSessionsDocument = new TypedDocumentString(`
    mutation RevokeUserSessions($id: ID!) {
  revokeUserSessions(id: $id) {
    ...UserAccountFields
  }
}
    fragment UserAccountFields on UserAccount {
  id
  name
  email
  username
  group
  active
  kind
  unitId
  unitLabel
  unitComplement
  employee {
    jobTitle
    hiredOn
    workShift
    contractor
  }
  phone
  birthDate
  photoUrl
  sharedAccount
  mustChangePassword
  lockedUntil
  locked
  lastLoginAt
  deactivatedAt
  createdAt
}`) as unknown as TypedDocumentString<RevokeUserSessionsMutation, RevokeUserSessionsMutationVariables>;
export const UserPermissionsDocument = new TypedDocumentString(`
    query UserPermissions($id: ID!) {
  userPermissions(id: $id) {
    effective
    defaults
    overrides {
      permission
      allowed
    }
  }
}
    `) as unknown as TypedDocumentString<UserPermissionsQuery, UserPermissionsQueryVariables>;
export const SetUserPermissionsDocument = new TypedDocumentString(`
    mutation SetUserPermissions($input: SetUserPermissionsInput!) {
  setUserPermissions(input: $input) {
    effective
    defaults
    overrides {
      permission
      allowed
    }
  }
}
    `) as unknown as TypedDocumentString<SetUserPermissionsMutation, SetUserPermissionsMutationVariables>;
export const RecordStampDocument = new TypedDocumentString(`
    query RecordStamp($entity: String!, $id: ID!) {
  recordStamp(entity: $entity, id: $id) {
    createdAt
    createdByName
    updatedAt
    updatedByName
  }
}
    `) as unknown as TypedDocumentString<RecordStampQuery, RecordStampQueryVariables>;
export const MemberStatsDocument = new TypedDocumentString(`
    query MemberStats($kind: MemberKind!) {
  memberStats(kind: $kind) {
    total
    active
    inactive
    neverSignedIn
  }
}
    `) as unknown as TypedDocumentString<MemberStatsQuery, MemberStatsQueryVariables>;
export const AppInfoDocument = new TypedDocumentString(`
    query AppInfo {
  appInfo {
    version
    commit
    deployedAt
  }
}
    `) as unknown as TypedDocumentString<AppInfoQuery, AppInfoQueryVariables>;
export const LoginDocument = new TypedDocumentString(`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    accessTokenExpiresAt
    refreshToken
    refreshTokenExpiresAt
    user {
      id
      name
      username
      email
      group
      mustChangePassword
      permissions
      photoUrl
      phone
      birthDate
      onboardingCompleted
      platformAdmin
      member
      condominium {
        id
        name
        city
        state
        status
        addressFormat
        modules
      }
      condominiums {
        id
        name
        city
        state
        role
      }
    }
  }
}
    `) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const RefreshSessionDocument = new TypedDocumentString(`
    mutation RefreshSession($refreshToken: String!) {
  refreshSessionTokens(refreshToken: $refreshToken) {
    accessToken
    accessTokenExpiresAt
    refreshToken
    refreshTokenExpiresAt
  }
}
    `) as unknown as TypedDocumentString<RefreshSessionMutation, RefreshSessionMutationVariables>;
export const LogoutDocument = new TypedDocumentString(`
    mutation Logout {
  logout
}
    `) as unknown as TypedDocumentString<LogoutMutation, LogoutMutationVariables>;
export const MeDocument = new TypedDocumentString(`
    query Me {
  me {
    id
    name
    username
    email
    group
    mustChangePassword
    permissions
    photoUrl
    phone
    birthDate
    onboardingCompleted
    platformAdmin
    member
    condominium {
      id
      name
      city
      state
      status
      addressFormat
      modules
    }
    condominiums {
      id
      name
      city
      state
      role
    }
  }
}
    `) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const CompleteOnboardingDocument = new TypedDocumentString(`
    mutation CompleteOnboarding {
  completeOnboarding
}
    `) as unknown as TypedDocumentString<CompleteOnboardingMutation, CompleteOnboardingMutationVariables>;
export const ChangeMyPasswordDocument = new TypedDocumentString(`
    mutation ChangeMyPassword($input: ChangePasswordInput!) {
  changeMyPassword(input: $input)
}
    `) as unknown as TypedDocumentString<ChangeMyPasswordMutation, ChangeMyPasswordMutationVariables>;
export const UpdateMyProfileDocument = new TypedDocumentString(`
    mutation UpdateMyProfile($input: UpdateMyProfileInput!) {
  updateMyProfile(input: $input) {
    id
    name
    username
    email
    group
    mustChangePassword
    permissions
    photoUrl
    phone
    birthDate
    onboardingCompleted
    platformAdmin
    member
    condominium {
      id
      name
      city
      state
      status
      addressFormat
      modules
    }
    condominiums {
      id
      name
      city
      state
      role
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateMyProfileMutation, UpdateMyProfileMutationVariables>;
export const SetMyPhotoDocument = new TypedDocumentString(`
    mutation SetMyPhoto($photo: String!) {
  setMyPhoto(photo: $photo)
}
    `) as unknown as TypedDocumentString<SetMyPhotoMutation, SetMyPhotoMutationVariables>;
export const RemoveMyPhotoDocument = new TypedDocumentString(`
    mutation RemoveMyPhoto {
  removeMyPhoto
}
    `) as unknown as TypedDocumentString<RemoveMyPhotoMutation, RemoveMyPhotoMutationVariables>;
export const RequestPasswordRecoveryDocument = new TypedDocumentString(`
    mutation RequestPasswordRecovery($login: String!) {
  requestPasswordRecovery(login: $login)
}
    `) as unknown as TypedDocumentString<RequestPasswordRecoveryMutation, RequestPasswordRecoveryMutationVariables>;
export const VerifyPasswordRecoveryCodeDocument = new TypedDocumentString(`
    mutation VerifyPasswordRecoveryCode($input: VerifyRecoveryCodeInput!) {
  verifyPasswordRecoveryCode(input: $input)
}
    `) as unknown as TypedDocumentString<VerifyPasswordRecoveryCodeMutation, VerifyPasswordRecoveryCodeMutationVariables>;
export const ResetPasswordWithRecoveryDocument = new TypedDocumentString(`
    mutation ResetPasswordWithRecovery($input: ResetPasswordInput!) {
  resetPasswordWithRecovery(input: $input)
}
    `) as unknown as TypedDocumentString<ResetPasswordWithRecoveryMutation, ResetPasswordWithRecoveryMutationVariables>;
export const SwitchCondominiumDocument = new TypedDocumentString(`
    mutation SwitchCondominium($condominiumId: ID) {
  switchCondominium(condominiumId: $condominiumId)
}
    `) as unknown as TypedDocumentString<SwitchCondominiumMutation, SwitchCondominiumMutationVariables>;
export const MyBookingsDocument = new TypedDocumentString(`
    query MyBookings($when: BookingWhen!, $page: PageInput) {
  myBookings(when: $when, page: $page) {
    total
    page
    limit
    totalPages
    items {
      ...BookingFields
    }
  }
}
    fragment BookingFields on Booking {
  id
  spaceId
  spaceName
  spaceKind
  guestsAllowed
  userId
  userName
  unitLabel
  startsAt
  endsAt
  status
  notes
  cancelUntil
  reason
  decidedAt
  cancelledAt
  cancelledByManager
  feeCents
  feeBilledAt
  seriesId
  createdAt
}`) as unknown as TypedDocumentString<MyBookingsQuery, MyBookingsQueryVariables>;
export const BookingsDocument = new TypedDocumentString(`
    query Bookings($filter: BookingFilterInput, $page: PageInput) {
  bookings(filter: $filter, page: $page) {
    total
    page
    limit
    totalPages
    items {
      ...BookingFields
    }
  }
}
    fragment BookingFields on Booking {
  id
  spaceId
  spaceName
  spaceKind
  guestsAllowed
  userId
  userName
  unitLabel
  startsAt
  endsAt
  status
  notes
  cancelUntil
  reason
  decidedAt
  cancelledAt
  cancelledByManager
  feeCents
  feeBilledAt
  seriesId
  createdAt
}`) as unknown as TypedDocumentString<BookingsQuery, BookingsQueryVariables>;
export const SpaceAvailabilityDocument = new TypedDocumentString(`
    query SpaceAvailability($spaceId: ID!, $date: String!) {
  spaceAvailability(spaceId: $spaceId, date: $date) {
    spaceId
    date
    firstDate
    lastDate
    slots {
      startsAt
      endsAt
      state
      bookingId
      bookingStatus
      label
      waitlisted
    }
  }
}
    `) as unknown as TypedDocumentString<SpaceAvailabilityQuery, SpaceAvailabilityQueryVariables>;
export const CreateBookingDocument = new TypedDocumentString(`
    mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    ...BookingFields
  }
}
    fragment BookingFields on Booking {
  id
  spaceId
  spaceName
  spaceKind
  guestsAllowed
  userId
  userName
  unitLabel
  startsAt
  endsAt
  status
  notes
  cancelUntil
  reason
  decidedAt
  cancelledAt
  cancelledByManager
  feeCents
  feeBilledAt
  seriesId
  createdAt
}`) as unknown as TypedDocumentString<CreateBookingMutation, CreateBookingMutationVariables>;
export const CancelBookingDocument = new TypedDocumentString(`
    mutation CancelBooking($id: ID!, $reason: String) {
  cancelBooking(id: $id, reason: $reason) {
    ...BookingFields
  }
}
    fragment BookingFields on Booking {
  id
  spaceId
  spaceName
  spaceKind
  guestsAllowed
  userId
  userName
  unitLabel
  startsAt
  endsAt
  status
  notes
  cancelUntil
  reason
  decidedAt
  cancelledAt
  cancelledByManager
  feeCents
  feeBilledAt
  seriesId
  createdAt
}`) as unknown as TypedDocumentString<CancelBookingMutation, CancelBookingMutationVariables>;
export const ApproveBookingDocument = new TypedDocumentString(`
    mutation ApproveBooking($id: ID!) {
  approveBooking(id: $id) {
    ...BookingFields
  }
}
    fragment BookingFields on Booking {
  id
  spaceId
  spaceName
  spaceKind
  guestsAllowed
  userId
  userName
  unitLabel
  startsAt
  endsAt
  status
  notes
  cancelUntil
  reason
  decidedAt
  cancelledAt
  cancelledByManager
  feeCents
  feeBilledAt
  seriesId
  createdAt
}`) as unknown as TypedDocumentString<ApproveBookingMutation, ApproveBookingMutationVariables>;
export const RejectBookingDocument = new TypedDocumentString(`
    mutation RejectBooking($id: ID!, $reason: String!) {
  rejectBooking(id: $id, reason: $reason) {
    ...BookingFields
  }
}
    fragment BookingFields on Booking {
  id
  spaceId
  spaceName
  spaceKind
  guestsAllowed
  userId
  userName
  unitLabel
  startsAt
  endsAt
  status
  notes
  cancelUntil
  reason
  decidedAt
  cancelledAt
  cancelledByManager
  feeCents
  feeBilledAt
  seriesId
  createdAt
}`) as unknown as TypedDocumentString<RejectBookingMutation, RejectBookingMutationVariables>;
export const CondominiumSpaceBlocksDocument = new TypedDocumentString(`
    query CondominiumSpaceBlocks {
  condominiumSpaceBlocks {
    id
    spaceId
    startsAt
    endsAt
    reason
    createdByName
    createdAt
  }
}
    `) as unknown as TypedDocumentString<CondominiumSpaceBlocksQuery, CondominiumSpaceBlocksQueryVariables>;
export const SpaceBlocksDocument = new TypedDocumentString(`
    query SpaceBlocks($spaceId: ID!) {
  spaceBlocks(spaceId: $spaceId) {
    id
    spaceId
    startsAt
    endsAt
    reason
    createdByName
    createdAt
  }
}
    `) as unknown as TypedDocumentString<SpaceBlocksQuery, SpaceBlocksQueryVariables>;
export const CreateSpaceBlockDocument = new TypedDocumentString(`
    mutation CreateSpaceBlock($input: CreateSpaceBlockInput!) {
  createSpaceBlock(input: $input) {
    id
  }
}
    `) as unknown as TypedDocumentString<CreateSpaceBlockMutation, CreateSpaceBlockMutationVariables>;
export const DeleteSpaceBlockDocument = new TypedDocumentString(`
    mutation DeleteSpaceBlock($id: ID!) {
  deleteSpaceBlock(id: $id)
}
    `) as unknown as TypedDocumentString<DeleteSpaceBlockMutation, DeleteSpaceBlockMutationVariables>;
export const CreateBookingSeriesDocument = new TypedDocumentString(`
    mutation CreateBookingSeries($input: CreateBookingSeriesInput!) {
  createBookingSeries(input: $input) {
    seriesId
    created {
      ...BookingFields
    }
    skipped {
      startsAt
      reason
    }
  }
}
    fragment BookingFields on Booking {
  id
  spaceId
  spaceName
  spaceKind
  guestsAllowed
  userId
  userName
  unitLabel
  startsAt
  endsAt
  status
  notes
  cancelUntil
  reason
  decidedAt
  cancelledAt
  cancelledByManager
  feeCents
  feeBilledAt
  seriesId
  createdAt
}`) as unknown as TypedDocumentString<CreateBookingSeriesMutation, CreateBookingSeriesMutationVariables>;
export const CancelBookingSeriesDocument = new TypedDocumentString(`
    mutation CancelBookingSeries($seriesId: ID!) {
  cancelBookingSeries(seriesId: $seriesId) {
    cancelled
    kept
  }
}
    `) as unknown as TypedDocumentString<CancelBookingSeriesMutation, CancelBookingSeriesMutationVariables>;
export const JoinWaitlistDocument = new TypedDocumentString(`
    mutation JoinWaitlist($input: WaitlistSlotInput!) {
  joinWaitlist(input: $input)
}
    `) as unknown as TypedDocumentString<JoinWaitlistMutation, JoinWaitlistMutationVariables>;
export const LeaveWaitlistDocument = new TypedDocumentString(`
    mutation LeaveWaitlist($input: WaitlistSlotInput!) {
  leaveWaitlist(input: $input)
}
    `) as unknown as TypedDocumentString<LeaveWaitlistMutation, LeaveWaitlistMutationVariables>;
export const BookingGuestsDocument = new TypedDocumentString(`
    query BookingGuests($bookingId: ID!) {
  bookingGuests(bookingId: $bookingId) {
    ...BookingGuestFields
  }
}
    fragment BookingGuestFields on BookingGuest {
  id
  bookingId
  name
  documentType
  document
  phone
  code
  checkedInAt
  createdAt
}`) as unknown as TypedDocumentString<BookingGuestsQuery, BookingGuestsQueryVariables>;
export const AddBookingGuestsDocument = new TypedDocumentString(`
    mutation AddBookingGuests($input: AddBookingGuestsInput!) {
  addBookingGuests(input: $input) {
    ...BookingGuestFields
  }
}
    fragment BookingGuestFields on BookingGuest {
  id
  bookingId
  name
  documentType
  document
  phone
  code
  checkedInAt
  createdAt
}`) as unknown as TypedDocumentString<AddBookingGuestsMutation, AddBookingGuestsMutationVariables>;
export const RemoveBookingGuestDocument = new TypedDocumentString(`
    mutation RemoveBookingGuest($id: ID!) {
  removeBookingGuest(id: $id)
}
    `) as unknown as TypedDocumentString<RemoveBookingGuestMutation, RemoveBookingGuestMutationVariables>;
export const GuestInviteDocument = new TypedDocumentString(`
    query GuestInvite($code: String!) {
  guestInvite(code: $code) {
    code
    guestName
    hostFirstName
    spaceName
    condominiumName
    startsAt
    endsAt
    status
    checkedIn
  }
}
    `) as unknown as TypedDocumentString<GuestInviteQuery, GuestInviteQueryVariables>;
export const GateGuestsDocument = new TypedDocumentString(`
    query GateGuests($date: String) {
  gateGuests(date: $date) {
    ...GateGuestFields
  }
}
    fragment GateGuestFields on GateGuest {
  id
  bookingId
  name
  documentType
  document
  phone
  code
  checkedInAt
  spaceName
  startsAt
  endsAt
  hostName
  unitLabel
  checkInWindow
}`) as unknown as TypedDocumentString<GateGuestsQuery, GateGuestsQueryVariables>;
export const DayGuestsDocument = new TypedDocumentString(`
    query DayGuests($date: String, $filter: DayGuestFilterInput, $page: PageInput) {
  dayGuests(date: $date, filter: $filter, page: $page) {
    items {
      ...GateGuestFields
    }
    total
    page
    limit
    totalPages
  }
}
    fragment GateGuestFields on GateGuest {
  id
  bookingId
  name
  documentType
  document
  phone
  code
  checkedInAt
  spaceName
  startsAt
  endsAt
  hostName
  unitLabel
  checkInWindow
}`) as unknown as TypedDocumentString<DayGuestsQuery, DayGuestsQueryVariables>;
export const DayGuestsOverviewDocument = new TypedDocumentString(`
    query DayGuestsOverview($date: String) {
  dayGuestsOverview(date: $date) {
    total
    checkedIn
    bookings
    guests {
      id
      label
    }
    hosts {
      id
      label
    }
    units {
      id
      label
    }
    spaces {
      id
      label
    }
  }
}
    `) as unknown as TypedDocumentString<DayGuestsOverviewQuery, DayGuestsOverviewQueryVariables>;
export const CheckInGuestDocument = new TypedDocumentString(`
    mutation CheckInGuest($input: CheckInGuestInput!) {
  checkInGuest(input: $input) {
    ...GateGuestFields
  }
}
    fragment GateGuestFields on GateGuest {
  id
  bookingId
  name
  documentType
  document
  phone
  code
  checkedInAt
  spaceName
  startsAt
  endsAt
  hostName
  unitLabel
  checkInWindow
}`) as unknown as TypedDocumentString<CheckInGuestMutation, CheckInGuestMutationVariables>;
export const UndoGuestCheckInDocument = new TypedDocumentString(`
    mutation UndoGuestCheckIn($guestId: ID!) {
  undoGuestCheckIn(guestId: $guestId) {
    ...GateGuestFields
  }
}
    fragment GateGuestFields on GateGuest {
  id
  bookingId
  name
  documentType
  document
  phone
  code
  checkedInAt
  spaceName
  startsAt
  endsAt
  hostName
  unitLabel
  checkInWindow
}`) as unknown as TypedDocumentString<UndoGuestCheckInMutation, UndoGuestCheckInMutationVariables>;
export const BookingFeesDocument = new TypedDocumentString(`
    query BookingFees($month: String, $filter: FeeFilterInput) {
  bookingFees(month: $month, filter: $filter) {
    month
    totalCents
    billedCents
    items {
      ...BookingFields
    }
  }
}
    fragment BookingFields on Booking {
  id
  spaceId
  spaceName
  spaceKind
  guestsAllowed
  userId
  userName
  unitLabel
  startsAt
  endsAt
  status
  notes
  cancelUntil
  reason
  decidedAt
  cancelledAt
  cancelledByManager
  feeCents
  feeBilledAt
  seriesId
  createdAt
}`) as unknown as TypedDocumentString<BookingFeesQuery, BookingFeesQueryVariables>;
export const BookingFeesPageDocument = new TypedDocumentString(`
    query BookingFeesPage($month: String, $filter: FeeFilterInput, $page: PageInput) {
  bookingFeesPage(month: $month, filter: $filter, page: $page) {
    items {
      ...BookingFields
    }
    total
    page
    limit
    totalPages
  }
}
    fragment BookingFields on Booking {
  id
  spaceId
  spaceName
  spaceKind
  guestsAllowed
  userId
  userName
  unitLabel
  startsAt
  endsAt
  status
  notes
  cancelUntil
  reason
  decidedAt
  cancelledAt
  cancelledByManager
  feeCents
  feeBilledAt
  seriesId
  createdAt
}`) as unknown as TypedDocumentString<BookingFeesPageQuery, BookingFeesPageQueryVariables>;
export const BookingFeesOverviewDocument = new TypedDocumentString(`
    query BookingFeesOverview($month: String) {
  bookingFeesOverview(month: $month) {
    month
    count
    totalCents
    billedCents
    units {
      id
      label
    }
    spaces {
      id
      label
    }
    users {
      id
      label
    }
  }
}
    `) as unknown as TypedDocumentString<BookingFeesOverviewQuery, BookingFeesOverviewQueryVariables>;
export const SetBookingFeesBilledDocument = new TypedDocumentString(`
    mutation SetBookingFeesBilled($input: SetBookingFeesBilledInput!) {
  setBookingFeesBilled(input: $input)
}
    `) as unknown as TypedDocumentString<SetBookingFeesBilledMutation, SetBookingFeesBilledMutationVariables>;
export const BroadcastsDocument = new TypedDocumentString(`
    query Broadcasts {
  broadcasts {
    ...BroadcastFields
  }
}
    fragment BroadcastFields on Broadcast {
  id
  title
  body
  audience
  targetGroup
  sendEmail
  recipients
  authorName
  createdAt
}`) as unknown as TypedDocumentString<BroadcastsQuery, BroadcastsQueryVariables>;
export const SendBroadcastDocument = new TypedDocumentString(`
    mutation SendBroadcast($input: BroadcastInput!) {
  sendBroadcast(input: $input) {
    ...BroadcastFields
  }
}
    fragment BroadcastFields on Broadcast {
  id
  title
  body
  audience
  targetGroup
  sendEmail
  recipients
  authorName
  createdAt
}`) as unknown as TypedDocumentString<SendBroadcastMutation, SendBroadcastMutationVariables>;
export const BroadcastStatsDocument = new TypedDocumentString(`
    query BroadcastStats {
  broadcastStats {
    total
    recent
    withEmail
    recentRecipients
  }
}
    `) as unknown as TypedDocumentString<BroadcastStatsQuery, BroadcastStatsQueryVariables>;
export const CondominiumsDocument = new TypedDocumentString(`
    query Condominiums($filter: CondominiumFilterInput) {
  condominiums(filter: $filter) {
    ...CondominiumFields
  }
}
    fragment CondominiumFields on Condominium {
  id
  name
  document
  city
  state
  status
  addressFormat
  modules
  activeMembers
  managers
  units
  pendingEnrollments
  lastActivityAt
  createdAt
}`) as unknown as TypedDocumentString<CondominiumsQuery, CondominiumsQueryVariables>;
export const CreateCondominiumDocument = new TypedDocumentString(`
    mutation CreateCondominium($input: CondominiumInput!) {
  createCondominium(input: $input) {
    ...CondominiumFields
  }
}
    fragment CondominiumFields on Condominium {
  id
  name
  document
  city
  state
  status
  addressFormat
  modules
  activeMembers
  managers
  units
  pendingEnrollments
  lastActivityAt
  createdAt
}`) as unknown as TypedDocumentString<CreateCondominiumMutation, CreateCondominiumMutationVariables>;
export const UpdateCondominiumDocument = new TypedDocumentString(`
    mutation UpdateCondominium($id: ID!, $input: CondominiumInput!) {
  updateCondominium(id: $id, input: $input) {
    ...CondominiumFields
  }
}
    fragment CondominiumFields on Condominium {
  id
  name
  document
  city
  state
  status
  addressFormat
  modules
  activeMembers
  managers
  units
  pendingEnrollments
  lastActivityAt
  createdAt
}`) as unknown as TypedDocumentString<UpdateCondominiumMutation, UpdateCondominiumMutationVariables>;
export const SetCondominiumStatusDocument = new TypedDocumentString(`
    mutation SetCondominiumStatus($id: ID!, $status: CondominiumStatus!) {
  setCondominiumStatus(id: $id, status: $status) {
    ...CondominiumFields
  }
}
    fragment CondominiumFields on Condominium {
  id
  name
  document
  city
  state
  status
  addressFormat
  modules
  activeMembers
  managers
  units
  pendingEnrollments
  lastActivityAt
  createdAt
}`) as unknown as TypedDocumentString<SetCondominiumStatusMutation, SetCondominiumStatusMutationVariables>;
export const SetCondominiumModuleDocument = new TypedDocumentString(`
    mutation SetCondominiumModule($id: ID!, $module: AppModule!, $enabled: Boolean!) {
  setCondominiumModule(id: $id, module: $module, enabled: $enabled) {
    ...CondominiumFields
  }
}
    fragment CondominiumFields on Condominium {
  id
  name
  document
  city
  state
  status
  addressFormat
  modules
  activeMembers
  managers
  units
  pendingEnrollments
  lastActivityAt
  createdAt
}`) as unknown as TypedDocumentString<SetCondominiumModuleMutation, SetCondominiumModuleMutationVariables>;
export const UnitsDocument = new TypedDocumentString(`
    query Units {
  units {
    ...UnitFields
  }
}
    fragment UnitFields on Unit {
  id
  street
  block
  number
  label
  residents
}`) as unknown as TypedDocumentString<UnitsQuery, UnitsQueryVariables>;
export const CreateUnitsDocument = new TypedDocumentString(`
    mutation CreateUnits($input: CreateUnitsInput!) {
  createUnits(input: $input) {
    ...UnitFields
  }
}
    fragment UnitFields on Unit {
  id
  street
  block
  number
  label
  residents
}`) as unknown as TypedDocumentString<CreateUnitsMutation, CreateUnitsMutationVariables>;
export const UpdateUnitDocument = new TypedDocumentString(`
    mutation UpdateUnit($id: ID!, $input: UpdateUnitInput!) {
  updateUnit(id: $id, input: $input) {
    ...UnitFields
  }
}
    fragment UnitFields on Unit {
  id
  street
  block
  number
  label
  residents
}`) as unknown as TypedDocumentString<UpdateUnitMutation, UpdateUnitMutationVariables>;
export const DeleteUnitDocument = new TypedDocumentString(`
    mutation DeleteUnit($id: ID!) {
  deleteUnit(id: $id)
}
    `) as unknown as TypedDocumentString<DeleteUnitMutation, DeleteUnitMutationVariables>;
export const CondominiumDocument = new TypedDocumentString(`
    query Condominium($id: ID!) {
  condominium(id: $id) {
    ...CondominiumFields
  }
}
    fragment CondominiumFields on Condominium {
  id
  name
  document
  city
  state
  status
  addressFormat
  modules
  activeMembers
  managers
  units
  pendingEnrollments
  lastActivityAt
  createdAt
}`) as unknown as TypedDocumentString<CondominiumQuery, CondominiumQueryVariables>;
export const UnitPageDocument = new TypedDocumentString(`
    query UnitPage($filter: UnitFilterInput, $page: PageInput) {
  unitPage(filter: $filter, page: $page) {
    total
    page
    limit
    totalPages
    items {
      id
      street
      block
      number
      label
      residents
      people {
        userId
        name
        role
        email
        phone
        active
      }
    }
  }
}
    `) as unknown as TypedDocumentString<UnitPageQuery, UnitPageQueryVariables>;
export const DashboardDocument = new TypedDocumentString(`
    query Dashboard {
  dashboard {
    activeUsers
    pendingEnrollments
    units
    activeSpaces
    pendingBookings
    bookingsToday
    openSupportRequests
    failedNotifications
    parcels {
      waiting
      stuck
      perishableOverdue
      pickedUpLast30Days
      averagePickupHours
      monthly {
        month
        received
        pickedUp
      }
    }
    lostAndFound {
      kept
      pendingClaims
      expiringSoon
      openLostReports
      returnedLast90Days
      returnRate
      monthly {
        month
        found
        returned
      }
    }
  }
}
    `) as unknown as TypedDocumentString<DashboardQuery, DashboardQueryVariables>;
export const MyDependentsDocument = new TypedDocumentString(`
    query MyDependents {
  myDependents {
    ...DependentFields
  }
}
    fragment DependentFields on Dependent {
  id
  name
  birthDate
  relationship
  status
  holderName
  unitLabel
  rejectReason
  reviewedAt
  createdAt
  documentUrl
  documentContentType
}`) as unknown as TypedDocumentString<MyDependentsQuery, MyDependentsQueryVariables>;
export const AddDependentDocument = new TypedDocumentString(`
    mutation AddDependent($input: DependentInput!) {
  addDependent(input: $input) {
    ...DependentFields
  }
}
    fragment DependentFields on Dependent {
  id
  name
  birthDate
  relationship
  status
  holderName
  unitLabel
  rejectReason
  reviewedAt
  createdAt
  documentUrl
  documentContentType
}`) as unknown as TypedDocumentString<AddDependentMutation, AddDependentMutationVariables>;
export const RemoveDependentDocument = new TypedDocumentString(`
    mutation RemoveDependent($id: ID!) {
  removeDependent(id: $id)
}
    `) as unknown as TypedDocumentString<RemoveDependentMutation, RemoveDependentMutationVariables>;
export const ApproveDependentDocument = new TypedDocumentString(`
    mutation ApproveDependent($id: ID!) {
  approveDependent(id: $id) {
    ...DependentFields
  }
}
    fragment DependentFields on Dependent {
  id
  name
  birthDate
  relationship
  status
  holderName
  unitLabel
  rejectReason
  reviewedAt
  createdAt
  documentUrl
  documentContentType
}`) as unknown as TypedDocumentString<ApproveDependentMutation, ApproveDependentMutationVariables>;
export const RejectDependentDocument = new TypedDocumentString(`
    mutation RejectDependent($id: ID!, $reason: String!) {
  rejectDependent(id: $id, reason: $reason) {
    ...DependentFields
  }
}
    fragment DependentFields on Dependent {
  id
  name
  birthDate
  relationship
  status
  holderName
  unitLabel
  rejectReason
  reviewedAt
  createdAt
  documentUrl
  documentContentType
}`) as unknown as TypedDocumentString<RejectDependentMutation, RejectDependentMutationVariables>;
export const DependentsPageDocument = new TypedDocumentString(`
    query DependentsPage($filter: DependentReviewFilterInput, $page: PageInput) {
  dependentsPage(filter: $filter, page: $page) {
    total
    page
    limit
    totalPages
    items {
      ...DependentFields
    }
  }
}
    fragment DependentFields on Dependent {
  id
  name
  birthDate
  relationship
  status
  holderName
  unitLabel
  rejectReason
  reviewedAt
  createdAt
  documentUrl
  documentContentType
}`) as unknown as TypedDocumentString<DependentsPageQuery, DependentsPageQueryVariables>;
export const DependentsReviewOverviewDocument = new TypedDocumentString(`
    query DependentsReviewOverview {
  dependentsReviewOverview {
    pending
    approved
    rejected
    dependents {
      id
      label
    }
    holders {
      id
      label
    }
    units {
      id
      label
    }
  }
}
    `) as unknown as TypedDocumentString<DependentsReviewOverviewQuery, DependentsReviewOverviewQueryVariables>;
export const VerifyEnrollmentCodeDocument = new TypedDocumentString(`
    mutation VerifyEnrollmentCode($code: String!) {
  verifyEnrollmentCode(code: $code)
}
    `) as unknown as TypedDocumentString<VerifyEnrollmentCodeMutation, VerifyEnrollmentCodeMutationVariables>;
export const EnrollmentFormDocument = new TypedDocumentString(`
    query EnrollmentForm($formToken: String!) {
  enrollmentForm(formToken: $formToken) {
    condominiumName
    addressFormat
    units {
      id
      label
    }
  }
}
    `) as unknown as TypedDocumentString<EnrollmentFormQuery, EnrollmentFormQueryVariables>;
export const SubmitEnrollmentDocument = new TypedDocumentString(`
    mutation SubmitEnrollment($input: SubmitEnrollmentInput!) {
  submitEnrollment(input: $input)
}
    `) as unknown as TypedDocumentString<SubmitEnrollmentMutation, SubmitEnrollmentMutationVariables>;
export const EnrollmentInvitesDocument = new TypedDocumentString(`
    query EnrollmentInvites {
  enrollmentInvites {
    ...EnrollmentInviteFields
  }
}
    fragment EnrollmentInviteFields on EnrollmentInvite {
  id
  code
  label
  expiresAt
  revokedAt
  createdAt
  requestCount
}`) as unknown as TypedDocumentString<EnrollmentInvitesQuery, EnrollmentInvitesQueryVariables>;
export const CreateEnrollmentInviteDocument = new TypedDocumentString(`
    mutation CreateEnrollmentInvite($input: CreateEnrollmentInviteInput!) {
  createEnrollmentInvite(input: $input) {
    ...EnrollmentInviteFields
  }
}
    fragment EnrollmentInviteFields on EnrollmentInvite {
  id
  code
  label
  expiresAt
  revokedAt
  createdAt
  requestCount
}`) as unknown as TypedDocumentString<CreateEnrollmentInviteMutation, CreateEnrollmentInviteMutationVariables>;
export const RevokeEnrollmentInviteDocument = new TypedDocumentString(`
    mutation RevokeEnrollmentInvite($id: ID!) {
  revokeEnrollmentInvite(id: $id) {
    ...EnrollmentInviteFields
  }
}
    fragment EnrollmentInviteFields on EnrollmentInvite {
  id
  code
  label
  expiresAt
  revokedAt
  createdAt
  requestCount
}`) as unknown as TypedDocumentString<RevokeEnrollmentInviteMutation, RevokeEnrollmentInviteMutationVariables>;
export const EnrollmentRequestsDocument = new TypedDocumentString(`
    query EnrollmentRequests($filter: EnrollmentRequestFilterInput, $page: PageInput) {
  enrollmentRequests(filter: $filter, page: $page) {
    total
    page
    limit
    totalPages
    items {
      ...EnrollmentRequestFields
    }
  }
  pendingEnrollmentCount
}
    fragment EnrollmentRequestFields on EnrollmentRequest {
  id
  status
  applicant
  fullName
  email
  phone
  birthDate
  unitId
  unitLabel
  unitComplement
  typedUnitLabel
  typedUnitBlock
  typedUnitNumber
  typedUnitStreet
  createdAt
  reviewedAt
  rejectionReason
  userId
  photoUrl
}`) as unknown as TypedDocumentString<EnrollmentRequestsQuery, EnrollmentRequestsQueryVariables>;
export const ApproveEnrollmentRequestDocument = new TypedDocumentString(`
    mutation ApproveEnrollmentRequest($id: ID!, $data: EnrollmentDataInput!, $group: UserGroup!) {
  approveEnrollmentRequest(id: $id, data: $data, group: $group) {
    request {
      ...EnrollmentRequestFields
    }
    access {
      temporaryPassword
      emailSent
      existingAccount
      user {
        ...UserAccountFields
      }
    }
  }
}
    fragment UserAccountFields on UserAccount {
  id
  name
  email
  username
  group
  active
  kind
  unitId
  unitLabel
  unitComplement
  employee {
    jobTitle
    hiredOn
    workShift
    contractor
  }
  phone
  birthDate
  photoUrl
  sharedAccount
  mustChangePassword
  lockedUntil
  locked
  lastLoginAt
  deactivatedAt
  createdAt
}
fragment EnrollmentRequestFields on EnrollmentRequest {
  id
  status
  applicant
  fullName
  email
  phone
  birthDate
  unitId
  unitLabel
  unitComplement
  typedUnitLabel
  typedUnitBlock
  typedUnitNumber
  typedUnitStreet
  createdAt
  reviewedAt
  rejectionReason
  userId
  photoUrl
}`) as unknown as TypedDocumentString<ApproveEnrollmentRequestMutation, ApproveEnrollmentRequestMutationVariables>;
export const RejectEnrollmentRequestDocument = new TypedDocumentString(`
    mutation RejectEnrollmentRequest($id: ID!, $reason: String!) {
  rejectEnrollmentRequest(id: $id, reason: $reason) {
    ...EnrollmentRequestFields
  }
}
    fragment EnrollmentRequestFields on EnrollmentRequest {
  id
  status
  applicant
  fullName
  email
  phone
  birthDate
  unitId
  unitLabel
  unitComplement
  typedUnitLabel
  typedUnitBlock
  typedUnitNumber
  typedUnitStreet
  createdAt
  reviewedAt
  rejectionReason
  userId
  photoUrl
}`) as unknown as TypedDocumentString<RejectEnrollmentRequestMutation, RejectEnrollmentRequestMutationVariables>;
export const EnrollmentRequestFilterOptionsDocument = new TypedDocumentString(`
    query EnrollmentRequestFilterOptions {
  enrollmentRequestFilterOptions {
    id
    name
    email
  }
}
    `) as unknown as TypedDocumentString<EnrollmentRequestFilterOptionsQuery, EnrollmentRequestFilterOptionsQueryVariables>;
export const EventsDocument = new TypedDocumentString(`
    query Events($when: EventWhen) {
  events(when: $when) {
    ...EventFields
  }
}
    fragment EventFields on Event {
  id
  title
  description
  spaceId
  spaceName
  location
  address {
    zip
    street
    number
    complement
    district
    city
    state
  }
  startsAt
  endsAt
  capacity
  externalGuestLimit
  ticketed
  fullPriceCents
  ticketTypes {
    id
    kind
    name
    priceMode
    customPriceCents
    priceCents
    minAge
    maxAge
  }
  unitTicketLimit
  salesClose
  salesCloseHours
  salesClosesAt
  pixSource
  customPix {
    keyType
    key
    name
    city
  }
  placesLeft
  outsidePlacesLeft
  status
  cancelReason
  publishedAt
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<EventsQuery, EventsQueryVariables>;
export const EventDocument = new TypedDocumentString(`
    query Event($id: ID!) {
  event(id: $id) {
    ...EventFields
  }
}
    fragment EventFields on Event {
  id
  title
  description
  spaceId
  spaceName
  location
  address {
    zip
    street
    number
    complement
    district
    city
    state
  }
  startsAt
  endsAt
  capacity
  externalGuestLimit
  ticketed
  fullPriceCents
  ticketTypes {
    id
    kind
    name
    priceMode
    customPriceCents
    priceCents
    minAge
    maxAge
  }
  unitTicketLimit
  salesClose
  salesCloseHours
  salesClosesAt
  pixSource
  customPix {
    keyType
    key
    name
    city
  }
  placesLeft
  outsidePlacesLeft
  status
  cancelReason
  publishedAt
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<EventQuery, EventQueryVariables>;
export const CreateEventDocument = new TypedDocumentString(`
    mutation CreateEvent($input: EventInput!) {
  createEvent(input: $input) {
    ...EventFields
  }
}
    fragment EventFields on Event {
  id
  title
  description
  spaceId
  spaceName
  location
  address {
    zip
    street
    number
    complement
    district
    city
    state
  }
  startsAt
  endsAt
  capacity
  externalGuestLimit
  ticketed
  fullPriceCents
  ticketTypes {
    id
    kind
    name
    priceMode
    customPriceCents
    priceCents
    minAge
    maxAge
  }
  unitTicketLimit
  salesClose
  salesCloseHours
  salesClosesAt
  pixSource
  customPix {
    keyType
    key
    name
    city
  }
  placesLeft
  outsidePlacesLeft
  status
  cancelReason
  publishedAt
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<CreateEventMutation, CreateEventMutationVariables>;
export const UpdateEventDocument = new TypedDocumentString(`
    mutation UpdateEvent($id: ID!, $input: EventInput!) {
  updateEvent(id: $id, input: $input) {
    ...EventFields
  }
}
    fragment EventFields on Event {
  id
  title
  description
  spaceId
  spaceName
  location
  address {
    zip
    street
    number
    complement
    district
    city
    state
  }
  startsAt
  endsAt
  capacity
  externalGuestLimit
  ticketed
  fullPriceCents
  ticketTypes {
    id
    kind
    name
    priceMode
    customPriceCents
    priceCents
    minAge
    maxAge
  }
  unitTicketLimit
  salesClose
  salesCloseHours
  salesClosesAt
  pixSource
  customPix {
    keyType
    key
    name
    city
  }
  placesLeft
  outsidePlacesLeft
  status
  cancelReason
  publishedAt
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<UpdateEventMutation, UpdateEventMutationVariables>;
export const PublishEventDocument = new TypedDocumentString(`
    mutation PublishEvent($id: ID!) {
  publishEvent(id: $id) {
    ...EventFields
  }
}
    fragment EventFields on Event {
  id
  title
  description
  spaceId
  spaceName
  location
  address {
    zip
    street
    number
    complement
    district
    city
    state
  }
  startsAt
  endsAt
  capacity
  externalGuestLimit
  ticketed
  fullPriceCents
  ticketTypes {
    id
    kind
    name
    priceMode
    customPriceCents
    priceCents
    minAge
    maxAge
  }
  unitTicketLimit
  salesClose
  salesCloseHours
  salesClosesAt
  pixSource
  customPix {
    keyType
    key
    name
    city
  }
  placesLeft
  outsidePlacesLeft
  status
  cancelReason
  publishedAt
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<PublishEventMutation, PublishEventMutationVariables>;
export const CancelEventDocument = new TypedDocumentString(`
    mutation CancelEvent($id: ID!, $reason: String!) {
  cancelEvent(id: $id, reason: $reason) {
    ...EventFields
  }
}
    fragment EventFields on Event {
  id
  title
  description
  spaceId
  spaceName
  location
  address {
    zip
    street
    number
    complement
    district
    city
    state
  }
  startsAt
  endsAt
  capacity
  externalGuestLimit
  ticketed
  fullPriceCents
  ticketTypes {
    id
    kind
    name
    priceMode
    customPriceCents
    priceCents
    minAge
    maxAge
  }
  unitTicketLimit
  salesClose
  salesCloseHours
  salesClosesAt
  pixSource
  customPix {
    keyType
    key
    name
    city
  }
  placesLeft
  outsidePlacesLeft
  status
  cancelReason
  publishedAt
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<CancelEventMutation, CancelEventMutationVariables>;
export const MyEventOrdersDocument = new TypedDocumentString(`
    query MyEventOrders($eventId: ID!) {
  myEventOrders(eventId: $eventId) {
    ...EventOrderFields
  }
}
    fragment EventOrderFields on EventOrder {
  id
  eventId
  eventTitle
  code
  status
  totalCents
  buyerId
  buyerName
  unitId
  unitLabel
  attendees {
    id
    source
    dependentId
    name
    age
    outside
    ticketName
    priceCents
    needsProof
    proofUrl
    proofContentType
    ticketCode
    checkedInAt
  }
  pix {
    keyType
    key
    name
    city
  }
  pixCode
  expiresAt
  receiptSentAt
  receiptContentType
  receiptUrl
  reviewedAt
  rejectReason
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<MyEventOrdersQuery, MyEventOrdersQueryVariables>;
export const EventOrdersDocument = new TypedDocumentString(`
    query EventOrders($eventId: ID!, $filter: EventOrderFilterInput, $page: PageInput) {
  eventOrders(eventId: $eventId, filter: $filter, page: $page) {
    total
    page
    limit
    totalPages
    items {
      ...EventOrderFields
    }
  }
}
    fragment EventOrderFields on EventOrder {
  id
  eventId
  eventTitle
  code
  status
  totalCents
  buyerId
  buyerName
  unitId
  unitLabel
  attendees {
    id
    source
    dependentId
    name
    age
    outside
    ticketName
    priceCents
    needsProof
    proofUrl
    proofContentType
    ticketCode
    checkedInAt
  }
  pix {
    keyType
    key
    name
    city
  }
  pixCode
  expiresAt
  receiptSentAt
  receiptContentType
  receiptUrl
  reviewedAt
  rejectReason
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<EventOrdersQuery, EventOrdersQueryVariables>;
export const CreateEventOrderDocument = new TypedDocumentString(`
    mutation CreateEventOrder($eventId: ID!, $attendees: [AttendeeInput!]!) {
  createEventOrder(eventId: $eventId, attendees: $attendees) {
    ...EventOrderFields
  }
}
    fragment EventOrderFields on EventOrder {
  id
  eventId
  eventTitle
  code
  status
  totalCents
  buyerId
  buyerName
  unitId
  unitLabel
  attendees {
    id
    source
    dependentId
    name
    age
    outside
    ticketName
    priceCents
    needsProof
    proofUrl
    proofContentType
    ticketCode
    checkedInAt
  }
  pix {
    keyType
    key
    name
    city
  }
  pixCode
  expiresAt
  receiptSentAt
  receiptContentType
  receiptUrl
  reviewedAt
  rejectReason
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<CreateEventOrderMutation, CreateEventOrderMutationVariables>;
export const SubmitEventOrderReceiptDocument = new TypedDocumentString(`
    mutation SubmitEventOrderReceipt($id: ID!, $file: String!) {
  submitEventOrderReceipt(id: $id, file: $file) {
    ...EventOrderFields
  }
}
    fragment EventOrderFields on EventOrder {
  id
  eventId
  eventTitle
  code
  status
  totalCents
  buyerId
  buyerName
  unitId
  unitLabel
  attendees {
    id
    source
    dependentId
    name
    age
    outside
    ticketName
    priceCents
    needsProof
    proofUrl
    proofContentType
    ticketCode
    checkedInAt
  }
  pix {
    keyType
    key
    name
    city
  }
  pixCode
  expiresAt
  receiptSentAt
  receiptContentType
  receiptUrl
  reviewedAt
  rejectReason
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<SubmitEventOrderReceiptMutation, SubmitEventOrderReceiptMutationVariables>;
export const CancelEventOrderDocument = new TypedDocumentString(`
    mutation CancelEventOrder($id: ID!) {
  cancelEventOrder(id: $id) {
    ...EventOrderFields
  }
}
    fragment EventOrderFields on EventOrder {
  id
  eventId
  eventTitle
  code
  status
  totalCents
  buyerId
  buyerName
  unitId
  unitLabel
  attendees {
    id
    source
    dependentId
    name
    age
    outside
    ticketName
    priceCents
    needsProof
    proofUrl
    proofContentType
    ticketCode
    checkedInAt
  }
  pix {
    keyType
    key
    name
    city
  }
  pixCode
  expiresAt
  receiptSentAt
  receiptContentType
  receiptUrl
  reviewedAt
  rejectReason
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<CancelEventOrderMutation, CancelEventOrderMutationVariables>;
export const ApproveEventOrderDocument = new TypedDocumentString(`
    mutation ApproveEventOrder($id: ID!) {
  approveEventOrder(id: $id) {
    ...EventOrderFields
  }
}
    fragment EventOrderFields on EventOrder {
  id
  eventId
  eventTitle
  code
  status
  totalCents
  buyerId
  buyerName
  unitId
  unitLabel
  attendees {
    id
    source
    dependentId
    name
    age
    outside
    ticketName
    priceCents
    needsProof
    proofUrl
    proofContentType
    ticketCode
    checkedInAt
  }
  pix {
    keyType
    key
    name
    city
  }
  pixCode
  expiresAt
  receiptSentAt
  receiptContentType
  receiptUrl
  reviewedAt
  rejectReason
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<ApproveEventOrderMutation, ApproveEventOrderMutationVariables>;
export const RejectEventOrderDocument = new TypedDocumentString(`
    mutation RejectEventOrder($id: ID!, $reason: String!) {
  rejectEventOrder(id: $id, reason: $reason) {
    ...EventOrderFields
  }
}
    fragment EventOrderFields on EventOrder {
  id
  eventId
  eventTitle
  code
  status
  totalCents
  buyerId
  buyerName
  unitId
  unitLabel
  attendees {
    id
    source
    dependentId
    name
    age
    outside
    ticketName
    priceCents
    needsProof
    proofUrl
    proofContentType
    ticketCode
    checkedInAt
  }
  pix {
    keyType
    key
    name
    city
  }
  pixCode
  expiresAt
  receiptSentAt
  receiptContentType
  receiptUrl
  reviewedAt
  rejectReason
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<RejectEventOrderMutation, RejectEventOrderMutationVariables>;
export const SubmitEventAttendeeProofDocument = new TypedDocumentString(`
    mutation SubmitEventAttendeeProof($orderId: ID!, $attendeeId: ID!, $file: String!) {
  submitEventAttendeeProof(
    orderId: $orderId
    attendeeId: $attendeeId
    file: $file
  ) {
    ...EventOrderFields
  }
}
    fragment EventOrderFields on EventOrder {
  id
  eventId
  eventTitle
  code
  status
  totalCents
  buyerId
  buyerName
  unitId
  unitLabel
  attendees {
    id
    source
    dependentId
    name
    age
    outside
    ticketName
    priceCents
    needsProof
    proofUrl
    proofContentType
    ticketCode
    checkedInAt
  }
  pix {
    keyType
    key
    name
    city
  }
  pixCode
  expiresAt
  receiptSentAt
  receiptContentType
  receiptUrl
  reviewedAt
  rejectReason
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<SubmitEventAttendeeProofMutation, SubmitEventAttendeeProofMutationVariables>;
export const GateEventTicketsDocument = new TypedDocumentString(`
    query GateEventTickets($date: String) {
  gateEventTickets(date: $date) {
    ...GateEventTicketFields
  }
}
    fragment GateEventTicketFields on GateEventTicket {
  id
  name
  age
  outside
  source
  ticketName
  ticketCode
  checkedInAt
  entryWindow
  eventId
  eventTitle
  eventStatus
  startsAt
  endsAt
  placeName
  orderCode
  buyerName
  unitId
  unitLabel
}`) as unknown as TypedDocumentString<GateEventTicketsQuery, GateEventTicketsQueryVariables>;
export const CheckInEventTicketDocument = new TypedDocumentString(`
    mutation CheckInEventTicket($input: CheckInEventTicketInput!) {
  checkInEventTicket(input: $input) {
    ...GateEventTicketFields
  }
}
    fragment GateEventTicketFields on GateEventTicket {
  id
  name
  age
  outside
  source
  ticketName
  ticketCode
  checkedInAt
  entryWindow
  eventId
  eventTitle
  eventStatus
  startsAt
  endsAt
  placeName
  orderCode
  buyerName
  unitId
  unitLabel
}`) as unknown as TypedDocumentString<CheckInEventTicketMutation, CheckInEventTicketMutationVariables>;
export const UndoEventTicketCheckInDocument = new TypedDocumentString(`
    mutation UndoEventTicketCheckIn($attendeeId: ID!) {
  undoEventTicketCheckIn(attendeeId: $attendeeId) {
    ...GateEventTicketFields
  }
}
    fragment GateEventTicketFields on GateEventTicket {
  id
  name
  age
  outside
  source
  ticketName
  ticketCode
  checkedInAt
  entryWindow
  eventId
  eventTitle
  eventStatus
  startsAt
  endsAt
  placeName
  orderCode
  buyerName
  unitId
  unitLabel
}`) as unknown as TypedDocumentString<UndoEventTicketCheckInMutation, UndoEventTicketCheckInMutationVariables>;
export const EventTicketPassDocument = new TypedDocumentString(`
    query EventTicketPass($code: String!) {
  eventTicket(code: $code) {
    code
    name
    ticketName
    eventTitle
    placeName
    condominiumName
    startsAt
    endsAt
    buyerFirstName
    status
    checkedIn
  }
}
    `) as unknown as TypedDocumentString<EventTicketPassQuery, EventTicketPassQueryVariables>;
export const EventOrdersQueueDocument = new TypedDocumentString(`
    query EventOrdersQueue($status: EventOrderStatus, $eventId: ID) {
  eventOrdersQueue(status: $status, eventId: $eventId) {
    ...EventOrderFields
  }
}
    fragment EventOrderFields on EventOrder {
  id
  eventId
  eventTitle
  code
  status
  totalCents
  buyerId
  buyerName
  unitId
  unitLabel
  attendees {
    id
    source
    dependentId
    name
    age
    outside
    ticketName
    priceCents
    needsProof
    proofUrl
    proofContentType
    ticketCode
    checkedInAt
  }
  pix {
    keyType
    key
    name
    city
  }
  pixCode
  expiresAt
  receiptSentAt
  receiptContentType
  receiptUrl
  reviewedAt
  rejectReason
  cancelledAt
  createdAt
}`) as unknown as TypedDocumentString<EventOrdersQueueQuery, EventOrdersQueueQueryVariables>;
export const EventTicketsDocument = new TypedDocumentString(`
    query EventTickets($eventId: ID!, $filter: EventTicketFilterInput, $page: PageInput) {
  eventTickets(eventId: $eventId, filter: $filter, page: $page) {
    total
    page
    limit
    totalPages
    items {
      ...GateEventTicketFields
    }
  }
}
    fragment GateEventTicketFields on GateEventTicket {
  id
  name
  age
  outside
  source
  ticketName
  ticketCode
  checkedInAt
  entryWindow
  eventId
  eventTitle
  eventStatus
  startsAt
  endsAt
  placeName
  orderCode
  buyerName
  unitId
  unitLabel
}`) as unknown as TypedDocumentString<EventTicketsQuery, EventTicketsQueryVariables>;
export const EventTicketOverviewDocument = new TypedDocumentString(`
    query EventTicketOverview($eventId: ID!) {
  eventTicketOverview(eventId: $eventId) {
    total
    checkedIn
    outside
    byType {
      name
      count
    }
    people {
      id
      name
      ticketCode
    }
    units {
      id
      label
    }
  }
}
    `) as unknown as TypedDocumentString<EventTicketOverviewQuery, EventTicketOverviewQueryVariables>;
export const EventOrderOverviewDocument = new TypedDocumentString(`
    query EventOrderOverview($eventId: ID!) {
  eventOrderOverview(eventId: $eventId) {
    byStatus {
      status
      count
    }
    receivedCents
    confirmedPeople
    buyers {
      id
      name
    }
    units {
      id
      label
    }
    codes {
      code
      buyerName
    }
  }
}
    `) as unknown as TypedDocumentString<EventOrderOverviewQuery, EventOrderOverviewQueryVariables>;
export const FoundItemsDocument = new TypedDocumentString(`
    query FoundItems($filter: FoundItemFilterInput, $page: PageInput) {
  foundItems(filter: $filter, page: $page) {
    items {
      ...FoundItemFields
    }
    total
    page
    limit
    totalPages
  }
}
    fragment FoundItemFields on FoundItem {
  id
  category
  title
  description
  foundLocation
  foundAt
  storageLocation
  photoHidden
  status
  registeredByName
  keepUntil
  closedAt
  closedByName
  closeReason
  returnedToName
  signerName
  pendingClaims
  awaitedByName
  photoUrl
  ownerUnitLabel
  ownerName
}`) as unknown as TypedDocumentString<FoundItemsQuery, FoundItemsQueryVariables>;
export const FoundItemOverviewDocument = new TypedDocumentString(`
    query FoundItemOverview {
  foundItemOverview {
    byStatus {
      status
      count
    }
    pendingClaims
    expiringSoon
    titles
    foundLocations
    storageLocations
    residents {
      id
      name
    }
  }
}
    `) as unknown as TypedDocumentString<FoundItemOverviewQuery, FoundItemOverviewQueryVariables>;
export const FoundItemDocument = new TypedDocumentString(`
    query FoundItem($id: ID!) {
  foundItem(id: $id) {
    ...FoundItemFields
    privateDetails
    claims {
      ...FoundItemClaimFields
    }
    myClaim {
      ...FoundItemClaimFields
    }
    returnDeclaration
    soleStaffMember
    returnReceipt {
      signerName
      signerDocumentType
      signerDocumentMasked
      declaration
      imageUrl
      imageSha256
      strokesSha256
      signedAt
      clientSignedAt
      clientTimeZone
      ipAddress
      userAgent
      device
      locationStatus
      latitude
      longitude
      locationAccuracyMeters
      collectedByName
      collectedByRole
      evidenceSha256
      intact
      selfHandover
    }
  }
}
    fragment FoundItemFields on FoundItem {
  id
  category
  title
  description
  foundLocation
  foundAt
  storageLocation
  photoHidden
  status
  registeredByName
  keepUntil
  closedAt
  closedByName
  closeReason
  returnedToName
  signerName
  pendingClaims
  awaitedByName
  photoUrl
  ownerUnitLabel
  ownerName
}
fragment FoundItemClaimFields on FoundItemClaim {
  id
  itemId
  itemTitle
  itemStatus
  itemCategory
  userId
  userName
  unitLabel
  message
  status
  createdAt
  decidedAt
  decidedByName
  decisionNote
}`) as unknown as TypedDocumentString<FoundItemQuery, FoundItemQueryVariables>;
export const KeptFoundItemsDocument = new TypedDocumentString(`
    query KeptFoundItems($category: FoundItemCategory, $page: PageInput) {
  keptFoundItems(category: $category, page: $page) {
    items {
      ...FoundItemFields
      myClaim {
        ...FoundItemClaimFields
      }
    }
    total
    page
    limit
    totalPages
  }
}
    fragment FoundItemFields on FoundItem {
  id
  category
  title
  description
  foundLocation
  foundAt
  storageLocation
  photoHidden
  status
  registeredByName
  keepUntil
  closedAt
  closedByName
  closeReason
  returnedToName
  signerName
  pendingClaims
  awaitedByName
  photoUrl
  ownerUnitLabel
  ownerName
}
fragment FoundItemClaimFields on FoundItemClaim {
  id
  itemId
  itemTitle
  itemStatus
  itemCategory
  userId
  userName
  unitLabel
  message
  status
  createdAt
  decidedAt
  decidedByName
  decisionNote
}`) as unknown as TypedDocumentString<KeptFoundItemsQuery, KeptFoundItemsQueryVariables>;
export const MyFoundItemClaimsDocument = new TypedDocumentString(`
    query MyFoundItemClaims($page: PageInput) {
  myFoundItemClaims(page: $page) {
    items {
      ...FoundItemClaimFields
    }
    total
    page
    limit
    totalPages
  }
}
    fragment FoundItemClaimFields on FoundItemClaim {
  id
  itemId
  itemTitle
  itemStatus
  itemCategory
  userId
  userName
  unitLabel
  message
  status
  createdAt
  decidedAt
  decidedByName
  decisionNote
}`) as unknown as TypedDocumentString<MyFoundItemClaimsQuery, MyFoundItemClaimsQueryVariables>;
export const ClaimFoundItemDocument = new TypedDocumentString(`
    mutation ClaimFoundItem($itemId: ID!, $message: String) {
  claimFoundItem(itemId: $itemId, message: $message) {
    ...FoundItemClaimFields
  }
}
    fragment FoundItemClaimFields on FoundItemClaim {
  id
  itemId
  itemTitle
  itemStatus
  itemCategory
  userId
  userName
  unitLabel
  message
  status
  createdAt
  decidedAt
  decidedByName
  decisionNote
}`) as unknown as TypedDocumentString<ClaimFoundItemMutation, ClaimFoundItemMutationVariables>;
export const WithdrawFoundItemClaimDocument = new TypedDocumentString(`
    mutation WithdrawFoundItemClaim($claimId: ID!) {
  withdrawFoundItemClaim(claimId: $claimId) {
    ...FoundItemClaimFields
  }
}
    fragment FoundItemClaimFields on FoundItemClaim {
  id
  itemId
  itemTitle
  itemStatus
  itemCategory
  userId
  userName
  unitLabel
  message
  status
  createdAt
  decidedAt
  decidedByName
  decisionNote
}`) as unknown as TypedDocumentString<WithdrawFoundItemClaimMutation, WithdrawFoundItemClaimMutationVariables>;
export const RegisterFoundItemDocument = new TypedDocumentString(`
    mutation RegisterFoundItem($input: RegisterFoundItemInput!) {
  registerFoundItem(input: $input) {
    ...FoundItemFields
  }
}
    fragment FoundItemFields on FoundItem {
  id
  category
  title
  description
  foundLocation
  foundAt
  storageLocation
  photoHidden
  status
  registeredByName
  keepUntil
  closedAt
  closedByName
  closeReason
  returnedToName
  signerName
  pendingClaims
  awaitedByName
  photoUrl
  ownerUnitLabel
  ownerName
}`) as unknown as TypedDocumentString<RegisterFoundItemMutation, RegisterFoundItemMutationVariables>;
export const DecideFoundItemClaimDocument = new TypedDocumentString(`
    mutation DecideFoundItemClaim($claimId: ID!, $accept: Boolean!, $note: String) {
  decideFoundItemClaim(claimId: $claimId, accept: $accept, note: $note) {
    ...FoundItemClaimFields
  }
}
    fragment FoundItemClaimFields on FoundItemClaim {
  id
  itemId
  itemTitle
  itemStatus
  itemCategory
  userId
  userName
  unitLabel
  message
  status
  createdAt
  decidedAt
  decidedByName
  decisionNote
}`) as unknown as TypedDocumentString<DecideFoundItemClaimMutation, DecideFoundItemClaimMutationVariables>;
export const ReturnFoundItemDocument = new TypedDocumentString(`
    mutation ReturnFoundItem($input: ReturnFoundItemInput!) {
  returnFoundItem(input: $input) {
    ...FoundItemFields
  }
}
    fragment FoundItemFields on FoundItem {
  id
  category
  title
  description
  foundLocation
  foundAt
  storageLocation
  photoHidden
  status
  registeredByName
  keepUntil
  closedAt
  closedByName
  closeReason
  returnedToName
  signerName
  pendingClaims
  awaitedByName
  photoUrl
  ownerUnitLabel
  ownerName
}`) as unknown as TypedDocumentString<ReturnFoundItemMutation, ReturnFoundItemMutationVariables>;
export const DonateFoundItemDocument = new TypedDocumentString(`
    mutation DonateFoundItem($id: ID!, $reason: String!) {
  donateFoundItem(id: $id, reason: $reason) {
    ...FoundItemFields
  }
}
    fragment FoundItemFields on FoundItem {
  id
  category
  title
  description
  foundLocation
  foundAt
  storageLocation
  photoHidden
  status
  registeredByName
  keepUntil
  closedAt
  closedByName
  closeReason
  returnedToName
  signerName
  pendingClaims
  awaitedByName
  photoUrl
  ownerUnitLabel
  ownerName
}`) as unknown as TypedDocumentString<DonateFoundItemMutation, DonateFoundItemMutationVariables>;
export const DiscardFoundItemDocument = new TypedDocumentString(`
    mutation DiscardFoundItem($id: ID!, $reason: String!) {
  discardFoundItem(id: $id, reason: $reason) {
    ...FoundItemFields
  }
}
    fragment FoundItemFields on FoundItem {
  id
  category
  title
  description
  foundLocation
  foundAt
  storageLocation
  photoHidden
  status
  registeredByName
  keepUntil
  closedAt
  closedByName
  closeReason
  returnedToName
  signerName
  pendingClaims
  awaitedByName
  photoUrl
  ownerUnitLabel
  ownerName
}`) as unknown as TypedDocumentString<DiscardFoundItemMutation, DiscardFoundItemMutationVariables>;
export const FoundItemOwnersDocument = new TypedDocumentString(`
    query FoundItemOwners($search: String!) {
  foundItemOwners(search: $search) {
    userId
    name
    unitId
    unitLabel
  }
}
    `) as unknown as TypedDocumentString<FoundItemOwnersQuery, FoundItemOwnersQueryVariables>;
export const ReleaseFoundItemDocument = new TypedDocumentString(`
    mutation ReleaseFoundItem($id: ID!) {
  releaseFoundItem(id: $id) {
    ...FoundItemFields
  }
}
    fragment FoundItemFields on FoundItem {
  id
  category
  title
  description
  foundLocation
  foundAt
  storageLocation
  photoHidden
  status
  registeredByName
  keepUntil
  closedAt
  closedByName
  closeReason
  returnedToName
  signerName
  pendingClaims
  awaitedByName
  photoUrl
  ownerUnitLabel
  ownerName
}`) as unknown as TypedDocumentString<ReleaseFoundItemMutation, ReleaseFoundItemMutationVariables>;
export const FoundItemClaimsDocument = new TypedDocumentString(`
    query FoundItemClaims($open: Boolean, $page: PageInput) {
  foundItemClaims(open: $open, page: $page) {
    items {
      ...FoundItemClaimFields
      item {
        ...FoundItemFields
        privateDetails
      }
    }
    total
    page
    limit
    totalPages
  }
}
    fragment FoundItemFields on FoundItem {
  id
  category
  title
  description
  foundLocation
  foundAt
  storageLocation
  photoHidden
  status
  registeredByName
  keepUntil
  closedAt
  closedByName
  closeReason
  returnedToName
  signerName
  pendingClaims
  awaitedByName
  photoUrl
  ownerUnitLabel
  ownerName
}
fragment FoundItemClaimFields on FoundItemClaim {
  id
  itemId
  itemTitle
  itemStatus
  itemCategory
  userId
  userName
  unitLabel
  message
  status
  createdAt
  decidedAt
  decidedByName
  decisionNote
}`) as unknown as TypedDocumentString<FoundItemClaimsQuery, FoundItemClaimsQueryVariables>;
export const FoundItemReceiptPdfDocument = new TypedDocumentString(`
    query FoundItemReceiptPdf($id: ID!) {
  foundItemReceiptPdf(id: $id) {
    fileName
    mimeType
    base64Content
  }
}
    `) as unknown as TypedDocumentString<FoundItemReceiptPdfQuery, FoundItemReceiptPdfQueryVariables>;
export const FoundItemStaffDocument = new TypedDocumentString(`
    query FoundItemStaff {
  foundItemStaff {
    userId
    name
    roleLabel
  }
}
    `) as unknown as TypedDocumentString<FoundItemStaffQuery, FoundItemStaffQueryVariables>;
export const MyLostReportsDocument = new TypedDocumentString(`
    query MyLostReports($page: PageInput) {
  myLostReports(page: $page) {
    items {
      ...LostReportFields
    }
    total
    page
    limit
    totalPages
  }
}
    fragment LostReportFields on LostReport {
  id
  userId
  userName
  unitId
  unitLabel
  category
  title
  description
  lostLocation
  lostOn
  photoUrl
  shared
  spotCount
  status
  foundItemId
  closedAt
  createdAt
}`) as unknown as TypedDocumentString<MyLostReportsQuery, MyLostReportsQueryVariables>;
export const LostReportsDocument = new TypedDocumentString(`
    query LostReports($open: Boolean, $page: PageInput) {
  lostReports(open: $open, page: $page) {
    items {
      ...LostReportFields
    }
    total
    page
    limit
    totalPages
  }
}
    fragment LostReportFields on LostReport {
  id
  userId
  userName
  unitId
  unitLabel
  category
  title
  description
  lostLocation
  lostOn
  photoUrl
  shared
  spotCount
  status
  foundItemId
  closedAt
  createdAt
}`) as unknown as TypedDocumentString<LostReportsQuery, LostReportsQueryVariables>;
export const ReportLostItemDocument = new TypedDocumentString(`
    mutation ReportLostItem($input: ReportLostItemInput!) {
  reportLostItem(input: $input) {
    ...LostReportFields
  }
}
    fragment LostReportFields on LostReport {
  id
  userId
  userName
  unitId
  unitLabel
  category
  title
  description
  lostLocation
  lostOn
  photoUrl
  shared
  spotCount
  status
  foundItemId
  closedAt
  createdAt
}`) as unknown as TypedDocumentString<ReportLostItemMutation, ReportLostItemMutationVariables>;
export const CloseLostReportDocument = new TypedDocumentString(`
    mutation CloseLostReport($id: ID!, $found: Boolean!) {
  closeLostReport(id: $id, found: $found) {
    ...LostReportFields
  }
}
    fragment LostReportFields on LostReport {
  id
  userId
  userName
  unitId
  unitLabel
  category
  title
  description
  lostLocation
  lostOn
  photoUrl
  shared
  spotCount
  status
  foundItemId
  closedAt
  createdAt
}`) as unknown as TypedDocumentString<CloseLostReportMutation, CloseLostReportMutationVariables>;
export const LostReportBoardDocument = new TypedDocumentString(`
    query LostReportBoard($page: PageInput) {
  lostReportBoard(page: $page) {
    items {
      id
      category
      title
      lostLocation
      lostOn
      photoUrl
      mine
      spottedByMe
      createdAt
    }
    total
    page
    limit
    totalPages
  }
}
    `) as unknown as TypedDocumentString<LostReportBoardQuery, LostReportBoardQueryVariables>;
export const SpotLostReportDocument = new TypedDocumentString(`
    mutation SpotLostReport($id: ID!, $note: String) {
  spotLostReport(id: $id, note: $note)
}
    `) as unknown as TypedDocumentString<SpotLostReportMutation, SpotLostReportMutationVariables>;
export const MyNotificationsDocument = new TypedDocumentString(`
    query MyNotifications($unreadOnly: Boolean!, $page: PageInput) {
  myNotifications(unreadOnly: $unreadOnly, page: $page) {
    items {
      id
      type
      title
      body
      link
      readAt
      createdAt
    }
    total
    page
    totalPages
  }
}
    `) as unknown as TypedDocumentString<MyNotificationsQuery, MyNotificationsQueryVariables>;
export const UnreadNotificationsCountDocument = new TypedDocumentString(`
    query UnreadNotificationsCount {
  unreadNotificationsCount
}
    `) as unknown as TypedDocumentString<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>;
export const MarkNotificationReadDocument = new TypedDocumentString(`
    mutation MarkNotificationRead($id: ID!) {
  markNotificationRead(id: $id)
}
    `) as unknown as TypedDocumentString<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = new TypedDocumentString(`
    mutation MarkAllNotificationsRead {
  markAllNotificationsRead
}
    `) as unknown as TypedDocumentString<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;
export const NotificationPreferencesDocument = new TypedDocumentString(`
    query NotificationPreferences {
  myNotificationPreferences {
    type
    emailEnabled
  }
}
    `) as unknown as TypedDocumentString<NotificationPreferencesQuery, NotificationPreferencesQueryVariables>;
export const SetNotificationPreferenceDocument = new TypedDocumentString(`
    mutation SetNotificationPreference($type: NotificationType!, $emailEnabled: Boolean!) {
  setNotificationPreference(type: $type, emailEnabled: $emailEnabled) {
    type
    emailEnabled
  }
}
    `) as unknown as TypedDocumentString<SetNotificationPreferenceMutation, SetNotificationPreferenceMutationVariables>;
export const PushPublicKeyDocument = new TypedDocumentString(`
    query PushPublicKey {
  pushPublicKey
}
    `) as unknown as TypedDocumentString<PushPublicKeyQuery, PushPublicKeyQueryVariables>;
export const SubscribePushDocument = new TypedDocumentString(`
    mutation SubscribePush($input: PushSubscriptionInput!) {
  subscribePush(input: $input)
}
    `) as unknown as TypedDocumentString<SubscribePushMutation, SubscribePushMutationVariables>;
export const UnsubscribePushDocument = new TypedDocumentString(`
    mutation UnsubscribePush($endpoint: String!) {
  unsubscribePush(endpoint: $endpoint)
}
    `) as unknown as TypedDocumentString<UnsubscribePushMutation, UnsubscribePushMutationVariables>;
export const SendTestPushDocument = new TypedDocumentString(`
    mutation SendTestPush {
  sendTestPush
}
    `) as unknown as TypedDocumentString<SendTestPushMutation, SendTestPushMutationVariables>;
export const ParcelsDocument = new TypedDocumentString(`
    query Parcels($filter: ParcelFilterInput, $page: PageInput) {
  parcels(filter: $filter, page: $page) {
    items {
      ...ParcelFields
    }
    total
    page
    limit
    totalPages
  }
}
    fragment ParcelFields on Parcel {
  id
  unitId
  unitLabel
  recipientName
  recipientOnly
  carrier
  trackingCode
  notes
  storageLocation
  pickupCode
  perishable
  pickupDeadline
  authorizedName
  authorizedDocumentMasked
  authorizedByName
  authorizedAt
  status
  receivedAt
  receivedByName
  closedAt
  closedByName
  closeReason
  signerName
  photoUrl
}`) as unknown as TypedDocumentString<ParcelsQuery, ParcelsQueryVariables>;
export const ParcelOverviewDocument = new TypedDocumentString(`
    query ParcelOverview {
  parcelOverview {
    byStatus {
      status
      count
    }
    waitingLong
    perishableWaiting
    perishableOverdue
    units {
      id
      label
    }
    recipientNames
    carriers
    trackingCodes
  }
}
    `) as unknown as TypedDocumentString<ParcelOverviewQuery, ParcelOverviewQueryVariables>;
export const ParcelByCodeDocument = new TypedDocumentString(`
    query ParcelByCode($code: String!) {
  parcelByCode(code: $code) {
    ...ParcelFields
    pickupDeclaration
    authorizedDocumentType
    authorizedDocument
  }
}
    fragment ParcelFields on Parcel {
  id
  unitId
  unitLabel
  recipientName
  recipientOnly
  carrier
  trackingCode
  notes
  storageLocation
  pickupCode
  perishable
  pickupDeadline
  authorizedName
  authorizedDocumentMasked
  authorizedByName
  authorizedAt
  status
  receivedAt
  receivedByName
  closedAt
  closedByName
  closeReason
  signerName
  photoUrl
}`) as unknown as TypedDocumentString<ParcelByCodeQuery, ParcelByCodeQueryVariables>;
export const RegisterParcelDocument = new TypedDocumentString(`
    mutation RegisterParcel($input: RegisterParcelInput!) {
  registerParcel(input: $input) {
    ...ParcelFields
  }
}
    fragment ParcelFields on Parcel {
  id
  unitId
  unitLabel
  recipientName
  recipientOnly
  carrier
  trackingCode
  notes
  storageLocation
  pickupCode
  perishable
  pickupDeadline
  authorizedName
  authorizedDocumentMasked
  authorizedByName
  authorizedAt
  status
  receivedAt
  receivedByName
  closedAt
  closedByName
  closeReason
  signerName
  photoUrl
}`) as unknown as TypedDocumentString<RegisterParcelMutation, RegisterParcelMutationVariables>;
export const PickUpParcelDocument = new TypedDocumentString(`
    mutation PickUpParcel($input: PickUpParcelInput!) {
  pickUpParcel(input: $input) {
    ...ParcelFields
  }
}
    fragment ParcelFields on Parcel {
  id
  unitId
  unitLabel
  recipientName
  recipientOnly
  carrier
  trackingCode
  notes
  storageLocation
  pickupCode
  perishable
  pickupDeadline
  authorizedName
  authorizedDocumentMasked
  authorizedByName
  authorizedAt
  status
  receivedAt
  receivedByName
  closedAt
  closedByName
  closeReason
  signerName
  photoUrl
}`) as unknown as TypedDocumentString<PickUpParcelMutation, PickUpParcelMutationVariables>;
export const ReturnParcelDocument = new TypedDocumentString(`
    mutation ReturnParcel($id: ID!, $reason: String!) {
  returnParcel(id: $id, reason: $reason) {
    ...ParcelFields
  }
}
    fragment ParcelFields on Parcel {
  id
  unitId
  unitLabel
  recipientName
  recipientOnly
  carrier
  trackingCode
  notes
  storageLocation
  pickupCode
  perishable
  pickupDeadline
  authorizedName
  authorizedDocumentMasked
  authorizedByName
  authorizedAt
  status
  receivedAt
  receivedByName
  closedAt
  closedByName
  closeReason
  signerName
  photoUrl
}`) as unknown as TypedDocumentString<ReturnParcelMutation, ReturnParcelMutationVariables>;
export const CancelParcelDocument = new TypedDocumentString(`
    mutation CancelParcel($id: ID!, $reason: String!) {
  cancelParcel(id: $id, reason: $reason) {
    ...ParcelFields
  }
}
    fragment ParcelFields on Parcel {
  id
  unitId
  unitLabel
  recipientName
  recipientOnly
  carrier
  trackingCode
  notes
  storageLocation
  pickupCode
  perishable
  pickupDeadline
  authorizedName
  authorizedDocumentMasked
  authorizedByName
  authorizedAt
  status
  receivedAt
  receivedByName
  closedAt
  closedByName
  closeReason
  signerName
  photoUrl
}`) as unknown as TypedDocumentString<CancelParcelMutation, CancelParcelMutationVariables>;
export const ParcelRecipientsDocument = new TypedDocumentString(`
    query ParcelRecipients($search: String!) {
  parcelRecipients(search: $search) {
    userId
    name
    unitId
    unitLabel
  }
}
    `) as unknown as TypedDocumentString<ParcelRecipientsQuery, ParcelRecipientsQueryVariables>;
export const MyParcelsDocument = new TypedDocumentString(`
    query MyParcels($statuses: [ParcelStatus!], $page: PageInput) {
  myParcels(statuses: $statuses, page: $page) {
    items {
      ...ParcelFields
    }
    total
    page
    limit
    totalPages
  }
}
    fragment ParcelFields on Parcel {
  id
  unitId
  unitLabel
  recipientName
  recipientOnly
  carrier
  trackingCode
  notes
  storageLocation
  pickupCode
  perishable
  pickupDeadline
  authorizedName
  authorizedDocumentMasked
  authorizedByName
  authorizedAt
  status
  receivedAt
  receivedByName
  closedAt
  closedByName
  closeReason
  signerName
  photoUrl
}`) as unknown as TypedDocumentString<MyParcelsQuery, MyParcelsQueryVariables>;
export const ParcelDocument = new TypedDocumentString(`
    query Parcel($id: ID!) {
  parcel(id: $id) {
    ...ParcelFields
    signature {
      signerName
      signerDocumentType
      signerDocumentMasked
      declaration
      imageUrl
      imageSha256
      strokesSha256
      signedAt
      clientSignedAt
      clientTimeZone
      ipAddress
      userAgent
      device
      locationStatus
      latitude
      longitude
      locationAccuracyMeters
      collectedByName
      collectedByRole
      evidenceSha256
      intact
    }
  }
}
    fragment ParcelFields on Parcel {
  id
  unitId
  unitLabel
  recipientName
  recipientOnly
  carrier
  trackingCode
  notes
  storageLocation
  pickupCode
  perishable
  pickupDeadline
  authorizedName
  authorizedDocumentMasked
  authorizedByName
  authorizedAt
  status
  receivedAt
  receivedByName
  closedAt
  closedByName
  closeReason
  signerName
  photoUrl
}`) as unknown as TypedDocumentString<ParcelQuery, ParcelQueryVariables>;
export const ParcelReceiptPdfDocument = new TypedDocumentString(`
    query ParcelReceiptPdf($id: ID!) {
  parcelReceiptPdf(id: $id) {
    fileName
    mimeType
    base64Content
  }
}
    `) as unknown as TypedDocumentString<ParcelReceiptPdfQuery, ParcelReceiptPdfQueryVariables>;
export const AuthorizeParcelPickupDocument = new TypedDocumentString(`
    mutation AuthorizeParcelPickup($input: AuthorizeParcelPickupInput!) {
  authorizeParcelPickup(input: $input) {
    ...ParcelFields
  }
}
    fragment ParcelFields on Parcel {
  id
  unitId
  unitLabel
  recipientName
  recipientOnly
  carrier
  trackingCode
  notes
  storageLocation
  pickupCode
  perishable
  pickupDeadline
  authorizedName
  authorizedDocumentMasked
  authorizedByName
  authorizedAt
  status
  receivedAt
  receivedByName
  closedAt
  closedByName
  closeReason
  signerName
  photoUrl
}`) as unknown as TypedDocumentString<AuthorizeParcelPickupMutation, AuthorizeParcelPickupMutationVariables>;
export const RevokeParcelPickupAuthorizationDocument = new TypedDocumentString(`
    mutation RevokeParcelPickupAuthorization($parcelId: ID!) {
  revokeParcelPickupAuthorization(parcelId: $parcelId) {
    ...ParcelFields
  }
}
    fragment ParcelFields on Parcel {
  id
  unitId
  unitLabel
  recipientName
  recipientOnly
  carrier
  trackingCode
  notes
  storageLocation
  pickupCode
  perishable
  pickupDeadline
  authorizedName
  authorizedDocumentMasked
  authorizedByName
  authorizedAt
  status
  receivedAt
  receivedByName
  closedAt
  closedByName
  closeReason
  signerName
  photoUrl
}`) as unknown as TypedDocumentString<RevokeParcelPickupAuthorizationMutation, RevokeParcelPickupAuthorizationMutationVariables>;
export const CondominiumPixDocument = new TypedDocumentString(`
    query CondominiumPix {
  condominiumPix {
    keyType
    key
    name
    city
  }
}
    `) as unknown as TypedDocumentString<CondominiumPixQuery, CondominiumPixQueryVariables>;
export const SetCondominiumPixDocument = new TypedDocumentString(`
    mutation SetCondominiumPix($input: PixReceiverInput!) {
  setCondominiumPix(input: $input) {
    keyType
    key
    name
    city
  }
}
    `) as unknown as TypedDocumentString<SetCondominiumPixMutation, SetCondominiumPixMutationVariables>;
export const RemoveCondominiumPixDocument = new TypedDocumentString(`
    mutation RemoveCondominiumPix {
  removeCondominiumPix
}
    `) as unknown as TypedDocumentString<RemoveCondominiumPixMutation, RemoveCondominiumPixMutationVariables>;
export const PlatformMetricsDocument = new TypedDocumentString(`
    query PlatformMetrics($filter: PlatformMetricsFilterInput) {
  platformMetrics(filter: $filter) {
    from
    to
    days
    condominiumId
    bookings {
      total
      confirmed
      pending
      cancelled
      rejected
      stalePending
      granularity
      series {
        bucket
        total
        cancelled
      }
      byCondominium {
        condominiumId
        name
        total
        cancelled
      }
    }
    parcels {
      condominiumsWithModule
      received
      pickedUp
      returned
      cancelled
      perishable
      averagePickupHours
      waitingNow
      stuckNow
      perishableOverdueNow
      granularity
      series {
        bucket
        received
        pickedUp
      }
      byCondominium {
        condominiumId
        name
        received
        pickedUp
      }
    }
    spaces {
      activeSpaces
      unusedCount
      mostUsed {
        spaceId
        name
        condominiumName
        bookings
        hours
      }
      unused {
        spaceId
        name
        condominiumName
        bookings
        hours
      }
      byWeekday {
        weekday
        bookings
      }
      byHour {
        hour
        bookings
      }
    }
    engagement {
      members
      active7d
      active30d
      newMembers
      enrollments
      inactiveCount
      inactiveCondominiums {
        condominiumId
        name
        lastActivityAt
      }
    }
    health {
      staleEnrollments
      failedNotifications
      delayedNotifications
      withoutManager
      withoutUnits
      openSupport
    }
  }
}
    `) as unknown as TypedDocumentString<PlatformMetricsQuery, PlatformMetricsQueryVariables>;
export const PlatformPeopleDocument = new TypedDocumentString(`
    query PlatformPeople($filter: PlatformPeopleFilterInput, $page: PageInput) {
  platformPeople(filter: $filter, page: $page) {
    total
    page
    limit
    totalPages
    items {
      id
      name
      email
      username
      phone
      platformAdmin
      active
      lockedUntil
      lastLoginAt
      createdAt
      memberships {
        condominiumId
        condominiumName
        role
        kind
        active
      }
    }
  }
}
    `) as unknown as TypedDocumentString<PlatformPeopleQuery, PlatformPeopleQueryVariables>;
export const CondominiumMembersDocument = new TypedDocumentString(`
    query CondominiumMembers($condominiumId: ID!) {
  condominiumMembers(condominiumId: $condominiumId) {
    userId
    name
    email
    username
    phone
    role
    kind
    active
    unitLabel
    jobTitle
    lastLoginAt
    since
  }
}
    `) as unknown as TypedDocumentString<CondominiumMembersQuery, CondominiumMembersQueryVariables>;
export const ResidentsDirectoryDocument = new TypedDocumentString(`
    query ResidentsDirectory($filter: ResidentsFilterInput, $page: PageInput) {
  residentsDirectory(filter: $filter, page: $page) {
    items {
      userId
      name
      photoUrl
      unitId
      unitLabel
      unitComplement
      phone
      dependents {
        id
        name
        relationship
      }
    }
    total
    page
    limit
    totalPages
  }
}
    `) as unknown as TypedDocumentString<ResidentsDirectoryQuery, ResidentsDirectoryQueryVariables>;
export const ResidentNamesDocument = new TypedDocumentString(`
    query ResidentNames {
  residentNames {
    id
    name
  }
}
    `) as unknown as TypedDocumentString<ResidentNamesQuery, ResidentNamesQueryVariables>;
export const SpacesDocument = new TypedDocumentString(`
    query Spaces($includeInactive: Boolean!) {
  spaces(includeInactive: $includeInactive) {
    ...SpaceFields
  }
}
    fragment SpaceFields on Space {
  id
  name
  kind
  description
  capacity
  usageRules
  active
  photos {
    id
    url
  }
  createdAt
  updatedAt
  rules {
    openingHours {
      weekday
      opensAt
      closesAt
    }
    slotMinutes
    minAdvanceHours
    maxAdvanceDays
    unitLimit {
      count
      period
    }
    requiresApproval
    cancelUntilHours
    feeCents
    guests {
      allowed
      max
      documentRequired
    }
    recurringAllowed
  }
}`) as unknown as TypedDocumentString<SpacesQuery, SpacesQueryVariables>;
export const SpaceDocument = new TypedDocumentString(`
    query Space($id: ID!) {
  space(id: $id) {
    ...SpaceFields
  }
}
    fragment SpaceFields on Space {
  id
  name
  kind
  description
  capacity
  usageRules
  active
  photos {
    id
    url
  }
  createdAt
  updatedAt
  rules {
    openingHours {
      weekday
      opensAt
      closesAt
    }
    slotMinutes
    minAdvanceHours
    maxAdvanceDays
    unitLimit {
      count
      period
    }
    requiresApproval
    cancelUntilHours
    feeCents
    guests {
      allowed
      max
      documentRequired
    }
    recurringAllowed
  }
}`) as unknown as TypedDocumentString<SpaceQuery, SpaceQueryVariables>;
export const CreateSpaceDocument = new TypedDocumentString(`
    mutation CreateSpace($input: SpaceInput!) {
  createSpace(input: $input) {
    ...SpaceFields
  }
}
    fragment SpaceFields on Space {
  id
  name
  kind
  description
  capacity
  usageRules
  active
  photos {
    id
    url
  }
  createdAt
  updatedAt
  rules {
    openingHours {
      weekday
      opensAt
      closesAt
    }
    slotMinutes
    minAdvanceHours
    maxAdvanceDays
    unitLimit {
      count
      period
    }
    requiresApproval
    cancelUntilHours
    feeCents
    guests {
      allowed
      max
      documentRequired
    }
    recurringAllowed
  }
}`) as unknown as TypedDocumentString<CreateSpaceMutation, CreateSpaceMutationVariables>;
export const UpdateSpaceDocument = new TypedDocumentString(`
    mutation UpdateSpace($id: ID!, $input: SpaceInput!) {
  updateSpace(id: $id, input: $input) {
    ...SpaceFields
  }
}
    fragment SpaceFields on Space {
  id
  name
  kind
  description
  capacity
  usageRules
  active
  photos {
    id
    url
  }
  createdAt
  updatedAt
  rules {
    openingHours {
      weekday
      opensAt
      closesAt
    }
    slotMinutes
    minAdvanceHours
    maxAdvanceDays
    unitLimit {
      count
      period
    }
    requiresApproval
    cancelUntilHours
    feeCents
    guests {
      allowed
      max
      documentRequired
    }
    recurringAllowed
  }
}`) as unknown as TypedDocumentString<UpdateSpaceMutation, UpdateSpaceMutationVariables>;
export const SetSpaceActiveDocument = new TypedDocumentString(`
    mutation SetSpaceActive($id: ID!, $active: Boolean!) {
  setSpaceActive(id: $id, active: $active) {
    ...SpaceFields
  }
}
    fragment SpaceFields on Space {
  id
  name
  kind
  description
  capacity
  usageRules
  active
  photos {
    id
    url
  }
  createdAt
  updatedAt
  rules {
    openingHours {
      weekday
      opensAt
      closesAt
    }
    slotMinutes
    minAdvanceHours
    maxAdvanceDays
    unitLimit {
      count
      period
    }
    requiresApproval
    cancelUntilHours
    feeCents
    guests {
      allowed
      max
      documentRequired
    }
    recurringAllowed
  }
}`) as unknown as TypedDocumentString<SetSpaceActiveMutation, SetSpaceActiveMutationVariables>;
export const AddSpacePhotoDocument = new TypedDocumentString(`
    mutation AddSpacePhoto($spaceId: ID!, $photo: String!) {
  addSpacePhoto(spaceId: $spaceId, photo: $photo) {
    ...SpaceFields
  }
}
    fragment SpaceFields on Space {
  id
  name
  kind
  description
  capacity
  usageRules
  active
  photos {
    id
    url
  }
  createdAt
  updatedAt
  rules {
    openingHours {
      weekday
      opensAt
      closesAt
    }
    slotMinutes
    minAdvanceHours
    maxAdvanceDays
    unitLimit {
      count
      period
    }
    requiresApproval
    cancelUntilHours
    feeCents
    guests {
      allowed
      max
      documentRequired
    }
    recurringAllowed
  }
}`) as unknown as TypedDocumentString<AddSpacePhotoMutation, AddSpacePhotoMutationVariables>;
export const RemoveSpacePhotoDocument = new TypedDocumentString(`
    mutation RemoveSpacePhoto($spaceId: ID!, $photoId: ID!) {
  removeSpacePhoto(spaceId: $spaceId, photoId: $photoId) {
    ...SpaceFields
  }
}
    fragment SpaceFields on Space {
  id
  name
  kind
  description
  capacity
  usageRules
  active
  photos {
    id
    url
  }
  createdAt
  updatedAt
  rules {
    openingHours {
      weekday
      opensAt
      closesAt
    }
    slotMinutes
    minAdvanceHours
    maxAdvanceDays
    unitLimit {
      count
      period
    }
    requiresApproval
    cancelUntilHours
    feeCents
    guests {
      allowed
      max
      documentRequired
    }
    recurringAllowed
  }
}`) as unknown as TypedDocumentString<RemoveSpacePhotoMutation, RemoveSpacePhotoMutationVariables>;
export const DeleteSpaceDocument = new TypedDocumentString(`
    mutation DeleteSpace($id: ID!) {
  deleteSpace(id: $id)
}
    `) as unknown as TypedDocumentString<DeleteSpaceMutation, DeleteSpaceMutationVariables>;
export const SupportPageDocument = new TypedDocumentString(`
    query SupportPage($page: PageInput) {
  supportQuota {
    limit
    sentToday
    remaining
    nextAllowedAt
  }
  mySupportRequests(page: $page) {
    items {
      ...SupportRequestFields
    }
    total
    page
    limit
    totalPages
  }
}
    fragment SupportRequestFields on SupportRequest {
  id
  protocol
  userId
  userName
  condominiumName
  category
  subject
  message
  status
  reply
  repliedAt
  repliedByName
  finalizedAt
  finalizedByName
  createdAt
}`) as unknown as TypedDocumentString<SupportPageQuery, SupportPageQueryVariables>;
export const SupportRequestsDocument = new TypedDocumentString(`
    query SupportRequests($status: SupportStatus, $page: PageInput) {
  supportRequests(status: $status, page: $page) {
    items {
      ...SupportRequestFields
    }
    total
    page
    limit
    totalPages
  }
}
    fragment SupportRequestFields on SupportRequest {
  id
  protocol
  userId
  userName
  condominiumName
  category
  subject
  message
  status
  reply
  repliedAt
  repliedByName
  finalizedAt
  finalizedByName
  createdAt
}`) as unknown as TypedDocumentString<SupportRequestsQuery, SupportRequestsQueryVariables>;
export const SendSupportRequestDocument = new TypedDocumentString(`
    mutation SendSupportRequest($input: SupportRequestInput!) {
  sendSupportRequest(input: $input) {
    ...SupportRequestFields
  }
}
    fragment SupportRequestFields on SupportRequest {
  id
  protocol
  userId
  userName
  condominiumName
  category
  subject
  message
  status
  reply
  repliedAt
  repliedByName
  finalizedAt
  finalizedByName
  createdAt
}`) as unknown as TypedDocumentString<SendSupportRequestMutation, SendSupportRequestMutationVariables>;
export const ReplySupportRequestDocument = new TypedDocumentString(`
    mutation ReplySupportRequest($id: ID!, $reply: String!) {
  replySupportRequest(id: $id, reply: $reply) {
    ...SupportRequestFields
  }
}
    fragment SupportRequestFields on SupportRequest {
  id
  protocol
  userId
  userName
  condominiumName
  category
  subject
  message
  status
  reply
  repliedAt
  repliedByName
  finalizedAt
  finalizedByName
  createdAt
}`) as unknown as TypedDocumentString<ReplySupportRequestMutation, ReplySupportRequestMutationVariables>;
export const FinalizeSupportRequestDocument = new TypedDocumentString(`
    mutation FinalizeSupportRequest($id: ID!) {
  finalizeSupportRequest(id: $id) {
    ...SupportRequestFields
  }
}
    fragment SupportRequestFields on SupportRequest {
  id
  protocol
  userId
  userName
  condominiumName
  category
  subject
  message
  status
  reply
  repliedAt
  repliedByName
  finalizedAt
  finalizedByName
  createdAt
}`) as unknown as TypedDocumentString<FinalizeSupportRequestMutation, FinalizeSupportRequestMutationVariables>;
export const SupportRankingDocument = new TypedDocumentString(`
    query SupportRanking($year: Int) {
  supportRanking(year: $year) {
    year
    supporters
    totalCents
    entries {
      position
      name
      totalCents
      contributions
    }
  }
}
    `) as unknown as TypedDocumentString<SupportRankingQuery, SupportRankingQueryVariables>;
export const SupportersDocument = new TypedDocumentString(`
    query Supporters {
  supporters {
    id
    name
    showName
    totalCents
    contributions
    lastReceivedOn
    history {
      id
      amountCents
      receivedOn
      note
    }
  }
}
    `) as unknown as TypedDocumentString<SupportersQuery, SupportersQueryVariables>;
export const RecordSupportContributionDocument = new TypedDocumentString(`
    mutation RecordSupportContribution($input: RecordSupportContributionInput!) {
  recordSupportContribution(input: $input) {
    id
  }
}
    `) as unknown as TypedDocumentString<RecordSupportContributionMutation, RecordSupportContributionMutationVariables>;
export const UpdateSupporterDocument = new TypedDocumentString(`
    mutation UpdateSupporter($id: ID!, $input: UpdateSupporterInput!) {
  updateSupporter(id: $id, input: $input) {
    id
  }
}
    `) as unknown as TypedDocumentString<UpdateSupporterMutation, UpdateSupporterMutationVariables>;
export const DeleteSupporterDocument = new TypedDocumentString(`
    mutation DeleteSupporter($id: ID!) {
  deleteSupporter(id: $id)
}
    `) as unknown as TypedDocumentString<DeleteSupporterMutation, DeleteSupporterMutationVariables>;
export const DeleteSupportContributionDocument = new TypedDocumentString(`
    mutation DeleteSupportContribution($id: ID!) {
  deleteSupportContribution(id: $id)
}
    `) as unknown as TypedDocumentString<DeleteSupportContributionMutation, DeleteSupportContributionMutationVariables>;
export const SystemLogsDocument = new TypedDocumentString(`
    query SystemLogs($filter: SystemLogFilterInput, $page: PageInput) {
  systemLogs(filter: $filter, page: $page) {
    items {
      id
      level
      category
      source
      message
      details
      userId
      userName
      ip
      statusCode
      durationMs
      environment
      createdAt
    }
    total
    page
    limit
    totalPages
  }
}
    `) as unknown as TypedDocumentString<SystemLogsQuery, SystemLogsQueryVariables>;
export const SystemLogSummaryDocument = new TypedDocumentString(`
    query SystemLogSummary {
  systemLogSummary {
    level
    last24h
    last7d
  }
}
    `) as unknown as TypedDocumentString<SystemLogSummaryQuery, SystemLogSummaryQueryVariables>;
export const ReportClientErrorDocument = new TypedDocumentString(`
    mutation ReportClientError($message: String!, $url: String!, $digest: String) {
  reportClientError(message: $message, url: $url, digest: $digest)
}
    `) as unknown as TypedDocumentString<ReportClientErrorMutation, ReportClientErrorMutationVariables>;