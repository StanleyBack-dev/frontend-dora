import Link from "next/link";
import { cn } from "@/design-system";
import type { Area, AreaId } from "@/features/layout/model/navigation";

// The areas this person works in (Meu condomínio, Gestão, Plataforma), at
// the top of the sidebar: each opens its own menu. Hidden with a single one.
export function AreaSwitcher({
  areas,
  current,
  collapsed,
  onNavigate,
}: {
  areas: Area[];
  current: AreaId;
  /** Icon rail (collapsed desktop sidebar). */
  collapsed: boolean;
  onNavigate: () => void;
}) {
  if (areas.length < 2) return null;
  return (
    <nav
      aria-label="Áreas"
      data-tour="areas"
      className="flex flex-col gap-0.5 rounded-2xl border border-chrome-line bg-chrome-top p-1"
    >
      {areas.map((area) => {
        const Icon = area.icon;
        const active = area.id === current;
        return (
          <Link
            key={area.id}
            href={area.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? area.label : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors",
              collapsed && "lg:justify-center lg:px-0",
              active
                ? "bg-chrome-hover text-chrome-fg"
                : "text-chrome-muted hover:bg-chrome-hover hover:text-chrome-fg",
            )}
          >
            <Icon
              aria-hidden
              className={cn(
                "size-4 shrink-0",
                active ? "text-brand" : "text-chrome-subtle",
              )}
            />
            <span className={cn("truncate", collapsed && "lg:sr-only")}>
              {area.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
