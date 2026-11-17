"use client";

import { useMemo, useState } from "react";
import { Search, UsersRound } from "lucide-react";
import {
  Badge,
  Card,
  DataTable,
  EmptyState,
  cn,
  type DataTableColumn,
} from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import type { CondominiumMember } from "@/shared/contracts/platform";
import { formatRelative } from "@/shared/lib/format";
import { formatPhone } from "@/shared/lib/masks";

type Filter = "all" | "ADMIN" | "CONCIERGE" | "USER";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "ADMIN", label: "Gestão" },
  { value: "CONCIERGE", label: "Portaria" },
  { value: "USER", label: "Moradores" },
];

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// The people of a condominium for the platform: by role, with a search, and
// what tells them apart (unit, job, last access). Read-only: changes are
// made inside the condominium (Gestão).
export function CondominiumMembersPanel({
  members,
}: {
  members: CondominiumMember[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const active = members.filter((member) => member.active);
    return {
      all: active.length,
      ADMIN: active.filter((member) => member.role === "ADMIN").length,
      CONCIERGE: active.filter((member) => member.role === "CONCIERGE").length,
      USER: active.filter((member) => member.role === "USER").length,
    } satisfies Record<Filter, number>;
  }, [members]);

  const rows = useMemo(() => {
    const term = normalize(search);
    return members.filter(
      (member) =>
        (filter === "all" || member.role === filter) &&
        (!term ||
          normalize(
            `${member.name} ${member.email} ${member.username} ${member.unitLabel ?? ""} ${member.jobTitle ?? ""}`,
          ).includes(term)),
    );
  }, [members, filter, search]);

  const columns: DataTableColumn<CondominiumMember>[] = [
    {
      key: "name",
      label: "Pessoa",
      mobile: "title",
      render: (member) => (
        <span className={cn("flex flex-col", !member.active && "opacity-60")}>
          <span className="font-semibold text-fg">{member.name}</span>
          <span className="text-xs text-soft">{member.email}</span>
        </span>
      ),
    },
    {
      key: "role",
      label: "Papel",
      mobile: "subtitle",
      render: (member) => (
        <span className="flex flex-wrap gap-1">
          <Badge tone={member.role === "ADMIN" ? "brand" : "neutral"}>
            {GROUP_LABELS[member.role]}
          </Badge>
          {!member.active && <Badge tone="danger">Sem acesso</Badge>}
        </span>
      ),
    },
    {
      key: "where",
      label: "Unidade ou cargo",
      render: (member) =>
        member.unitLabel ??
        member.jobTitle ?? <span className="text-soft">—</span>,
    },
    {
      key: "phone",
      label: "Telefone",
      render: (member) =>
        member.phone ? (
          formatPhone(member.phone)
        ) : (
          <span className="text-soft">—</span>
        ),
    },
    {
      key: "last",
      label: "Último acesso",
      render: (member) =>
        member.lastLoginAt ? (
          formatRelative(member.lastLoginAt)
        ) : (
          <span className="text-soft">Nunca entrou</span>
        ),
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Papel"
          className="flex flex-wrap gap-1.5"
        >
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === item.value
                  ? "border-brand bg-brand text-brand-fg"
                  : "border-border text-muted hover:bg-surface-muted hover:text-fg",
              )}
            >
              {item.label} · {counts[item.value]}
            </button>
          ))}
        </div>
        <label className="relative block sm:w-72">
          <span className="sr-only">Buscar pessoa</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-soft"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, e-mail, unidade…"
            className="h-10 w-full rounded-lg border border-border bg-surface pr-3 pl-9 text-sm text-fg placeholder:text-soft focus:border-brand focus:outline-none"
          />
        </label>
      </div>
      <Card>
        {rows.length === 0 ? (
          <EmptyState
            icon={<UsersRound className="size-5" />}
            title={search ? "Ninguém encontrado" : "Ninguém aqui ainda"}
            description={
              search
                ? "Tente outro nome, e-mail ou unidade."
                : "As pessoas aparecem quando forem cadastradas no condomínio."
            }
          />
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            getId={(member) => member.userId}
          />
        )}
      </Card>
    </section>
  );
}
