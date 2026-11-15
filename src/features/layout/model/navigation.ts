import {
  Bell,
  Building2,
  CalendarDays,
  ChartColumn,
  CircleHelp,
  CircleUserRound,
  DoorOpen,
  HeartHandshake,
  House,
  MapPin,
  LifeBuoy,
  type LucideIcon,
  Megaphone,
  Settings,
  ShieldCheck,
  UserCog,
  UsersRound,
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
  // The platform's numbers: the platform administrator only.
  {
    href: "/painel",
    label: "Painel",
    icon: ChartColumn,
    permission: "CONDOMINIUMS_MANAGE",
  },
  // Whoever books or manages bookings (not the gate staff).
  {
    href: "/reservas",
    label: "Reservas",
    icon: CalendarDays,
    anyPermission: ["BOOKINGS_CREATE", "BOOKINGS_MANAGE"],
  },
  // The day's guests at the gate: the gate staff and the managers.
  {
    href: "/portaria",
    label: "Portaria",
    icon: DoorOpen,
    permission: "GUESTS_CHECKIN",
  },
  // The spaces themselves: only whoever manages them.
  {
    href: "/espacos",
    label: "Espaços",
    icon: MapPin,
    permission: "SPACES_MANAGE",
  },
  {
    href: "/comunicados",
    label: "Comunicados",
    icon: Megaphone,
    permission: "NOTIFICATIONS_BROADCAST",
  },
  // The residents of the open condominium: managers and the platform.
  {
    href: "/moradores",
    label: "Moradores",
    icon: UsersRound,
    permission: "USERS_MANAGE",
  },
  // Its team: managers (administração) and the gate (Portaria).
  {
    href: "/equipe",
    label: "Equipe",
    icon: UserCog,
    permission: "USERS_MANAGE",
  },
  // Every condominium using Dora: the platform administrator only.
  {
    href: "/condominios",
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

/** Contributions to the project (PIX): only when it is configured. */
export const SUPPORT_PROJECT_NAV: NavItem = {
  href: "/apoiar",
  label: "Apoie o Dora",
  icon: HeartHandshake,
};

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
