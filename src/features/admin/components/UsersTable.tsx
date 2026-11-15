"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import {
  Avatar,
  DataTable,
  LinkPendingSwap,
  type DataTableColumn,
} from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { CopyShareValue } from "@/features/admin/components/CopyShareValue";
import { UserStatusBadges } from "@/features/admin/components/UserStatusBadges";
import { auditColumn } from "@/features/audit/components/RecordAudit";
import type { UserAccount } from "@/shared/contracts/api";
import { formatDateTime } from "@/shared/lib/format";
import { formatPhone } from "@/shared/lib/masks";

// Residents of the condominium (table with the audit column): photo, where
// they live, contact and access. The pencil (first column; on phones next to
// the name) opens the person's page.
export function UsersTable({
  users,
  basePath = "/moradores",
}: {
  users: UserAccount[];
  /** The list it is in (Moradores or Equipe): the edit link opens there. */
  basePath?: string;
}) {
  const audit = auditColumn((user: UserAccount) => ({
    entity: "user" as const,
    id: user.id,
    label: user.name,
    createdAt: user.createdAt,
  }));
  const columns: DataTableColumn<UserAccount>[] = [
    {
      key: "edit",
      label: "",
      className: "w-12 pr-0",
      mobile: "control",
      render: (user) => (
        <Link
          href={`${basePath}/${user.id}`}
          aria-label={`Editar ${user.name}`}
          title="Editar usuário"
          className="grid size-8 place-items-center rounded-md text-accent transition-colors hover:bg-accent-soft"
        >
          {/* The page takes a moment: the pencil turns into a spinner. */}
          <LinkPendingSwap>
            <Pencil aria-hidden className="size-4" />
          </LinkPendingSwap>
        </Link>
      ),
    },
    {
      key: "name",
      label: "Nome",
      mobile: "title",
      render: (user) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={user.name} src={user.photoUrl} size="sm" />
          <span className="font-medium text-fg">{user.name}</span>
        </span>
      ),
    },
    {
      key: "unit",
      label: "Unidade",
      render: (user) =>
        user.unitLabel || user.unitComplement ? (
          <span className="flex flex-col">
            <span className="whitespace-nowrap">
              {user.unitLabel ?? "Sem unidade"}
            </span>
            {user.unitComplement && (
              <span className="text-xs text-soft">{user.unitComplement}</span>
            )}
          </span>
        ) : (
          <span className="text-soft">—</span>
        ),
    },
    {
      key: "phone",
      label: "Telefone",
      className: "whitespace-nowrap",
      render: (user) =>
        user.phone ? (
          <CopyShareValue
            value={formatPhone(user.phone)}
            label="Telefone"
            share={false}
          />
        ) : (
          <span className="text-soft">—</span>
        ),
    },
    {
      key: "username",
      label: "Usuário",
      render: (user) => (
        <CopyShareValue value={user.username} label="Usuário" />
      ),
    },
    {
      key: "email",
      label: "E-mail",
      render: (user) => <CopyShareValue value={user.email} label="E-mail" />,
    },
    {
      key: "group",
      label: "Papel",
      render: (user) => GROUP_LABELS[user.group],
    },
    {
      key: "status",
      label: "Situação",
      render: (user) => <UserStatusBadges user={user} />,
    },
    {
      key: "lastLogin",
      label: "Último acesso",
      className: "whitespace-nowrap",
      render: (user) =>
        user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Nunca",
    },
  ];

  return (
    <DataTable
      rows={users}
      columns={[...columns, audit.column]}
      getId={(user) => user.id}
      renderExpanded={audit.renderExpanded}
    />
  );
}
