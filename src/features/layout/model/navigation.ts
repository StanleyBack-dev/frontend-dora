import {
  Bell,
  Building2,
  CircleHelp,
  CircleUserRound,
  House,
  MapPin,
  LifeBuoy,
  type LucideIcon,
  Megaphone,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { Permission } from "@/shared/contracts/api";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Other paths that belong to this entry (pages under its tabs). */
  also?: string[];
  /** Shown only with this permission (the page and the API check again). */
  permission?: Permission;
  /** Shown with any of these permissions. */
  anyPermission?: Permission[];
};

/** Whether the menu shows the entry to someone with `permissions`. */
export const canSee = (item: NavItem, permissions: readonly Permission[]) =>
  (!item.permission || permissions.includes(item.permission)) &&
  (!item.anyPermission ||
    item.anyPermission.some((permission) => permissions.includes(permission)));

// Main menu. Each page checks its own permission again; the menu only hides
// what the user can't open. Each module adds its entries here (bookings
// comes next, right after Início).
export const PRIMARY_NAV: NavItem[] = [
  { href: "/inicio", label: "Início", icon: House },
  // Everyone in a condominium: its courts, party room… (bookings next).
  { href: "/espacos", label: "Espaços", icon: MapPin },
  {
    href: "/comunicados",
    label: "Comunicados",
    icon: Megaphone,
    permission: "NOTIFICATIONS_BROADCAST",
  },
  // The platform console (every condominium): only the Dora administration.
  {
    href: "/plataforma",
    label: "Condomínios",
    icon: Building2,
    permission: "CONDOMINIUMS_MANAGE",
  },
];

// The "Conta" section at the bottom of the sidebar.
export const ACCOUNT_NAV: NavItem[] = [
  { href: "/perfil", label: "Meu perfil", icon: CircleUserRound },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
  // Everyone: ask the app's support (administrators answer there too).
  { href: "/suporte", label: "Suporte", icon: LifeBuoy },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
  // Everyone: how to use each menu, by their permissions.
  { href: "/ajuda", label: "Ajuda", icon: CircleHelp },
];

/** Admin area: shown when the user has any of its permissions. */
export const ADMIN_NAV: NavItem = {
  href: "/admin",
  label: "Administração",
  icon: ShieldCheck,
};

export function isActive(pathname: string, item: NavItem): boolean {
  return [item.href, ...(item.also ?? [])].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
