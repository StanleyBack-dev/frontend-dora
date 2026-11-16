"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Pencil } from "lucide-react";
import { Avatar, LinkPendingSwap, buttonClasses, cn } from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { CopyShareValue } from "@/features/admin/components/CopyShareValue";
import { UserStatusBadges } from "@/features/admin/components/UserStatusBadges";
import { RecordAuditButton } from "@/features/audit/components/RecordAudit";
import type { MemberKind, UserAccount } from "@/shared/contracts/api";
import { formatDateTime } from "@/shared/lib/format";
import { formatPhone } from "@/shared/lib/masks";

/** "2024-02-29" → "29/02/2024" (a calendar date: no time zone shift). */
const formatDay = (day: string | null) =>
  day ? day.split("-").reverse().join("/") : null;

/** Where the person is: the unit (residents) or the job (employees). */
function placeOf(user: UserAccount): string {
  if (user.kind === "EMPLOYEE") {
    return user.employee?.jobTitle ?? "Sem cargo";
  }
  return user.unitLabel ?? "Sem unidade";
}

// The members of a page (Moradores or Equipe) as a folding list: closed, a
// row shows who the person is (photo, name, role, unit or job, status);
// open, everything else in a grid. No table, so no sideways scroll, and the
// page stays short.
export function MembersList({
  users,
  basePath,
  kind,
}: {
  users: UserAccount[];
  /** The list it is in: the edit link opens there. */
  basePath: string;
  kind: MemberKind;
}) {
  return (
    <ul className="divide-y divide-border">
      {users.map((user) => (
        <MemberRow key={user.id} user={user} basePath={basePath} kind={kind} />
      ))}
    </ul>
  );
}

function MemberRow({
  user,
  basePath,
  kind,
}: {
  user: UserAccount;
  basePath: string;
  kind: MemberKind;
}) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const employee = user.kind === "EMPLOYEE" ? user.employee : null;

  return (
    <li>
      {/* The pencil sits in the row, apart from the folding button (a link
      can't go inside a button). */}
      <div className="flex items-center pl-2 transition-colors hover:bg-surface-muted sm:pl-3">
        <Link
          href={`${basePath}/${user.id}`}
          aria-label={`Editar ${user.name}`}
          title="Editar"
          className="grid size-8 shrink-0 place-items-center rounded-md text-accent transition-colors hover:bg-accent-soft"
        >
          {/* The page takes a moment: the pencil turns into a spinner. */}
          <LinkPendingSwap>
            <Pencil aria-hidden className="size-4" />
          </LinkPendingSwap>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex min-w-0 flex-1 items-center gap-3 py-3 pr-4 pl-2 text-left sm:pr-5"
        >
          <Avatar name={user.name} src={user.photoUrl} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-fg">
              {user.name}
            </span>
            <span className="block truncate text-xs text-soft">
              {GROUP_LABELS[user.group]} · {placeOf(user)}
              {/* Someone of the other tie (from before the split). */}
              {user.kind !== kind &&
                (user.kind === "EMPLOYEE" ? " · Funcionário" : " · Morador")}
            </span>
          </span>
          <span className="hidden shrink-0 sm:block">
            <UserStatusBadges user={user} />
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-soft transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </div>

      <div
        id={bodyId}
        hidden={!open}
        className="space-y-4 border-t border-border bg-surface-muted/60 px-4 py-4 sm:px-5"
      >
        <div className="sm:hidden">
          <UserStatusBadges user={user} />
        </div>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <Item label="Telefone">
            {user.phone ? (
              <CopyShareValue
                value={formatPhone(user.phone)}
                label="Telefone"
                share={false}
              />
            ) : null}
          </Item>
          <Item label="E-mail">
            <CopyShareValue value={user.email} label="E-mail" />
          </Item>
          <Item label="Usuário (login)">
            <CopyShareValue value={user.username} label="Usuário" />
          </Item>
          {employee ? (
            <>
              <Item label="Cargo">{employee.jobTitle}</Item>
              <Item label="Empresa terceirizada">{employee.contractor}</Item>
              <Item label="Admissão">{formatDay(employee.hiredOn)}</Item>
              <Item label="Turno / jornada">{employee.workShift}</Item>
            </>
          ) : (
            <>
              <Item label="Unidade">{user.unitLabel}</Item>
              <Item label="Complemento">{user.unitComplement}</Item>
            </>
          )}
          <Item label="Papel">{GROUP_LABELS[user.group]}</Item>
          <Item label="Último acesso">
            {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Nunca"}
          </Item>
          <Item label="Cadastrado em">{formatDateTime(user.createdAt)}</Item>
        </dl>
        <div className="flex flex-wrap items-center gap-2">
          <RecordAuditButton
            labeled
            entity="user"
            id={user.id}
            label={user.name}
            createdAt={user.createdAt}
          />
        </div>
      </div>
    </li>
  );
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-soft">{label}</dt>
      <dd className="mt-0.5 text-sm break-words text-fg">
        {children ?? <span className="text-soft">—</span>}
      </dd>
    </div>
  );
}
