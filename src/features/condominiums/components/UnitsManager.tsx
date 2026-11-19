"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building,
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  Field,
  LinkPending,
  Modal,
  TextArea,
  cn,
} from "@/design-system";
import { GROUP_LABELS } from "@/features/access/model/access-labels";
import { condominiumsClient } from "@/features/condominiums/api/condominiums.client";
import type {
  Unit,
  UnitResident,
  UnitWithResidents,
} from "@/shared/contracts/condominiums";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatPhone } from "@/shared/lib/masks";
import { useToast } from "@/shared/toast/useToast";

type Editing = { mode: "create" } | { mode: "edit"; unit: Unit };

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

// Blocks and units of the condominium (Gestão > Unidades): a page of units
// as a folding list (closed, the unit and how many live there; open, the
// people linked to it, inline), created in batches ("101-104, 201"),
// renamed one by one, and deleted only while nobody is linked to them.
export function UnitsManager({
  units,
  total,
  filtered,
  editable,
  house = false,
  pagination,
}: {
  /** This page of units (filtered by the API), with their people. */
  units: UnitWithResidents[];
  /** Units of the condominium, whatever the filters (the empty state). */
  total: number;
  /** Some filter is on. */
  filtered: boolean;
  /** UNITS_MANAGE: anyone else only sees the list. */
  editable: boolean;
  /** Houses: street, quadra (block) and lotes (numbers). */
  house?: boolean;
  /** The page's pagination (built by the page). */
  pagination: ReactNode;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [removing, setRemoving] = useState<Unit | null>(null);
  const [street, setStreet] = useState("");
  const [block, setBlock] = useState("");
  const [numbers, setNumbers] = useState("");
  const [pending, setPending] = useState(false);

  function openCreate() {
    setStreet("");
    setBlock("");
    setNumbers("");
    setEditing({ mode: "create" });
  }

  function openEdit(unit: Unit) {
    setStreet(unit.street);
    setBlock(unit.block);
    setNumbers(unit.number);
    setEditing({ mode: "edit", unit });
  }

  const fail = (cause: unknown, fallback: string) =>
    showError(cause instanceof ApiClientError ? cause.message : fallback);

  async function save() {
    if (!editing) return;
    setPending(true);
    try {
      if (editing.mode === "create") {
        const created = await condominiumsClient.createUnits({
          street: house ? street : null,
          block: block || null,
          numbers,
        });
        showSuccess(
          `${plural(created.length, "unidade criada", "unidades criadas")}.`,
        );
      } else {
        await condominiumsClient.updateUnit(editing.unit.id, {
          street: house ? street : null,
          block: block || null,
          number: numbers,
        });
        showSuccess("Unidade atualizada.");
      }
      setEditing(null);
      router.refresh();
    } catch (cause) {
      fail(cause, "Não foi possível salvar.");
    }
    setPending(false);
  }

  async function remove() {
    if (!removing) return;
    setPending(true);
    try {
      await condominiumsClient.deleteUnit(removing.id);
      showSuccess(`Unidade ${removing.label} excluída.`);
      setRemoving(null);
      router.refresh();
    } catch (cause) {
      fail(cause, "Não foi possível excluir.");
    }
    setPending(false);
  }

  const creating = editing?.mode === "create";

  return (
    <>
      {editable && (
        <div className="mb-4 flex justify-end">
          <Button onClick={openCreate} icon={<Plus className="size-4" />}>
            {house ? "Adicionar casas" : "Adicionar unidades"}
          </Button>
        </div>
      )}

      <Card>
        {total === 0 ? (
          <EmptyState
            icon={<Building className="size-5" />}
            title={
              house
                ? "Nenhuma casa cadastrada ainda"
                : "Cadastre as unidades do condomínio"
            }
            description={
              house
                ? "No link de cadastro, cada morador digita a rua, a quadra e o lote; ao aprovar, a casa entra aqui sozinha. Você também pode cadastrar antes."
                : "Moradores ficam vinculados a uma unidade, e o link de cadastro pede que cada pessoa escolha a sua."
            }
          />
        ) : units.length === 0 ? (
          <EmptyState
            icon={<Building className="size-5" />}
            title={filtered ? "Nenhuma unidade encontrada" : "Nenhuma unidade"}
            description={filtered ? "Tente outros filtros." : undefined}
          />
        ) : (
          <ul className="divide-y divide-border">
            {units.map((unit) => (
              <UnitRow
                key={unit.id}
                unit={unit}
                house={house}
                editable={editable}
                onEdit={() => openEdit(unit)}
                onRemove={() => setRemoving(unit)}
              />
            ))}
          </ul>
        )}
        {total > 0 && pagination}
      </Card>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={
          creating
            ? house
              ? "Adicionar casas"
              : "Adicionar unidades"
            : house
              ? "Editar casa"
              : "Editar unidade"
        }
        busy={pending}
        footer={
          <>
            <Button
              variant="cancel"
              onClick={() => setEditing(null)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              onClick={save}
              loading={pending}
              disabled={
                !numbers.trim() || (house && (!street.trim() || !block.trim()))
              }
            >
              {creating ? (house ? "Criar casas" : "Criar unidades") : "Salvar"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {house && (
            <Field
              label="Rua"
              required
              value={street}
              maxLength={80}
              placeholder="Ex.: Rua das Flores"
              onChange={(event) => setStreet(event.target.value)}
            />
          )}
          {house ? (
            <Field
              label="Quadra"
              required
              value={block}
              maxLength={30}
              placeholder="Ex.: 3"
              onChange={(event) => setBlock(event.target.value)}
            />
          ) : (
            <div>
              <Field
                label="Bloco ou torre"
                value={block}
                maxLength={30}
                placeholder="Ex.: Bloco A, Torre 1"
                onChange={(event) => setBlock(event.target.value)}
              />
              <p className="mt-1.5 text-xs text-soft">
                Deixe em branco se o condomínio não tem blocos (casas, prédio
                único).
              </p>
            </div>
          )}
          {creating ? (
            <div>
              <TextArea
                label={house ? "Lotes" : "Números"}
                required
                rows={4}
                value={numbers}
                placeholder={house ? "1-20, 25" : "101-104, 201-204"}
                onChange={(event) => setNumbers(event.target.value)}
              />
              <p className="mt-1.5 text-xs text-soft">
                {house
                  ? "Separe por vírgula ou por linha. Faixas como 1-20 criam todos os lotes do intervalo nesta rua e quadra (até 500 por vez)."
                  : "Separe por vírgula ou por linha. Faixas como 101-110 criam todas as unidades do intervalo (até 500 por vez)."}
              </p>
            </div>
          ) : (
            <Field
              label={house ? "Lote" : "Número"}
              required
              value={numbers}
              maxLength={20}
              onChange={(event) => setNumbers(event.target.value)}
            />
          )}
        </div>
      </Drawer>

      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Excluir unidade"
        tone="danger"
        busy={pending}
        footer={
          <>
            <Button
              variant="cancel"
              onClick={() => setRemoving(null)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={remove} loading={pending}>
              Excluir
            </Button>
          </>
        }
      >
        A unidade <strong>{removing?.label}</strong> será excluída. Esta ação
        não pode ser desfeita.
      </Modal>
    </>
  );
}

/** One unit: closed, where it is and how many live there; open, its people. */
function UnitRow({
  unit,
  house,
  editable,
  onEdit,
  onRemove,
}: {
  unit: UnitWithResidents;
  house: boolean;
  editable: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const place = house
    ? [unit.street, unit.block && `Quadra ${unit.block}`, `Lote ${unit.number}`]
    : [unit.block && `Bloco ${unit.block}`, `Número ${unit.number}`];

  return (
    <li>
      <div className="flex items-center transition-colors hover:bg-surface-muted">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex min-w-0 flex-1 items-center gap-3 py-3 pr-2 pl-3 text-left sm:pl-4"
        >
          {/* The folding arrow comes first, apart from the edit actions. */}
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-soft transition-transform",
              open && "rotate-180",
            )}
          />
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-ink ring-1 ring-brand-border">
            <Building aria-hidden className="size-4" />
          </span>
          {/* Nothing is cut on phones: the texts wrap and the badge goes
          below them; from sm up it sits at the end of the line. */}
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold break-words text-fg sm:truncate">
              {unit.label}
            </span>
            <span className="block text-xs break-words text-soft sm:truncate">
              {place.filter(Boolean).join(" · ")}
            </span>
            <span className="mt-1.5 block sm:hidden">
              <ResidentsBadge count={unit.residents} />
            </span>
          </span>
          <span className="hidden shrink-0 sm:block">
            <ResidentsBadge count={unit.residents} />
          </span>
        </button>
        {editable && (
          <div className="flex shrink-0 gap-1 pr-3 sm:pr-4">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Editar ${unit.label}`}
              title="Editar"
              className="grid size-8 place-items-center rounded-md text-accent transition-colors hover:bg-accent-soft"
            >
              <Pencil aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={unit.residents > 0}
              aria-label={`Excluir ${unit.label}`}
              title={
                unit.residents > 0
                  ? "Tem moradores vinculados: mude a unidade deles antes"
                  : "Excluir"
              }
              className="grid size-8 place-items-center rounded-md text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Trash2 aria-hidden className="size-4" />
            </button>
          </div>
        )}
      </div>

      <div
        id={bodyId}
        hidden={!open}
        className="space-y-1.5 border-t border-border bg-surface-muted/60 px-4 py-4 sm:px-5"
      >
        <h3 className="text-[10px] font-medium tracking-wide text-soft uppercase">
          Moradores ({unit.people.length})
        </h3>
        {unit.people.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border-strong bg-surface px-3 py-3 text-sm text-muted">
            Ninguém vinculado a esta unidade.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
            {unit.people.map((person) => (
              <ResidentRow key={person.userId} person={person} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

/** How many live in the unit ("Vazia" when nobody). */
function ResidentsBadge({ count }: { count: number }) {
  return count > 0 ? (
    <Badge tone="success">{plural(count, "morador", "moradores")}</Badge>
  ) : (
    <Badge tone="neutral">Vazia</Badge>
  );
}

/** Someone linked to the unit, on one line from md up. */
function ResidentRow({ person }: { person: UnitResident }) {
  return (
    <li className="flex flex-col gap-1.5 px-3 py-2.5 md:flex-row md:items-center md:gap-4">
      <div className="flex min-w-0 items-center gap-2 md:w-56 md:shrink-0">
        <UserRound aria-hidden className="size-4 shrink-0 text-soft" />
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate text-[13px] font-medium",
              person.active ? "text-fg" : "text-muted",
            )}
          >
            {person.name}
          </span>
          <span className="block truncate text-xs text-soft">
            {GROUP_LABELS[person.role]}
          </span>
        </span>
      </div>
      <span className="min-w-0 truncate text-[13px] text-muted md:w-36 md:shrink-0">
        {person.phone ? formatPhone(person.phone) : "Sem telefone"}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-muted">
        {person.email}
      </span>
      <div className="flex items-center gap-2">
        <Badge tone={person.active ? "success" : "neutral"}>
          {person.active ? "Ativo" : "Desativado"}
        </Badge>
        {/* A spinner right away while the resident's page opens, so the
        link is not clicked again. */}
        <Link
          href={`/gestao/moradores/${person.userId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-ink hover:underline"
        >
          Ver cadastro
          <LinkPending />
        </Link>
      </div>
    </li>
  );
}
