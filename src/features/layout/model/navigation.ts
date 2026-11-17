import {
  Bell,
  Blocks,
  Building,
  Building2,
  CalendarDays,
  CalendarOff,
  ChartColumn,
  CircleHelp,
  CircleUserRound,
  ClipboardList,
  DoorOpen,
  Globe,
  HeartHandshake,
  House,
  LifeBuoy,
  Link2,
  type LucideIcon,
  MapPin,
  Megaphone,
  PartyPopper,
  Receipt,
  ScrollText,
  Settings,
  UserCheck,
  UserCog,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { AppModule, Permission } from "@/shared/contracts/api";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Active only on this exact address (an area's or module's home). */
  exact?: boolean;
  /** Other paths that belong to this entry (pages under its tabs). */
  also?: string[];
  /** Shown only with this permission (the page and the API check again). */
  permission?: Permission;
  /** Shown with any of these permissions. */
  anyPermission?: Permission[];
  /** Hidden with any of these (another entry does its job for them). */
  unless?: Permission[];
  /** An optional module (contracted apart): shown only while it is on. */
  module?: AppModule;
};

/**
 * The entry of a menu the address belongs to: the most specific one when
 * several match (/gestao/reservas/convidados is Convidados, not Reservas).
 */
export function activeEntry(
  pathname: string,
  items: readonly NavItem[],
): NavItem | undefined {
  return items
    .filter((item) => isActive(pathname, item))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

/** Whether the menu shows the entry to someone with `permissions`. */
export const canSee = (
  item: NavItem,
  permissions: readonly Permission[],
  modules: readonly AppModule[] = [],
) =>
  (!item.module || modules.includes(item.module)) &&
  (!item.permission || permissions.includes(item.permission)) &&
  (!item.anyPermission ||
    item.anyPermission.some((permission) =>
      permissions.includes(permission),
    )) &&
  !item.unless?.some((permission) => permissions.includes(permission));

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return [item.href, ...(item.also ?? [])].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

// ---------------------------------------------------------------------------
// One sidebar for everyone, by module: Início, then Reservas and Eventos
// (each a folding group with the resident's pages and, for managers, the
// management's), the Portaria, and Condomínio (the common administration:
// residents, team, units, sign-ups…). Each person sees only what they can
// open; a group left with one page shows as that page. Dora's own
// administration is a group of the account menu.

/** Which part of the app an address belongs to (support band, switcher). */
export type AreaId = "app" | "manage" | "platform";

export function areaOf(pathname: string): AreaId {
  if (pathname === "/administracao" || pathname.startsWith("/administracao/")) {
    return "platform";
  }
  if (pathname === "/gestao" || pathname.startsWith("/gestao/")) {
    return "manage";
  }
  return "app";
}

/** A folding group of the sidebar: a module, or the platform. */
export type NavSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
  /** A module contracted apart: the group shows only while it is on. */
  module?: AppModule;
};

/** An entry of the sidebar: a page, or a folding group of pages. */
export type SidebarEntry = NavItem | NavSection;

export const isSection = (entry: SidebarEntry): entry is NavSection =>
  "items" in entry;

// The sidebar, in order. A new paid module is one more group here (and its
// key in the API).
export const SIDEBAR: SidebarEntry[] = [
  { href: "/inicio", label: "Início", icon: House },
  {
    id: "bookings",
    label: "Reservas",
    icon: CalendarDays,
    module: "BOOKINGS",
    items: [
      {
        href: "/reservas",
        label: "Minhas reservas",
        icon: CalendarDays,
        permission: "BOOKINGS_CREATE",
      },
      {
        href: "/gestao/reservas",
        label: "Todas as reservas",
        icon: CalendarDays,
        exact: true,
        permission: "BOOKINGS_MANAGE",
      },
      {
        href: "/gestao/reservas/convidados",
        label: "Convidados",
        icon: UserCheck,
        permission: "GUESTS_CHECKIN",
      },
      {
        href: "/gestao/reservas/taxas",
        label: "Taxas de uso",
        icon: Receipt,
        permission: "BOOKINGS_MANAGE",
      },
    ],
  },
  {
    id: "events",
    label: "Eventos",
    icon: PartyPopper,
    module: "EVENTS",
    items: [
      // The residents' list; whoever manages events has the management's
      // (drafts, actions, each event's tickets and orders), where they can
      // still order their own tickets. One entry either way.
      {
        href: "/eventos",
        label: "Eventos",
        icon: PartyPopper,
        unless: ["EVENTS_MANAGE", "PAYMENTS_MANAGE"],
      },
      {
        href: "/gestao/eventos",
        label: "Eventos",
        icon: PartyPopper,
        anyPermission: ["EVENTS_MANAGE", "PAYMENTS_MANAGE"],
      },
    ],
  },
  // The day's guests and tickets at the gate: the gate staff and managers.
  {
    href: "/portaria",
    label: "Portaria",
    icon: DoorOpen,
    permission: "GUESTS_CHECKIN",
  },
  {
    id: "condominium",
    label: "Condomínio",
    icon: Building,
    items: [
      {
        href: "/gestao",
        label: "Visão geral",
        icon: ChartColumn,
        exact: true,
        permission: "DASHBOARD_READ",
      },
      {
        href: "/gestao/comunicados",
        label: "Comunicados",
        icon: Megaphone,
        permission: "NOTIFICATIONS_BROADCAST",
      },
      {
        href: "/gestao/moradores",
        label: "Moradores",
        icon: UsersRound,
        permission: "USERS_MANAGE",
      },
      {
        href: "/gestao/equipe",
        label: "Equipe",
        icon: UserCog,
        permission: "USERS_MANAGE",
      },
      {
        href: "/gestao/unidades",
        label: "Unidades",
        icon: Building,
        permission: "UNITS_MANAGE",
      },
      // The spaces and their closed periods serve bookings and events.
      {
        href: "/gestao/espacos",
        label: "Espaços",
        icon: MapPin,
        permission: "SPACES_MANAGE",
      },
      {
        href: "/gestao/bloqueios",
        label: "Bloqueios",
        icon: CalendarOff,
        permission: "BOOKINGS_MANAGE",
      },
      {
        href: "/gestao/cadastros",
        label: "Cadastros",
        icon: ClipboardList,
        permission: "USERS_MANAGE",
      },
      {
        href: "/gestao/links",
        label: "Links de cadastro",
        icon: Link2,
        permission: "USERS_MANAGE",
      },
      {
        href: "/gestao/dependentes",
        label: "Dependentes",
        icon: UsersRound,
        permission: "USERS_MANAGE",
      },
      {
        href: "/gestao/pagamentos",
        label: "Pagamentos",
        icon: Wallet,
        permission: "PAYMENTS_MANAGE",
      },
    ],
  },
];

/**
 * The sidebar this person sees: the modules the condominium contracted,
 * each group with the pages they can open. An empty group is left out; a
 * group with one page shows as that page, under the group's name and icon.
 */
export function visibleSidebar(
  permissions: readonly Permission[],
  modules: readonly AppModule[],
): SidebarEntry[] {
  return SIDEBAR.flatMap((entry): SidebarEntry[] => {
    if (!isSection(entry)) {
      return canSee(entry, permissions, modules) ? [entry] : [];
    }
    if (entry.module && !modules.includes(entry.module)) return [];
    const items = entry.items.filter((item) =>
      canSee(item, permissions, modules),
    );
    if (items.length === 0) return [];
    if (items.length === 1) {
      return [{ ...items[0], label: entry.label, icon: entry.icon }];
    }
    return [{ ...entry, items }];
  });
}

/** Every page of a sidebar (the groups' pages included). */
export const sidebarPages = (entries: readonly SidebarEntry[]): NavItem[] =>
  entries.flatMap((entry) => (isSection(entry) ? entry.items : [entry]));

// ---------------------------------------------------------------------------
// Dora's own administration: one sidebar entry below Início, for the
// platform administrator; its page opens the others.
export const ADMIN_NAV: NavItem = {
  href: "/administracao",
  label: "Administração",
  icon: Globe,
  permission: "CONDOMINIUMS_MANAGE",
};

// The administration's pages (its home's cards and the menu search).
export const PLATFORM_NAV: NavItem[] = [
  {
    href: "/administracao",
    label: "Visão geral",
    icon: ChartColumn,
    exact: true,
    permission: "CONDOMINIUMS_MANAGE",
  },
  {
    href: "/administracao/condominios",
    label: "Condomínios",
    icon: Building2,
    permission: "CONDOMINIUMS_MANAGE",
  },
  {
    href: "/administracao/pessoas",
    label: "Pessoas",
    icon: UsersRound,
    permission: "CONDOMINIUMS_MANAGE",
  },
  {
    href: "/administracao/modulos",
    label: "Módulos",
    icon: Blocks,
    permission: "CONDOMINIUMS_MANAGE",
  },
  {
    href: "/administracao/logs",
    label: "Logs e alertas",
    icon: ScrollText,
    permission: "AUDIT_READ",
  },
];

// The "Conta" section at the bottom of the sidebar, in every area.
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
