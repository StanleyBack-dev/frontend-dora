import type { Permission, UserGroup } from "@/shared/contracts/api";

export const GROUP_LABELS: Record<UserGroup, string> = {
  USER: "Morador",
  ADMIN: "Gestor",
  ADMIN_MASTER: "Administrador geral",
};

export const GROUP_DESCRIPTIONS: Record<UserGroup, string> = {
  USER: "Usa o app do condomínio: recebe avisos e comunicados e pede ajuda ao suporte.",
  ADMIN:
    "Tudo do morador, mais o painel de gestão e o envio de comunicados (síndico, administração).",
  ADMIN_MASTER:
    "Acesso total: inclusive usuários, cadastros, permissões e histórico dos registros.",
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
  USERS_MANAGE: { label: "Gerenciar usuários", area: "Administração" },
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
};

/** Only granted by the user's group; never per user. */
export const LOCKED_PERMISSIONS: ReadonlySet<Permission> = new Set<Permission>([
  "USERS_MANAGE",
  "PERMISSIONS_MANAGE",
  "AUDIT_READ",
  "SUPPORT_MANAGE",
]);

export const PERMISSION_AREAS: PermissionArea[] = [
  "Gestão",
  "Comunicação",
  "Administração",
];
