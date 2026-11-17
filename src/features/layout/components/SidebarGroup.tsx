import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/design-system";
import type { NavItem, NavSection } from "@/features/layout/model/navigation";

// A group of the sidebar (Condomínio, Reservas, Eventos, Administração do
// Dora): a header that folds its pages in and out, like the admin consoles.
// The pages sit indented on a guide line, without icons. On the icon rail
// there is no room for the pages: the header is the group's icon, opening
// its first page.
export function SidebarGroup({
  group,
  open,
  onToggle,
  activeItem,
  collapsed,
  onNavigate,
}: {
  group: NavSection;
  open: boolean;
  onToggle: () => void;
  /** The menu entry of the page on the screen (lit). */
  activeItem: NavItem | undefined;
  /** Icon rail (collapsed desktop sidebar). */
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const Icon = group.icon;
  const current = group.items.some((item) => item === activeItem);
  const panelId = `nav-group-${group.id}`;

  return (
    <div>
      {/* The icon rail: the group's icon opens its first page. */}
      <Link
        href={group.items[0].href}
        onClick={onNavigate}
        title={group.label}
        aria-label={group.label}
        className={cn(
          "hidden w-full justify-center rounded-full py-2.5 transition-colors",
          collapsed && "lg:flex",
          current
            ? "bg-brand text-brand-fg"
            : "text-chrome-subtle hover:bg-chrome-hover hover:text-chrome-fg",
        )}
      >
        <Icon aria-hidden className="size-[18px]" />
      </Link>

      <div className={cn(collapsed && "lg:hidden")}>
        <button
          type="button"
          onClick={onToggle}
          data-tour-nav={group.items[0].href}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn(
            "group flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-[13px] font-semibold transition-colors",
            current && !open
              ? "text-chrome-fg"
              : "text-chrome-muted hover:bg-chrome-hover hover:text-chrome-fg",
          )}
        >
          <Icon
            aria-hidden
            className={cn(
              "size-[18px] shrink-0",
              current
                ? "text-brand"
                : "text-chrome-subtle group-hover:text-brand",
            )}
          />
          <span className="flex-1 truncate text-left">{group.label}</span>
          <ChevronRight
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-chrome-subtle transition-transform",
              open && "rotate-90",
            )}
          />
        </button>
        {open && (
          <ul
            id={panelId}
            className="mt-0.5 mb-1 ml-[25px] space-y-0.5 border-l border-chrome-line pl-3"
          >
            {group.items.map((item) => {
              const active = item === activeItem;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    data-tour-nav={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block truncate rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-brand text-brand-fg"
                        : "text-chrome-muted hover:bg-chrome-hover hover:text-chrome-fg",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
