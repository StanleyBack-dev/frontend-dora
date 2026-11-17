import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button, buttonClasses } from "@/design-system/components/Button";
import { ClearFiltersLink } from "@/design-system/components/ClearFiltersLink";
import { cn } from "@/design-system/utils/cn";

// "Filtrar" (submits the GET form) and "Limpar filtros" (back to the page
// without filters). Last cell of a FilterPanel grid. With an AutoFilterForm
// (autoSubmit) the form applies itself: only "Limpar filtros".
export function FilterActions({
  clearHref,
  hasActiveFilters,
  autoSubmit = false,
  className,
}: {
  clearHref: string;
  hasActiveFilters: boolean;
  /** The form applies itself (AutoFilterForm): no "Filtrar" button. */
  autoSubmit?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end gap-2", className)}>
      {!autoSubmit && (
        <Button
          type="submit"
          className="flex-1"
          icon={<Search className="size-4" />}
        >
          Filtrar
        </Button>
      )}
      {hasActiveFilters && autoSubmit ? (
        <ClearFiltersLink href={clearHref} className="flex-1" />
      ) : hasActiveFilters ? (
        <Link
          href={clearHref}
          className={cn(buttonClasses("secondary"), "flex-1")}
        >
          <X className="size-4" /> Limpar filtros
        </Link>
      ) : (
        <span
          aria-disabled
          className={cn(
            buttonClasses("secondary"),
            "pointer-events-none flex-1 opacity-50",
          )}
        >
          <X className="size-4" /> Limpar filtros
        </span>
      )}
    </div>
  );
}
