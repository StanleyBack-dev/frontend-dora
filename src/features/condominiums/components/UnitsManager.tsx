"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  DataTable,
  Drawer,
  EmptyState,
  Field,
  Modal,
  TextArea,
  type DataTableColumn,
} from "@/design-system";
import { condominiumsClient } from "@/features/condominiums/api/condominiums.client";
import type { Unit } from "@/shared/contracts/condominiums";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

type Editing = { mode: "create" } | { mode: "edit"; unit: Unit };

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

// Blocks and units of the condominium: created in batches ("101-104, 201"),
// renamed one by one, and deleted only while nobody is linked to them.
export function UnitsManager({
  units,
  editable,
  house = false,
}: {
  units: Unit[];
  /** UNITS_MANAGE: anyone else only sees the list. */
  editable: boolean;
  /** Houses: street, quadra (block) and lotes (numbers). */
  house?: boolean;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [removing, setRemoving] = useState<Unit | null>(null);
  const [street, setStreet] = useState("");
  const [block, setBlock] = useState("");
  const [numbers, setNumbers] = useState("");
  const [pending, setPending] = useState(false);

  const blocks = useMemo(
    () => new Set(units.map((unit) => unit.block)).size,
    [units],
  );

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

  const columns: DataTableColumn<Unit>[] = [
    {
      key: "label",
      label: "Unidade",
      mobile: "title",
      render: (unit) => (
        <span className="font-semibold text-fg">{unit.label}</span>
      ),
    },
    ...(house
      ? [
          {
            key: "street",
            label: "Rua",
            render: (unit: Unit) =>
              unit.street || <span className="text-soft">—</span>,
          },
        ]
      : []),
    {
      key: "block",
      label: house ? "Quadra" : "Bloco",
      render: (unit) => unit.block || <span className="text-soft">—</span>,
    },
    {
      key: "number",
      label: house ? "Lote" : "Número",
      render: (unit) => unit.number,
    },
    {
      key: "residents",
      label: "Moradores",
      mobile: "subtitle",
      render: (unit) =>
        unit.residents > 0 ? (
          plural(unit.residents, "morador", "moradores")
        ) : (
          <span className="text-soft">Nenhum</span>
        ),
    },
  ];
  if (editable) {
    columns.push({
      key: "actions",
      label: "",
      className: "w-24 text-right",
      mobile: "control",
      render: (unit) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(unit)}
            aria-label={`Editar ${unit.label}`}
            title="Editar"
            className="grid size-8 place-items-center rounded-md text-accent transition-colors hover:bg-accent-soft"
          >
            <Pencil aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setRemoving(unit)}
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
      ),
    });
  }

  const creating = editing?.mode === "create";

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {units.length > 0
            ? `${plural(units.length, house ? "casa" : "unidade", house ? "casas" : "unidades")}${blocks > 1 ? ` em ${blocks} ${house ? "quadras" : "blocos"}` : ""}`
            : "Nenhuma unidade cadastrada"}
        </p>
        {editable && (
          <Button onClick={openCreate} icon={<Plus className="size-4" />}>
            {house ? "Adicionar casas" : "Adicionar unidades"}
          </Button>
        )}
      </div>

      <Card>
        {units.length === 0 ? (
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
        ) : (
          <DataTable rows={units} columns={columns} getId={(unit) => unit.id} />
        )}
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
