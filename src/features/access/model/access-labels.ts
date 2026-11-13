import type { Permission, UserGroup } from "@/shared/contracts/api";

export const GROUP_LABELS: Record<UserGroup, string> = {
  USER: "Morador",
  ADMIN: "Gestor",
  ADMIN_MASTER: "Administrador geral",
};

export const GROUP_DESCRIPTIONS: Record<UserGroup, string> = {
  USER: "Usa o app do condomínio: recebe avisos e comunicados e pede ajuda ao suporte.",
  ADMIN:
    "Administra este condomínio (síndico, administração): moradores, cadastros, unidades, comunicados e painel.",
  ADMIN_MASTER:
    "Administra a plataforma Dora: todos os condomínios, suporte e histórico dos registros.",
};

/** Groups in rank order (lowest first). */
export const GROUPS: UserGroup[] = ["USER", "ADMIN", "ADMIN_MASTER"];

type PermissionInfo = { label: string; area: PermissionArea };

export type PermissionArea = "Gestão" | "Comunicação" | "Administração";

// Exhaustive on purpose: a permission added to the API fails the typecheck
// here until it gets a label.
export const PERMISSION_INFO: Record<Permission, PermissionInfo> = {
  DASHBOARD_READ: { label: "Ver o painel de gestão", area: "Gestão" },
  NOTIFICATIONS_BROADCAST: {
    label: "Enviar comunicados",
    area: "Comunicação",
  },
  USERS_MANAGE: {
    label: "Gerenciar moradores e cadastros",
    area: "Administração",
  },
  UNITS_MANAGE: { label: "Gerenciar unidades", area: "Administração" },
  PERMISSIONS_MANAGE: {
    label: "Gerenciar permissões",
    area: "Administração",
  },
  AUDIT_READ: {
    label: "Ver quem criou e alterou os registros",
    area: "Administração",
  },
  SUPPORT_MANAGE: {
    label: "Responder solicitações de suporte",
    area: "Administração",
  },
  CONDOMINIUMS_MANAGE: {
    label: "Gerenciar os condomínios da plataforma",
    area: "Administração",
  },
};

/** Only granted by the role; never per member. */
export const LOCKED_PERMISSIONS: ReadonlySet<Permission> = new Set<Permission>([
  "USERS_MANAGE",
  "PERMISSIONS_MANAGE",
  "AUDIT_READ",
  "SUPPORT_MANAGE",
  "CONDOMINIUMS_MANAGE",
]);

export const PERMISSION_AREAS: PermissionArea[] = [
  "Gestão",
  "Comunicação",
  "Administração",
];
