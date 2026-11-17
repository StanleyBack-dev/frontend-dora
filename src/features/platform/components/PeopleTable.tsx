"use client";

import Link from "next/link";
import { Badge, DataTable, cn, type DataTableColumn } from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import type { PlatformPerson } from "@/shared/contracts/platform";
import { formatDateTime, formatRelative } from "@/shared/lib/format";

// Everyone with an account (Plataforma, Pessoas): who they are, where they
// have access (each condominium opens its page) and how the account is.
export function PeopleTable({
  people,
  now,
}: {
  people: PlatformPerson[];
  /** The request time (a block that already passed is not shown). */
  now: number;
}) {
  const columns: DataTableColumn<PlatformPerson>[] = [
    {
      key: "name",
      label: "Pessoa",
      mobile: "title",
      render: (person) => (
        <span className={cn("flex flex-col", !person.active && "opacity-60")}>
          <span className="font-semibold text-fg">{person.name}</span>
          <span className="text-xs text-soft">
            {person.email} · {person.username}
          </span>
        </span>
      ),
    },
    {
      key: "access",
      label: "Acesso",
      mobile: "subtitle",
      render: (person) => (
        <span className="flex flex-wrap gap-1">
          {person.platformAdmin && <Badge tone="brand">Plataforma</Badge>}
          {person.memberships.map((membership) => (
            <Link
              key={membership.condominiumId}
              href={`/administracao/condominios/${membership.condominiumId}`}
              className={cn(
                "rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-fg transition-colors hover:border-brand-border hover:bg-brand-soft",
                !membership.active && "line-through opacity-60",
              )}
              title={membership.active ? undefined : "Sem acesso"}
            >
              {membership.condominiumName} · {GROUP_LABELS[membership.role]}
            </Link>
          ))}
          {!person.platformAdmin && person.memberships.length === 0 && (
            <span className="text-xs text-soft">Nenhum condomínio</span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      label: "Conta",
      render: (person) =>
        !person.active ? (
          <Badge tone="danger">Desativada</Badge>
        ) : person.lockedUntil &&
          new Date(person.lockedUntil).getTime() > now ? (
          <Badge tone="warning">
            Bloqueada até {formatDateTime(person.lockedUntil)}
          </Badge>
        ) : (
          <Badge tone="success">Ativa</Badge>
        ),
    },
    {
      key: "last",
      label: "Último acesso",
      render: (person) =>
        person.lastLoginAt ? (
          formatRelative(person.lastLoginAt)
        ) : (
          <span className="text-soft">Nunca entrou</span>
        ),
    },
  ];

  return (
    <DataTable rows={people} columns={columns} getId={(person) => person.id} />
  );
}
