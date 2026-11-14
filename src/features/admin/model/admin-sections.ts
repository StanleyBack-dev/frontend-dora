import {
  Building,
  Building2,
  ClipboardList,
  Link2,
  ScrollText,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/shared/contracts/api";

export type AdminSection = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "Acessos" | "Plataforma" | "Sistema";
  permission: Permission;
  /** Belongs to one condominium (needs one open). */
  tenant: boolean;
};

// The areas of Administração, in menu order; each shows only to whoever has
// its permission.
export const ADMIN_SECTIONS: AdminSection[] = [
  {
    href: "/admin/usuarios",
    label: "Moradores",
    description: "Acessos, unidades e permissões",
    icon: UsersRound,
    group: "Acessos",
    permission: "USERS_MANAGE",
    tenant: true,
  },
  {
    href: "/admin/cadastros",
    label: "Cadastros",
    description: "Pedidos vindos do link",
    icon: ClipboardList,
    group: "Acessos",
    permission: "USERS_MANAGE",
    tenant: true,
  },
  {
    href: "/admin/links",
    label: "Links de cadastro",
    description: "Links enviados por WhatsApp",
    icon: Link2,
    group: "Acessos",
    permission: "USERS_MANAGE",
    tenant: true,
  },
  {
    href: "/admin/unidades",
    label: "Unidades",
    description: "Blocos, apartamentos e casas",
    icon: Building,
    group: "Acessos",
    permission: "UNITS_MANAGE",
    tenant: true,
  },
  {
    href: "/admin/condominios",
    label: "Condomínios",
    description: "Clientes do Dora e seus números",
    icon: Building2,
    group: "Plataforma",
    permission: "CONDOMINIUMS_MANAGE",
    tenant: false,
  },
  {
    href: "/admin/logs",
    label: "Logs e alertas",
    description: "Erros, segurança e rotinas",
    icon: ScrollText,
    group: "Sistema",
    permission: "AUDIT_READ",
    tenant: false,
  },
];

/** The sections this person can open now (tenant ones need a condominium). */
export const openableSections = (
  user: { permissions: readonly Permission[] },
  hasCondominium: boolean,
): AdminSection[] =>
  ADMIN_SECTIONS.filter(
    (section) =>
      user.permissions.includes(section.permission) &&
      (hasCondominium || !section.tenant),
  );
