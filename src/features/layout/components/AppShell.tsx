"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronUp,
  House,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
} from "lucide-react";
import {
  Avatar,
  Button,
  cn,
  Modal,
  PageTitleAddonProvider,
  Spinner,
} from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { authClient } from "@/features/auth/api/auth.client";
import { OnboardingTour } from "@/features/help/components/OnboardingTour";
import { PageHelpButton } from "@/features/help/components/PageHelpButton";
import { InstallAppInvite } from "@/features/install/components/InstallAppInvite";
import { Wordmark } from "@/features/layout/components/Logo";
import { LogoMark } from "@/features/layout/components/LogoMark";
import { MenuSearch } from "@/features/layout/components/MenuSearch";
import {
  ViewerProvider,
  type Viewer,
} from "@/features/layout/components/ViewerContext";
import {
  ACCOUNT_NAV,
  ADMIN_NAV,
  canSee,
  isActive,
  PRIMARY_NAV,
  type NavItem,
} from "@/features/layout/model/navigation";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { PushNotificationsInvite } from "@/features/notifications/components/PushNotificationsInvite";
import type { SessionUser } from "@/shared/contracts/api";
import { apiRequest } from "@/shared/lib/api-client";

// The collapsed state is a per-browser preference. It lives in localStorage
// (read through an external store so the server render stays expanded).
const COLLAPSED_KEY = "dora:sidebar-collapsed";
const collapsedListeners = new Set<() => void>();

function subscribeCollapsed(listener: () => void) {
  collapsedListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    collapsedListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(collapsed: boolean) {
  try {
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  } catch {
    // Storage blocked: the toggle still works for this page via listeners.
  }
  collapsedListeners.forEach((listener) => listener());
}

function NavPendingHint() {
  const { pending } = useLinkStatus();
  return pending ? (
    <Spinner size="sm" className="ml-auto" label="Carregando página" />
  ) : null;
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  /** Icon rail (collapsed desktop sidebar). */
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const { href, label, icon: Icon } = item;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      data-tour-nav={href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex w-full items-center gap-3 rounded-full py-2.5 text-[13px] font-semibold transition-colors",
        collapsed ? "px-3.5 lg:justify-center lg:px-0" : "px-3.5",
        active
          ? "bg-brand text-brand-fg"
          : "text-chrome-muted hover:bg-chrome-hover hover:text-chrome-fg",
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "size-[18px] shrink-0",
          active
            ? "text-brand-fg"
            : "text-chrome-subtle group-hover:text-brand",
        )}
      />
      <span className={cn("flex-1 truncate", collapsed && "lg:sr-only")}>
        {label}
      </span>
      {!collapsed && <NavPendingHint />}
    </Link>
  );
}

/** One tab of the phone's bottom bar. */
function TabLink({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition-colors",
        active ? "text-fg" : "text-soft hover:text-fg",
      )}
    >
      <span
        className={cn(
          "grid h-8 w-14 place-items-center rounded-full transition-colors [&>svg]:size-5",
          active && "bg-brand text-brand-fg",
        )}
      >
        {icon}
      </span>
      {label}
      {badge ? (
        <span className="absolute top-1.5 left-1/2 ml-3 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] leading-none font-bold text-brand-fg ring-2 ring-surface">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

// Signed-in frame: black sidebar with the main menu and the account card,
// an off-canvas drawer and a bottom tab bar on phones, and a light top bar
// over the content with menu search and notifications.
export function AppShell({
  user,
  showAdmin,
  unreadNotifications,
  children,
}: {
  user: Pick<
    SessionUser,
    "name" | "group" | "permissions" | "photoUrl" | "onboardingCompleted"
  >;
  showAdmin: boolean;
  /** Server-side count; the bell keeps it fresh afterwards. */
  unreadNotifications: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  // The guided tour: on the first access, and again from Ajuda.
  const [tourOpen, setTourOpen] = useState(!user.onboardingCompleted);
  const tourSaved = useRef(user.onboardingCompleted);
  const finishTour = useCallback(() => {
    setTourOpen(false);
    if (tourSaved.current) return;
    tourSaved.current = true;
    // Best effort: if it fails, the tour just shows again next time.
    void apiRequest("/me/onboarding", { method: "POST" }).catch(() => {
      tourSaved.current = false;
    });
  }, []);
  const viewer = useMemo<Viewer>(
    () => ({
      permissions: user.permissions,
      showAdmin,
      restartTour: () => setTourOpen(true),
    }),
    [user.permissions, showAdmin],
  );
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    readCollapsed,
    () => false,
  );

  const primary = PRIMARY_NAV.filter((item) => canSee(item, user.permissions));
  const account = showAdmin ? [...ACCOUNT_NAV, ADMIN_NAV] : ACCOUNT_NAV;
  const accountActive = account.some((item) => isActive(pathname, item));

  // Pin the page behind the open mobile drawer: on iOS only `position:
  // fixed` stops touch scrolling from reaching the page.
  useEffect(() => {
    if (!mobileOpen) return;
    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  function openLogout() {
    closeMobile();
    setLogoutOpen(true);
  }

  async function logout() {
    setLeaving(true);
    await authClient.logout().catch(() => undefined);
    router.replace("/entrar");
    router.refresh();
  }

  return (
    <ViewerProvider value={viewer}>
      <PageTitleAddonProvider value={<PageHelpButton />}>
        <div className="min-h-dvh bg-bg">
          <div
            aria-hidden
            onClick={closeMobile}
            className={cn(
              "fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
              mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          />

          <aside
            aria-label="Menu"
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col bg-chrome",
              "transition-[transform,width] duration-200 lg:max-w-none",
              mobileOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0",
              collapsed ? "lg:w-[76px]" : "lg:w-64",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3 px-5 pt-6 pb-4",
                collapsed && "lg:flex-col lg:gap-3 lg:px-2",
              )}
            >
              <Link
                href="/inicio"
                onClick={closeMobile}
                className="flex min-w-0 flex-1 items-center gap-2.5"
                aria-label="Dora, início"
              >
                <LogoMark className="size-9" />
                <Wordmark
                  tone="light"
                  className={cn("text-[26px]", collapsed && "lg:hidden")}
                />
              </Link>
              <button
                type="button"
                onClick={() => writeCollapsed(!collapsed)}
                aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                title={collapsed ? "Expandir menu" : "Recolher menu"}
                aria-expanded={!collapsed}
                className="hidden size-8 shrink-0 place-items-center rounded-full text-chrome-subtle transition-colors hover:bg-chrome-hover hover:text-chrome-fg lg:grid"
              >
                {collapsed ? (
                  <PanelLeftOpen className="size-[18px]" aria-hidden />
                ) : (
                  <PanelLeftClose className="size-[18px]" aria-hidden />
                )}
              </button>
            </div>

            {/* min-h-0 lets the menu scroll inside the space the footer leaves. */}
            <nav
              aria-label="Principal"
              className={cn(
                "chrome-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto overscroll-contain py-3",
                collapsed ? "px-4 lg:px-3" : "px-4",
              )}
            >
              <p
                className={cn(
                  "px-3.5 pb-1 text-[10px] font-bold tracking-[0.14em] text-chrome-subtle uppercase",
                  collapsed && "lg:sr-only",
                )}
              >
                Menu
              </p>
              {primary.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item)}
                  collapsed={collapsed}
                  onNavigate={closeMobile}
                />
              ))}
            </nav>

            <div
              className={cn(
                "shrink-0 p-3",
                collapsed ? "px-4 lg:px-3" : "px-4",
              )}
            >
              {/* Icon rail: no room for a sub-menu, so the items show directly. */}
              {collapsed && (
                <div className="hidden flex-col gap-1 lg:flex">
                  {account.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={isActive(pathname, item)}
                      collapsed
                      onNavigate={closeMobile}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={openLogout}
                    title="Sair"
                    aria-label="Sair"
                    className="flex w-full items-center justify-center rounded-full py-2.5 text-chrome-muted transition-colors hover:bg-chrome-hover hover:text-chrome-fg"
                  >
                    <LogOut aria-hidden className="size-[18px] shrink-0" />
                  </button>
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl border border-chrome-line bg-chrome-top",
                  collapsed && "lg:hidden",
                )}
              >
                {accountOpen && (
                  <div className="flex flex-col gap-1 border-b border-chrome-line p-2">
                    {account.map((item) => (
                      <NavLink
                        key={item.href}
                        item={item}
                        active={isActive(pathname, item)}
                        collapsed={false}
                        onNavigate={closeMobile}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={openLogout}
                      className="group flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-[13px] font-semibold text-chrome-muted transition-colors hover:bg-chrome-hover hover:text-chrome-fg"
                    >
                      <LogOut
                        aria-hidden
                        className="size-[18px] shrink-0 text-chrome-subtle group-hover:text-brand"
                      />
                      <span className="flex-1 text-left">Sair</span>
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  data-tour="account"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-expanded={accountOpen}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-chrome-hover",
                    accountActive && !accountOpen && "ring-1 ring-brand/60",
                  )}
                >
                  <Avatar
                    name={user.name}
                    src={user.photoUrl}
                    size="sm"
                    className="size-9 ring-2 ring-brand"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-chrome-fg">
                      {user.name}
                    </span>
                    <span className="block truncate text-[11px] text-chrome-subtle">
                      {GROUP_LABELS[user.group]}
                    </span>
                  </span>
                  <ChevronUp
                    aria-hidden
                    className={cn(
                      "size-4 text-chrome-subtle transition-transform",
                      !accountOpen && "rotate-180",
                    )}
                  />
                </button>
              </div>
            </div>
          </aside>

          <div
            className={cn(
              "flex min-h-dvh min-w-0 flex-col transition-[margin] duration-200",
              collapsed ? "lg:ml-[76px]" : "lg:ml-64",
            )}
          >
            <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-6 lg:px-10">
              <Link
                href="/inicio"
                aria-label="Dora, início"
                className="flex items-center gap-2 lg:hidden"
              >
                <LogoMark className="size-8" />
              </Link>
              <MenuSearch
                items={[...primary, ...account]}
                className="min-w-0 flex-1 sm:max-w-sm"
              />
              <div className="ml-auto flex items-center gap-1">
                <NotificationBell initialCount={unreadNotifications} />
                <Link
                  href="/perfil"
                  aria-label="Meu perfil"
                  className="hidden rounded-full transition-opacity hover:opacity-80 sm:block"
                >
                  <Avatar name={user.name} src={user.photoUrl} size="sm" />
                </Link>
              </div>
            </header>

            {/* Bottom padding on phones: room for the tab bar. */}
            <main className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-12">
              {children}
            </main>
            {/* Inside the column: on phones it takes room at the end of the page
            instead of covering the last items. */}
            <InstallAppInvite />
            <PushNotificationsInvite hidden={tourOpen} />
          </div>

          <nav
            aria-label="Atalhos"
            className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
          >
            <TabLink
              href="/inicio"
              label="Início"
              icon={<House aria-hidden />}
              active={pathname === "/inicio"}
            />
            <TabLink
              href="/notificacoes"
              label="Avisos"
              icon={<Bell aria-hidden />}
              active={pathname === "/notificacoes"}
              badge={unreadNotifications}
            />
            <TabLink
              href="/perfil"
              label="Perfil"
              icon={<UserRound aria-hidden />}
              active={pathname === "/perfil"}
            />
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={mobileOpen}
              className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold text-soft transition-colors hover:text-fg"
            >
              <span className="grid h-8 w-14 place-items-center rounded-full [&>svg]:size-5">
                <Menu aria-hidden />
              </span>
              Menu
            </button>
          </nav>

          <Modal
            open={logoutOpen}
            onClose={() => setLogoutOpen(false)}
            title="Encerrar sessão"
            icon={<LogOut className="size-5" />}
            busy={leaving}
            footer={
              <>
                <Button
                  variant="secondary"
                  onClick={() => setLogoutOpen(false)}
                  disabled={leaving}
                >
                  Cancelar
                </Button>
                <Button onClick={logout} loading={leaving}>
                  Sair
                </Button>
              </>
            }
          >
            Você tem certeza que deseja sair do Dora?
          </Modal>
          <OnboardingTour
            open={tourOpen}
            name={user.name.split(" ")[0] ?? user.name}
            permissions={user.permissions}
            showAdmin={showAdmin}
            onFinish={finishTour}
            onMobileMenu={setMobileOpen}
          />
        </div>
      </PageTitleAddonProvider>
    </ViewerProvider>
  );
}
