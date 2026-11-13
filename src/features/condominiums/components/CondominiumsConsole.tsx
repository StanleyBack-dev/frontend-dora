"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, LogIn, Pencil, Plus, Power, PowerOff } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  DataTable,
  Drawer,
  EmptyState,
  Field,
  Modal,
  Select,
  type DataTableColumn,
} from "@/design-system";
import { condominiumsClient } from "@/features/condominiums/api/condominiums.client";
import type {
  Condominium,
  CondominiumInput,
} from "@/shared/contracts/condominiums";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatNumber, formatRelative } from "@/shared/lib/format";
import { maskCnpj } from "@/shared/lib/masks";
import { useToast } from "@/shared/toast/useToast";

const STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const EMPTY: CondominiumInput = { name: "", document: "", city: "", state: "" };

type Editing = { mode: "create" } | { mode: "edit"; condominium: Condominium };

// The platform console: every condominium using Dora, with its numbers.
// The Dora administration creates, edits, suspends and enters each one.
export function CondominiumsConsole({
  condominiums,
  currentId,
  filtered,
}: {
  condominiums: Condominium[];
  /** The condominium the session is working in (highlighted). */
  currentId: string | null;
  /** Search or status filter applied (changes the empty message). */
  filtered: boolean;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [form, setForm] = useState<CondominiumInput>(EMPTY);
  const [toggling, setToggling] = useState<Condominium | null>(null);
  const [entering, setEntering] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const fail = (cause: unknown, fallback: string) =>
    showError(cause instanceof ApiClientError ? cause.message : fallback);
  const set = <K extends keyof CondominiumInput>(
    key: K,
    value: CondominiumInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  function openCreate() {
    setForm(EMPTY);
    setEditing({ mode: "create" });
  }

  function openEdit(condominium: Condominium) {
    setForm({
      name: condominium.name,
      document: condominium.document ? maskCnpj(condominium.document) : "",
      city: condominium.city,
      state: condominium.state,
    });
    setEditing({ mode: "edit", condominium });
  }

  async function save() {
    if (!editing) return;
    setPending(true);
    const input = { ...form, document: form.document || null };
    try {
      if (editing.mode === "create") {
        const created = await condominiumsClient.create(input);
        showSuccess(`${created.name} cadastrado.`);
      } else {
        await condominiumsClient.update(editing.condominium.id, input);
        showSuccess("Dados salvos.");
      }
      setEditing(null);
      router.refresh();
    } catch (cause) {
      fail(cause, "Não foi possível salvar.");
    }
    setPending(false);
  }

  async function toggleStatus() {
    if (!toggling) return;
    setPending(true);
    const next = toggling.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await condominiumsClient.setStatus(toggling.id, next);
      showSuccess(
        next === "ACTIVE"
          ? `${toggling.name} reativado.`
          : `${toggling.name} suspenso.`,
      );
      setToggling(null);
      router.refresh();
    } catch (cause) {
      fail(cause, "Não foi possível alterar a situação.");
    }
    setPending(false);
  }

  async function enter(condominium: Condominium) {
    setEntering(condominium.id);
    try {
      await condominiumsClient.switchTo(condominium.id);
      router.push("/inicio");
      router.refresh();
    } catch (cause) {
      fail(cause, "Não foi possível entrar no condomínio.");
      setEntering(null);
    }
  }

  const columns: DataTableColumn<Condominium>[] = [
    {
      key: "name",
      label: "Condomínio",
      mobile: "title",
      render: (item) => (
        <span className="flex flex-col">
          <span className="font-semibold text-fg">
            {item.name}
            {item.id === currentId && (
              <Badge tone="brand" className="ml-2 align-middle">
                Aberto agora
              </Badge>
            )}
          </span>
          <span className="text-xs text-soft">
            {item.city}/{item.state}
          </span>
        </span>
      ),
    },
    {
      key: "status",
      label: "Situação",
      mobile: "subtitle",
      render: (item) =>
        item.status === "ACTIVE" ? (
          <Badge tone="success">Ativo</Badge>
        ) : (
          <Badge tone="danger">Suspenso</Badge>
        ),
    },
    {
      key: "members",
      label: "Membros ativos",
      className: "text-right",
      render: (item) => formatNumber(item.activeMembers),
    },
    {
      key: "managers",
      label: "Gestores",
      className: "text-right",
      render: (item) =>
        item.managers > 0 ? (
          formatNumber(item.managers)
        ) : (
          <span className="text-warning">Nenhum</span>
        ),
    },
    {
      key: "units",
      label: "Unidades",
      className: "text-right",
      render: (item) => formatNumber(item.units),
    },
    {
      key: "pending",
      label: "Cadastros pendentes",
      className: "text-right",
      render: (item) => formatNumber(item.pendingEnrollments),
    },
    {
      key: "activity",
      label: "Último acesso",
      className: "whitespace-nowrap",
      render: (item) => formatRelative(item.lastActivityAt),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      mobile: "detail",
      render: (item) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            size="sm"
            variant="brand"
            icon={<LogIn className="size-4" />}
            loading={entering === item.id}
            disabled={entering !== null || item.id === currentId}
            onClick={() => enter(item)}
          >
            Entrar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Pencil className="size-4" />}
            onClick={() => openEdit(item)}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant={item.status === "ACTIVE" ? "ghost" : "secondary"}
            icon={
              item.status === "ACTIVE" ? (
                <PowerOff className="size-4" />
              ) : (
                <Power className="size-4" />
              )
            }
            onClick={() => setToggling(item)}
          >
            {item.status === "ACTIVE" ? "Suspender" : "Reativar"}
          </Button>
        </div>
      ),
    },
  ];

  const creating = editing?.mode === "create";
  const complete = form.name.trim() && form.city.trim() && form.state;
  const suspending = toggling?.status === "ACTIVE";

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate} icon={<Plus className="size-4" />}>
          Novo condomínio
        </Button>
      </div>

      <Card>
        {condominiums.length === 0 ? (
          <EmptyState
            icon={<Building2 className="size-5" />}
            title={
              filtered
                ? "Nenhum condomínio encontrado"
                : "Nenhum condomínio ainda"
            }
            description={
              filtered
                ? "Tente outra busca."
                : "Cadastre o primeiro condomínio, entre nele e adicione o gestor."
            }
          />
        ) : (
          <DataTable
            rows={condominiums}
            columns={columns}
            getId={(item) => item.id}
          />
        )}
      </Card>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={creating ? "Novo condomínio" : "Editar condomínio"}
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditing(null)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button onClick={save} loading={pending} disabled={!complete}>
              {creating ? "Cadastrar" : "Salvar"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label="Nome"
            required
            maxLength={120}
            value={form.name}
            placeholder="Ex.: Residencial Aurora"
            onChange={(event) => set("name", event.target.value)}
          />
          <Field
            label="CNPJ"
            inputMode="numeric"
            value={form.document ?? ""}
            placeholder="Opcional"
            onChange={(event) => set("document", maskCnpj(event.target.value))}
          />
          <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <Field
              label="Cidade"
              required
              maxLength={80}
              value={form.city}
              onChange={(event) => set("city", event.target.value)}
            />
            <Select
              label="UF"
              required
              placeholder="UF"
              value={form.state}
              onChange={(event) => set("state", event.target.value)}
              options={STATES.map((state) => ({ value: state, label: state }))}
            />
          </div>
          {creating && (
            <p className="text-xs text-soft">
              Depois de cadastrar, clique em <strong>Entrar</strong> para
              adicionar o gestor, as unidades e os links de cadastro.
            </p>
          )}
        </div>
      </Drawer>

      <Modal
        open={toggling !== null}
        onClose={() => setToggling(null)}
        title={suspending ? "Suspender condomínio" : "Reativar condomínio"}
        tone={suspending ? "danger" : "neutral"}
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setToggling(null)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              variant={suspending ? "danger" : "primary"}
              onClick={toggleStatus}
              loading={pending}
            >
              {suspending ? "Suspender" : "Reativar"}
            </Button>
          </>
        }
      >
        {suspending
          ? `Os membros de ${toggling?.name} deixam de acessá-lo e o link de cadastro para de funcionar. Os dados continuam guardados e você pode reativar quando quiser.`
          : `Os membros de ${toggling?.name} voltam a acessá-lo.`}
      </Modal>
    </>
  );
}
