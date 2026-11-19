"use client";

import { Search, X } from "lucide-react";
import { Button, FilterPanel, Select } from "@/design-system";
import {
  hasFilters,
  NO_FILTERS,
  type GateFilters as Filters,
  type GateOccasion,
} from "@/features/gate/model/gate-agenda";

// The gate's filters. The name search stays always in sight (what the gate
// uses most when someone has no QR); type, situation and which booking or
// event sit in the same collapsible panel as the other list pages. They
// filter on the spot: the gate holds the whole day, refreshed every minute.
export function GateFilters({
  filters,
  onChange,
  occasions,
  events,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  /** Every occasion of the day (the "which one" options). */
  occasions: GateOccasion[];
  /** The condominium has the events module. */
  events: boolean;
}) {
  const set = (change: Partial<Filters>) => onChange({ ...filters, ...change });
  const panelFilters =
    filters.kind !== "all" ||
    filters.status !== "all" ||
    filters.occasion !== "";

  return (
    <div className="space-y-3">
      <label className="relative block">
        <span className="sr-only">Buscar pessoa</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-soft"
        />
        <input
          type="search"
          value={filters.search}
          onChange={(event) => set({ search: event.target.value })}
          placeholder={
            events
              ? "Buscar por nome, documento, unidade, código ou evento…"
              : "Buscar por nome, documento, unidade ou código…"
          }
          className="h-12 w-full rounded-lg border border-border-strong bg-surface pr-3 pl-11 text-[15px] text-fg shadow-sm placeholder:text-soft focus:border-brand focus:ring-4 focus:ring-ring focus:outline-none"
        />
      </label>

      <FilterPanel hasActiveFilters={panelFilters} className="mb-0">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {events && (
            <Select
              label="Tipo"
              value={filters.kind}
              onChange={(event) =>
                set({
                  kind: event.target.value as Filters["kind"],
                  occasion: "",
                })
              }
              options={[
                { value: "all", label: "Reservas e eventos" },
                { value: "booking", label: "Só reservas" },
                { value: "event", label: "Só eventos" },
              ]}
            />
          )}
          <Select
            label="Situação"
            value={filters.status}
            onChange={(event) =>
              set({ status: event.target.value as Filters["status"] })
            }
            options={[
              { value: "all", label: "Todos" },
              { value: "waiting", label: "Aguardando entrada" },
              { value: "inside", label: "Já entraram" },
            ]}
          />
          <Select
            label={events ? "Reserva ou evento" : "Reserva"}
            value={filters.occasion}
            onChange={(event) => set({ occasion: event.target.value })}
            placeholder="Todos do dia"
            options={occasions
              .filter(
                (item) => filters.kind === "all" || item.kind === filters.kind,
              )
              .map((item) => ({
                value: item.key,
                label: `${item.slot.split(" às ")[0]} · ${item.title}`,
              }))}
          />
        </div>
        {hasFilters(filters) && (
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              icon={<X className="size-4" />}
              onClick={() => onChange(NO_FILTERS)}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </FilterPanel>
    </div>
  );
}
