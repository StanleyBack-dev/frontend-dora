"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronsUpDown,
  Globe,
  LayoutGrid,
  Loader2,
  Search,
} from "lucide-react";
import { cn } from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { condominiumsClient } from "@/features/condominiums/api/condominiums.client";
import type { SessionUser } from "@/shared/contracts/api";
import { ApiClientError } from "@/shared/lib/api-client";
import { startNavigation } from "@/shared/lib/navigation-progress";
import { useToast } from "@/shared/toast/useToast";

/** From this many condominiums on, the menu shows a search box. */
const SEARCH_FROM = 6;

// Lowercase without accents, so "goiania" finds "Goiânia".
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

type Props = {
  user: Pick<
    SessionUser,
    "condominium" | "condominiums" | "platformAdmin" | "group"
  >;
  /** Icon rail (collapsed desktop sidebar). */
  collapsed: boolean;
  onNavigate: () => void;
};

// The condominium the app is showing, at the top of the sidebar, and the
// ones the person can enter: their condominiums, or every one for the
// platform administrator (who can also go back to the platform view). The
// choice is remembered: the next login reopens it.
export function CondominiumSwitcher({ user, collapsed, onNavigate }: Props) {
  const router = useRouter();
  const { showError } = useToast();
  const [open, setOpen] = useState(false);
  // "platform": going back to the platform view.
  const [switching, setSwitching] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const current = user.condominium;
  const others = user.condominiums.filter((item) => item.id !== current?.id);
  const canOpen = others.length > 0 || user.platformAdmin;
  // Long lists (the platform administrator's) get a search box.
  const searchable = user.condominiums.length > SEARCH_FROM;
  const term = normalize(search);
  const listed = term
    ? user.condominiums.filter((item) =>
        normalize(`${item.name} ${item.city} ${item.state}`).includes(term),
      )
    : user.condominiums;

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setOpen(false);
      } else if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  async function switchTo(id: string | null) {
    setSwitching(id ?? "platform");
    try {
      await condominiumsClient.switchTo(id);
      setOpen(false);
      setSearch("");
      onNavigate();
      startNavigation();
      router.push("/inicio");
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível trocar de condomínio.",
      );
    }
    setSwitching(null);
  }

  const title = current?.name ?? "Nenhum condomínio";
  const subtitle = current
    ? user.platformAdmin
      ? "Acesso da plataforma"
      : `${GROUP_LABELS[user.group]} · ${current.city}/${current.state}`
    : user.platformAdmin
      ? "Visão da plataforma"
      : "Sem acesso a um condomínio";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => canOpen && setOpen((value) => !value)}
        aria-expanded={canOpen ? open : undefined}
        aria-haspopup={canOpen ? "menu" : undefined}
        title={collapsed ? title : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border border-chrome-line bg-chrome-top p-2.5 text-left transition-colors",
          canOpen ? "hover:bg-chrome-hover" : "cursor-default",
          collapsed && "lg:justify-center lg:p-2",
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-brand-fg">
          <Building2 aria-hidden className="size-[18px]" />
        </span>
        <span className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
          <span className="block truncate text-[13px] font-semibold text-chrome-fg">
            {title}
          </span>
          <span className="block truncate text-[11px] text-chrome-subtle">
            {subtitle}
          </span>
        </span>
        {canOpen && (
          <ChevronsUpDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-chrome-subtle",
              collapsed && "lg:hidden",
            )}
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full left-0 z-10 mt-2 w-full min-w-60 overflow-hidden rounded-2xl border border-chrome-line bg-chrome-top p-1.5 shadow-2xl",
          )}
        >
          {user.condominiums.length > 0 && (
            <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold tracking-[0.14em] text-chrome-subtle uppercase">
              {user.platformAdmin
                ? "Entrar em um condomínio"
                : "Seus condomínios"}
            </p>
          )}
          {searchable && (
            <label className="relative mx-1.5 mb-1.5 block">
              <span className="sr-only">Buscar condomínio</span>
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-chrome-subtle"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome ou cidade"
                className="h-8 w-full rounded-lg border border-chrome-line bg-transparent pr-2 pl-8 text-[13px] text-chrome-fg placeholder:text-chrome-subtle focus:border-brand focus:outline-none"
              />
            </label>
          )}
          <div className="max-h-72 overflow-y-auto">
            {searchable && listed.length === 0 && (
              <p className="px-3 py-3 text-[12px] text-chrome-subtle">
                Nenhum condomínio encontrado.
              </p>
            )}
            {listed.map((item) => {
              const active = item.id === current?.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  disabled={active || switching !== null}
                  onClick={() => switchTo(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                    active
                      ? "bg-chrome-hover"
                      : "hover:bg-chrome-hover disabled:opacity-60",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-chrome-fg">
                      {item.name}
                    </span>
                    <span className="block truncate text-[11px] text-chrome-subtle">
                      {user.platformAdmin
                        ? `${item.city}/${item.state}`
                        : `${GROUP_LABELS[item.role]} · ${item.city}/${item.state}`}
                    </span>
                  </span>
                  {switching === item.id ? (
                    <Loader2
                      aria-hidden
                      className="size-4 animate-spin text-brand"
                    />
                  ) : active ? (
                    <Check aria-hidden className="size-4 text-brand" />
                  ) : null}
                </button>
              );
            })}
          </div>
          {user.platformAdmin && current && (
            <button
              type="button"
              role="menuitem"
              disabled={switching !== null}
              onClick={() => switchTo(null)}
              className="mt-1 flex w-full items-center gap-3 rounded-xl border-t border-chrome-line px-3 py-2.5 text-left text-[13px] font-semibold text-chrome-fg transition-colors hover:bg-chrome-hover disabled:opacity-60"
            >
              {switching === "platform" ? (
                <Loader2
                  aria-hidden
                  className="size-4 animate-spin text-brand"
                />
              ) : (
                <Globe aria-hidden className="size-4 text-brand" />
              )}
              Visão da plataforma
            </button>
          )}
          {user.platformAdmin && (
            <Link
              href="/condominios"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onNavigate();
              }}
              className="mt-1 flex items-center gap-3 rounded-xl border-t border-chrome-line px-3 py-2.5 text-[13px] font-semibold text-chrome-fg transition-colors hover:bg-chrome-hover"
            >
              <LayoutGrid aria-hidden className="size-4 text-brand" />
              Todos os condomínios
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
