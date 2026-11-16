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

export type BookingFilterInput = {
  spaceId?: string | number | null | undefined;
  status?: BookingStatus | null | undefined;
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
  search?: string | null | undefined;
  status?: EnrollmentStatus | null | undefined;
};

/** Situação do cadastro enviado pelo link público. */
export type EnrollmentStatus =
  | 'APROVADA'
  | 'PENDENTE'
  | 'RECUSADA';

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
  | 'ENROLLMENT_SUBMITTED'
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

/** Capacidade verificada pela API. */
export type Permission =
  | 'AUDIT_READ'
  | 'BOOKINGS_CREATE'
  | 'BOOKINGS_MANAGE'
  | 'CONDOMINIUMS_MANAGE'
  | 'DASHBOARD_READ'
  | 'GUESTS_CHECKIN'
  | 'NOTIFICATIONS_BROADCAST'
  | 'PERMISSIONS_MANAGE'
  | 'SPACES_MANAGE'
  | 'SUPPORTERS_MANAGE'
  | 'SUPPORT_MANAGE'
  | 'UNITS_MANAGE'
  | 'USERS_MANAGE';

export type PlatformMetricsFilterInput = {
  /** Um condomínio (vazio: todos). */
  condominiumId?: string | number | null | undefined;
  /** Primeiro dia (YYYY-MM-DD). Padrão: 30 dias antes do fim. */
  from?: string | null | undefined;
  /** Último dia (YYYY-MM-DD). Padrão: hoje. */
  to?: string | null | undefined;
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

export type ResetPasswordInput = {
  newPassword: string;
  resetToken: string;
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

export type UnitLimitInput = {
  count: number;
  period: LimitPeriod;
};

export type UpdateMyProfileInput = {
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
  group?: UserGroup | null | undefined;
  /** Qualquer um destes papéis (ex.: a equipe, ADMIN e CONCIERGE). */
  groups?: Array<UserGroup> | null | undefined;
  /** Só moradores ou só funcionários. */
  kind?: MemberKind | null | undefined;
  search?: string | null | undefined;
  unitId?: string | number | null | undefined;
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

export type UsersQueryVariables = Exact<{
  filter?: UserFilterInput | null | undefined;
  page?: PageInput | null | undefined;
}>;


export type UsersQuery = { users: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null }> } };

export type UserAccountFieldsFragment = { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null };

export type UserQueryVariables = Exact<{
  id: string | number;
}>;


export type UserQuery = { user: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { createUser: { temporaryPassword: string | null, emailSent: boolean, existingAccount: boolean, user: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } } };

export type UpdateUserMutationVariables = Exact<{
  id: string | number;
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { updateUser: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } };

export type SetUserActiveMutationVariables = Exact<{
  id: string | number;
  active: boolean;
}>;


export type SetUserActiveMutation = { setUserActive: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } };

export type ResetUserPasswordMutationVariables = Exact<{
  id: string | number;
}>;


export type ResetUserPasswordMutation = { resetUserPassword: { temporaryPassword: string | null, emailSent: boolean, user: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } } };

export type UnlockUserMutationVariables = Exact<{
  id: string | number;
}>;


export type UnlockUserMutation = { unlockUser: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } };

export type RevokeUserSessionsMutationVariables = Exact<{
  id: string | number;
}>;


export type RevokeUserSessionsMutation = { revokeUserSessions: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } };

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

export type AppInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type AppInfoQuery = { appInfo: { version: string, commit: string | null, deployedAt: string | null } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { accessToken: string, accessTokenExpiresAt: string, refreshToken: string, refreshTokenExpiresAt: string, user: { id: string, name: string, username: string, email: string, group: UserGroup, mustChangePassword: boolean, permissions: Array<Permission>, photoUrl: string | null, phone: string | null, onboardingCompleted: boolean, platformAdmin: boolean, condominium: { id: string, name: string, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat } | null, condominiums: Array<{ id: string, name: string, city: string, state: string, role: UserGroup }> } } };

export type RefreshSessionMutationVariables = Exact<{
  refreshToken: string;
}>;


export type RefreshSessionMutation = { refreshSessionTokens: { accessToken: string, accessTokenExpiresAt: string, refreshToken: string, refreshTokenExpiresAt: string } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, name: string, username: string, email: string, group: UserGroup, mustChangePassword: boolean, permissions: Array<Permission>, photoUrl: string | null, phone: string | null, onboardingCompleted: boolean, platformAdmin: boolean, condominium: { id: string, name: string, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat } | null, condominiums: Array<{ id: string, name: string, city: string, state: string, role: UserGroup }> } };

export type CompleteOnboardingMutationVariables = Exact<{ [key: string]: never; }>;


export type CompleteOnboardingMutation = { completeOnboarding: boolean };

export type ChangeMyPasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangeMyPasswordMutation = { changeMyPassword: boolean };

export type UpdateMyProfileMutationVariables = Exact<{
  input: UpdateMyProfileInput;
}>;


export type UpdateMyProfileMutation = { updateMyProfile: { id: string, name: string, username: string, email: string, group: UserGroup, mustChangePassword: boolean, permissions: Array<Permission>, photoUrl: string | null, phone: string | null, onboardingCompleted: boolean, platformAdmin: boolean, condominium: { id: string, name: string, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat } | null, condominiums: Array<{ id: string, name: string, city: string, state: string, role: UserGroup }> } };

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
}>;


export type BookingFeesQuery = { bookingFees: { month: string, totalCents: number, billedCents: number, items: Array<{ id: string, spaceId: string, spaceName: string, spaceKind: SpaceKind, guestsAllowed: boolean, userId: string, userName: string, unitLabel: string | null, startsAt: string, endsAt: string, status: BookingStatus, notes: string | null, cancelUntil: string, reason: string | null, decidedAt: string | null, cancelledAt: string | null, cancelledByManager: boolean, feeCents: number | null, feeBilledAt: string | null, seriesId: string | null, createdAt: string }> } };

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

export type CondominiumFieldsFragment = { id: string, name: string, document: string | null, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, activeMembers: number, managers: number, units: number, pendingEnrollments: number, lastActivityAt: string | null, createdAt: string };

export type CondominiumsQueryVariables = Exact<{
  filter?: CondominiumFilterInput | null | undefined;
}>;


export type CondominiumsQuery = { condominiums: Array<{ id: string, name: string, document: string | null, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, activeMembers: number, managers: number, units: number, pendingEnrollments: number, lastActivityAt: string | null, createdAt: string }> };

export type CreateCondominiumMutationVariables = Exact<{
  input: CondominiumInput;
}>;


export type CreateCondominiumMutation = { createCondominium: { id: string, name: string, document: string | null, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, activeMembers: number, managers: number, units: number, pendingEnrollments: number, lastActivityAt: string | null, createdAt: string } };

export type UpdateCondominiumMutationVariables = Exact<{
  id: string | number;
  input: CondominiumInput;
}>;


export type UpdateCondominiumMutation = { updateCondominium: { id: string, name: string, document: string | null, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, activeMembers: number, managers: number, units: number, pendingEnrollments: number, lastActivityAt: string | null, createdAt: string } };

export type SetCondominiumStatusMutationVariables = Exact<{
  id: string | number;
  status: CondominiumStatus;
}>;


export type SetCondominiumStatusMutation = { setCondominiumStatus: { id: string, name: string, document: string | null, city: string, state: string, status: CondominiumStatus, addressFormat: AddressFormat, activeMembers: number, managers: number, units: number, pendingEnrollments: number, lastActivityAt: string | null, createdAt: string } };

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

export type DashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardQuery = { dashboard: { activeUsers: number, pendingEnrollments: number, units: number, activeSpaces: number, pendingBookings: number, bookingsToday: number, openSupportRequests: number | null, failedNotifications: number | null } };

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

export type EnrollmentRequestFieldsFragment = { id: string, status: EnrollmentStatus, applicant: EnrollmentApplicant, fullName: string, email: string, phone: string, unitId: string | null, unitLabel: string | null, unitComplement: string | null, typedUnitLabel: string | null, typedUnitBlock: string | null, typedUnitNumber: string | null, typedUnitStreet: string | null, createdAt: string, reviewedAt: string | null, rejectionReason: string | null, userId: string | null, photoUrl: string | null };

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


export type EnrollmentRequestsQuery = { pendingEnrollmentCount: number, enrollmentRequests: { total: number, page: number, limit: number, totalPages: number, items: Array<{ id: string, status: EnrollmentStatus, applicant: EnrollmentApplicant, fullName: string, email: string, phone: string, unitId: string | null, unitLabel: string | null, unitComplement: string | null, typedUnitLabel: string | null, typedUnitBlock: string | null, typedUnitNumber: string | null, typedUnitStreet: string | null, createdAt: string, reviewedAt: string | null, rejectionReason: string | null, userId: string | null, photoUrl: string | null }> } };

export type ApproveEnrollmentRequestMutationVariables = Exact<{
  id: string | number;
  data: EnrollmentDataInput;
  group: UserGroup;
}>;


export type ApproveEnrollmentRequestMutation = { approveEnrollmentRequest: { request: { id: string, status: EnrollmentStatus, applicant: EnrollmentApplicant, fullName: string, email: string, phone: string, unitId: string | null, unitLabel: string | null, unitComplement: string | null, typedUnitLabel: string | null, typedUnitBlock: string | null, typedUnitNumber: string | null, typedUnitStreet: string | null, createdAt: string, reviewedAt: string | null, rejectionReason: string | null, userId: string | null, photoUrl: string | null }, access: { temporaryPassword: string | null, emailSent: boolean, existingAccount: boolean, user: { id: string, name: string, email: string, username: string, group: UserGroup, active: boolean, kind: MemberKind, unitId: string | null, unitLabel: string | null, unitComplement: string | null, phone: string | null, photoUrl: string | null, sharedAccount: boolean, mustChangePassword: boolean, lockedUntil: string | null, locked: boolean, lastLoginAt: string | null, deactivatedAt: string | null, createdAt: string, employee: { jobTitle: string | null, hiredOn: string | null, workShift: string | null, contractor: string | null } | null } } } };

export type RejectEnrollmentRequestMutationVariables = Exact<{
  id: string | number;
  reason: string;
}>;


export type RejectEnrollmentRequestMutation = { rejectEnrollmentRequest: { id: string, status: EnrollmentStatus, applicant: EnrollmentApplicant, fullName: string, email: string, phone: string, unitId: string | null, unitLabel: string | null, unitComplement: string | null, typedUnitLabel: string | null, typedUnitBlock: string | null, typedUnitNumber: string | null, typedUnitStreet: string | null, createdAt: string, reviewedAt: string | null, rejectionReason: string | null, userId: string | null, photoUrl: string | null } };

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

export type PlatformMetricsQueryVariables = Exact<{
  filter?: PlatformMetricsFilterInput | null | undefined;
}>;


export type PlatformMetricsQuery = { platformMetrics: { from: string, to: string, days: number, condominiumId: string | null, bookings: { total: number, confirmed: number, pending: number, cancelled: number, rejected: number, stalePending: number, granularity: MetricsGranularity, series: Array<{ bucket: string, total: number, cancelled: number }>, byCondominium: Array<{ condominiumId: string, name: string, total: number, cancelled: number }> }, spaces: { activeSpaces: number, unusedCount: number, mostUsed: Array<{ spaceId: string, name: string, condominiumName: string, bookings: number, hours: number }>, unused: Array<{ spaceId: string, name: string, condominiumName: string, bookings: number, hours: number }>, byWeekday: Array<{ weekday: number, bookings: number }>, byHour: Array<{ hour: number, bookings: number }> }, engagement: { members: number, active7d: number, active30d: number, newMembers: number, enrollments: number, inactiveCount: number, inactiveCondominiums: Array<{ condominiumId: string, name: string, lastActivityAt: string | null }> }, health: { staleEnrollments: number, failedNotifications: number, delayedNotifications: number, withoutManager: number, withoutUnits: number, openSupport: number } } };

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
      onboardingCompleted
      platformAdmin
      condominium {
        id
        name
        city
        state
        status
        addressFormat
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
    onboardingCompleted
    platformAdmin
    condominium {
      id
      name
      city
      state
      status
      addressFormat
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
    onboardingCompleted
    platformAdmin
    condominium {
      id
      name
      city
      state
      status
      addressFormat
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
    query BookingFees($month: String) {
  bookingFees(month: $month) {
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
  activeMembers
  managers
  units
  pendingEnrollments
  lastActivityAt
  createdAt
}`) as unknown as TypedDocumentString<SetCondominiumStatusMutation, SetCondominiumStatusMutationVariables>;
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
  }
}
    `) as unknown as TypedDocumentString<DashboardQuery, DashboardQueryVariables>;
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