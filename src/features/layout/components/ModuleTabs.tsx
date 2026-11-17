import Link from "next/link";
import { cn } from "@/design-system";
import type {
  ManageModule,
  ManageModuleId,
} from "@/features/layout/model/navigation";

/** Tailwind needs the class names written out. */
const COLUMNS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
};

// The management's modules (Geral, Reservas, Eventos…) as tabs: picking one
// shows only its menu below. Each opens its first page this person can see.
export function ModuleTabs({
  modules,
  current,
  collapsed,
  onNavigate,
}: {
  modules: ManageModule[];
  current: ManageModuleId;
  /** Icon rail (collapsed desktop sidebar). */
  collapsed: boolean;
  onNavigate: () => void;
}) {
  if (modules.length < 2) return null;
  return (
    <nav
      aria-label="Módulos"
      data-tour="modules"
      // Equal widths, one row (up to three modules fit the sidebar).
      className={cn(
        "grid gap-1 px-1",
        COLUMNS[Math.min(modules.length, 3)],
        collapsed && "lg:grid-cols-1",
      )}
    >
      {modules.map((item) => {
        const Icon = item.icon;
        const active = item.id === current;
        return (
          <Link
            key={item.id}
            href={item.items[0].href}
            onClick={onNavigate}
            aria-current={active ? "true" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex min-w-0 items-center justify-center gap-1 rounded-full border px-1.5 py-1 text-[11px] font-semibold transition-colors",
              collapsed && "lg:justify-center lg:px-0 lg:py-2",
              active
                ? "border-brand bg-brand text-brand-fg"
                : "border-chrome-line text-chrome-muted hover:bg-chrome-hover hover:text-chrome-fg",
            )}
          >
            {/* The icon only on the icon rail: three names fill the row. */}
            <Icon
              aria-hidden
              className={cn(
                "hidden size-3.5 shrink-0",
                collapsed && "lg:block",
              )}
            />
            <span className={cn("truncate", collapsed && "lg:sr-only")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
