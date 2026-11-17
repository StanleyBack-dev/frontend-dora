import {
  Bell,
  Blocks,
  Building,
  Building2,
  CalendarDays,
  ChartColumn,
  CircleHelp,
  CircleUserRound,
  ClipboardList,
  DoorOpen,
  Globe,
  HeartHandshake,
  House,
  LayoutGrid,
  LifeBuoy,
  Link2,
  type LucideIcon,
  MapPin,
  Megaphone,
  PartyPopper,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
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
  /** An optional module (contracted apart): shown only while it is on. */
  module?: AppModule;
};

/** Whether the menu shows the entry to someone with `permissions`. */
export const canSee = (
  item: NavItem,
  permissions: readonly Permission[],
  modules: readonly AppModule[] = [],
) =>
  (!item.module || modules.includes(item.module)) &&
  (!item.permission || permissions.includes(item.permission)) &&
  (!item.anyPermission ||
    item.anyPermission.some((permission) => permissions.includes(permission)));

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return [item.href, ...(item.also ?? [])].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

// ---------------------------------------------------------------------------
// Areas: the app is split in three, each with its own menu. Everyone has the
// resident's app; managers also the management of the condominium they work
// in; the platform administrator, the platform (every condominium).

export type AreaId = "app" | "manage" | "platform";

export type Area = {
  id: AreaId;
  label: string;
  /** Its home. */
  href: string;
  icon: LucideIcon;
};

export const AREAS: Record<AreaId, Area> = {
  app: { id: "app", label: "Meu condomínio", href: "/inicio", icon: House },
  manage: { id: "manage", label: "Gestão", href: "/gestao", icon: ShieldCheck },
  platform: {
    id: "platform",
    label: "Plataforma",
    href: "/plataforma",
    icon: Globe,
  },
};

/** The area of an address. */
export function areaOf(pathname: string): AreaId {
  if (pathname === "/plataforma" || pathname.startsWith("/plataforma/")) {
    return "platform";
  }
  if (pathname === "/gestao" || pathname.startsWith("/gestao/")) {
    return "manage";
  }
  return "app";
}

// The resident's app (and the gate's): what everyone of the condominium uses.
export const APP_NAV: NavItem[] = [
  { href: "/inicio", label: "Início", icon: House },
  {
    href: "/reservas",
    label: "Reservas",
    icon: CalendarDays,
    permission: "BOOKINGS_CREATE",
    module: "BOOKINGS",
  },
  {
    href: "/eventos",
    label: "Eventos",
    icon: PartyPopper,
    module: "EVENTS",
  },
  // The day's guests and tickets at the gate: the gate staff and managers.
  {
    href: "/portaria",
    label: "Portaria",
    icon: DoorOpen,
    permission: "GUESTS_CHECKIN",
  },
];

// ---------------------------------------------------------------------------
// The management area is organised by module: Geral (the condominium itself)
// and one tab per module contracted apart, each showing only its own menu.
// A new paid module is one more entry here (and its key in the API).

export type ManageModuleId = "general" | "bookings" | "events";

export type ManageModule = {
  id: ManageModuleId;
  label: string;
  icon: LucideIcon;
  /** Where its pages live (the tab is active under it). */
  base: string;
  /** The module contracted apart (none: always there). */
  module?: AppModule;
  items: NavItem[];
};

export const MANAGE_MODULES: ManageModule[] = [
  {
    id: "general",
    label: "Geral",
    icon: LayoutGrid,
    base: "/gestao",
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
  {
    id: "bookings",
    label: "Reservas",
    icon: CalendarDays,
    base: "/gestao/reservas",
    module: "BOOKINGS",
    items: [
      {
        href: "/gestao/reservas",
        label: "Reservas",
        icon: CalendarDays,
        exact: true,
        permission: "BOOKINGS_MANAGE",
      },
      {
        href: "/gestao/reservas/espacos",
        label: "Espaços",
        icon: MapPin,
        permission: "SPACES_MANAGE",
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
    base: "/gestao/eventos",
    module: "EVENTS",
    items: [
      {
        href: "/gestao/eventos",
        label: "Eventos",
        icon: PartyPopper,
        anyPermission: ["EVENTS_MANAGE", "PAYMENTS_MANAGE"],
      },
    ],
  },
];

/** The management module of an address (Geral outside the others). */
export function manageModuleOf(pathname: string): ManageModuleId {
  const found = MANAGE_MODULES.find(
    (item) =>
      item.id !== "general" &&
      (pathname === item.base || pathname.startsWith(`${item.base}/`)),
  );
  return found?.id ?? "general";
}

/**
 * The management modules this person works with: contracted by the
 * condominium and with something they can open, each with those items.
 */
export function visibleManageModules(
  permissions: readonly Permission[],
  modules: readonly AppModule[],
): ManageModule[] {
  return MANAGE_MODULES.filter(
    (item) => !item.module || modules.includes(item.module),
  )
    .map((item) => ({
      ...item,
      items: item.items.filter((entry) => canSee(entry, permissions, modules)),
    }))
    .filter((item) => item.items.length > 0);
}

// ---------------------------------------------------------------------------
// The platform (Dora's own administration): every condominium.
export const PLATFORM_NAV: NavItem[] = [
  {
    href: "/plataforma",
    label: "Visão geral",
    icon: ChartColumn,
    exact: true,
    permission: "CONDOMINIUMS_MANAGE",
  },
  {
    href: "/plataforma/condominios",
    label: "Condomínios",
    icon: Building2,
    permission: "CONDOMINIUMS_MANAGE",
  },
  {
    href: "/plataforma/pessoas",
    label: "Pessoas",
    icon: UsersRound,
    permission: "CONDOMINIUMS_MANAGE",
  },
  {
    href: "/plataforma/modulos",
    label: "Módulos",
    icon: Blocks,
    permission: "CONDOMINIUMS_MANAGE",
  },
  {
    href: "/plataforma/logs",
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
