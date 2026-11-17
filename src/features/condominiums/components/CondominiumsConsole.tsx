"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  House,
  LogIn,
  Pencil,
  Plus,
  Power,
  PowerOff,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  ChoiceCards,
  DataTable,
  Drawer,
  EmptyState,
  Field,
  FilterResults,
  Modal,
  Select,
  type ChoiceOption,
  type DataTableColumn,
} from "@/design-system";
import { condominiumsClient } from "@/features/condominiums/api/condominiums.client";
import { CondominiumModules } from "@/features/condominiums/components/CondominiumModules";
import type {
  AddressFormat,
  Condominium,
  CondominiumInput,
} from "@/shared/contracts/condominiums";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatNumber, formatRelative } from "@/shared/lib/format";
import { maskCnpj } from "@/shared/lib/masks";
import { startNavigation } from "@/shared/lib/navigation-progress";
import { BRAZILIAN_STATES } from "@/shared/lib/brazilian-states";
import { useToast } from "@/shared/toast/useToast";

const STATES = BRAZILIAN_STATES;

const EMPTY: CondominiumInput = {
  name: "",
  document: "",
  city: "",
  state: "",
  addressFormat: "APARTMENT",
};

const ADDRESS_FORMATS: ChoiceOption<AddressFormat>[] = [
  {
    value: "APARTMENT",
    title: "Apartamentos",
    hint: "Bloco e número, escolhidos numa lista no cadastro.",
    icon: <Building2 />,
  },
  {
    value: "HOUSE",
    title: "Casas",
    hint: "Rua, quadra e lote, digitados pelo morador no cadastro.",
    icon: <House />,
  },
];

type Editing = { mode: "create" } | { mode: "edit"; condominium: Condominium };

// The platform console: every condominium using Dora, with its numbers.
// The Dora administration creates, edits, suspends and enters each one.
export function CondominiumsConsole({
  condominiums,
  currentId,
  filtered,
  filters,
}: {
  condominiums: Condominium[];
  /** The condominium the session is working in (highlighted). */
  currentId: string | null;
  /** Search or status filter applied (changes the empty message). */
  filtered: boolean;
  /** The filter panel: below "Novo condomínio", above the list. */
  filters?: ReactNode;
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
      addressFormat: condominium.addressFormat,
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
      startNavigation();
      // The platform enters a condominium to administer it.
      router.push("/gestao");
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
          <Link
            href={`/administracao/condominios/${item.id}`}
            className="font-semibold text-fg hover:underline"
          >
            {item.name}
            {item.id === currentId && (
              <Badge tone="brand" className="ml-2 align-middle">
                Aberto agora
              </Badge>
            )}
          </Link>
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
        <Button
          variant="brand"
          onClick={openCreate}
          icon={<Plus className="size-4" />}
        >
          Novo condomínio
        </Button>
      </div>

      {filters}

      <FilterResults>
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
      </FilterResults>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={creating ? "Novo condomínio" : "Editar condomínio"}
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
          <ChoiceCards
            name="addressFormat"
            legend="Endereço das moradias"
            options={ADDRESS_FORMATS}
            value={form.addressFormat ?? "APARTMENT"}
            onChange={(value) => set("addressFormat", value)}
          />
          {editing?.mode === "edit" && (
            <CondominiumModules
              key={editing.condominium.id}
              condominium={editing.condominium}
            />
          )}
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
              variant="cancel"
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
