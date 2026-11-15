"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Drawer,
  Field,
  Modal,
  TextArea,
} from "@/design-system";
import { supportersClient } from "@/features/support-project/api/supporters.client";
import { contributionsLabel } from "@/features/support-project/model/support-labels";
import type {
  SupportContribution,
  Supporter,
} from "@/shared/contracts/supporters";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatCents } from "@/shared/lib/format";
import { centsOf, maskMoney } from "@/shared/lib/masks";
import { useToast } from "@/shared/toast/useToast";

type Draft = {
  name: string;
  showName: boolean;
  amount: string;
  receivedOn: string;
  note: string;
};

type Removal =
  | { kind: "supporter"; supporter: Supporter }
  | { kind: "contribution"; supporter: Supporter; item: SupportContribution };

const dayLabel = (day: string) => day.split("-").reverse().join("/");

// For the platform administrator: a static PIX code doesn't say who paid,
// so each contribution that arrives is recorded here, with the name the
// person agreed to show (or as anonymous). A known name adds to that
// supporter.
export function SupportersManager({
  supporters,
  today,
}: {
  supporters: Supporter[];
  /** YYYY-MM-DD in the app timezone (the date field's default and max). */
  today: string;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const empty: Draft = {
    name: "",
    showName: true,
    amount: "",
    receivedOn: today,
    note: "",
  };
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<Supporter | null>(null);
  const [editName, setEditName] = useState("");
  const [editShow, setEditShow] = useState(true);
  const [removal, setRemoval] = useState<Removal | null>(null);
  const [pending, setPending] = useState(false);

  const fail = (cause: unknown, fallback: string) =>
    showError(cause instanceof ApiClientError ? cause.message : fallback);

  async function record() {
    if (!draft) return;
    const amountCents = centsOf(draft.amount);
    if (!amountCents) {
      showError("Informe o valor do apoio.");
      return;
    }
    setPending(true);
    try {
      await supportersClient.record({
        name: draft.name,
        showName: draft.showName,
        amountCents,
        receivedOn: draft.receivedOn,
        note: draft.note.trim() || null,
      });
      showSuccess("Apoio registrado.", "O ranking já mostra o novo total.");
      setDraft(null);
      router.refresh();
    } catch (cause) {
      fail(cause, "Não foi possível registrar o apoio.");
    }
    setPending(false);
  }

  function startEdit(supporter: Supporter) {
    setEditing(supporter);
    setEditName(supporter.name);
    setEditShow(supporter.showName);
  }

  async function saveEdit() {
    if (!editing) return;
    setPending(true);
    try {
      await supportersClient.update(editing.id, {
        name: editName,
        showName: editShow,
      });
      showSuccess("Apoiador atualizado.");
      setEditing(null);
      router.refresh();
    } catch (cause) {
      fail(cause, "Não foi possível salvar.");
    }
    setPending(false);
  }

  async function confirmRemoval() {
    if (!removal) return;
    setPending(true);
    try {
      if (removal.kind === "supporter") {
        await supportersClient.remove(removal.supporter.id);
        showSuccess("Apoiador removido.");
      } else {
        await supportersClient.removeContribution(removal.item.id);
        showSuccess("Apoio removido.");
      }
      setRemoval(null);
      router.refresh();
    } catch (cause) {
      fail(cause, "Não foi possível remover.");
    }
    setPending(false);
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));

  return (
    <Card>
      <CardHeader
        title="Apoiadores"
        description="Só a administração do Dora vê esta lista. Registre cada Pix recebido."
        action={
          <Button
            size="sm"
            icon={<Plus className="size-4" />}
            onClick={() => setDraft(empty)}
          >
            Registrar apoio
          </Button>
        }
      />
      <CardBody className="pt-0">
        {supporters.length === 0 ? (
          <p className="text-sm text-muted">Nenhum apoio registrado ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {supporters.map((supporter) => (
              <li key={supporter.id} className="py-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
                      <span className="truncate">{supporter.name}</span>
                      {!supporter.showName && (
                        <Badge tone="neutral">
                          <EyeOff aria-hidden className="size-3" />
                          Anônimo no ranking
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {formatCents(supporter.totalCents)} ·{" "}
                      {contributionsLabel(supporter.contributions)}
                      {supporter.lastReceivedOn &&
                        ` · último em ${dayLabel(supporter.lastReceivedOn)}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(supporter)}
                    aria-label={`Editar ${supporter.name}`}
                    title="Editar"
                    className="grid size-8 shrink-0 place-items-center rounded-md text-soft transition-colors hover:bg-surface-muted hover:text-fg"
                  >
                    <Pencil aria-hidden className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoval({ kind: "supporter", supporter })}
                    aria-label={`Remover ${supporter.name}`}
                    title="Remover apoiador"
                    className="grid size-8 shrink-0 place-items-center rounded-md text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </div>
                {supporter.history.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {supporter.history.map((item) => (
                      <li
                        key={item.id}
                        className="inline-flex items-center gap-1 rounded-full border border-border py-0.5 pr-1 pl-2.5 text-xs text-muted"
                        title={item.note ?? undefined}
                      >
                        <span className="font-semibold text-fg tabular-nums">
                          {formatCents(item.amountCents)}
                        </span>
                        em {dayLabel(item.receivedOn)}
                        <button
                          type="button"
                          onClick={() =>
                            setRemoval({
                              kind: "contribution",
                              supporter,
                              item,
                            })
                          }
                          aria-label={`Remover apoio de ${formatCents(item.amountCents)} em ${dayLabel(item.receivedOn)}`}
                          className="grid size-5 place-items-center rounded-full text-soft transition-colors hover:bg-danger/10 hover:text-danger"
                        >
                          <X aria-hidden className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardBody>

      <Drawer
        open={draft !== null}
        onClose={() => setDraft(null)}
        title="Registrar apoio"
        subtitle="Um nome que já está na lista soma a esse apoiador."
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDraft(null)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              onClick={record}
              loading={pending}
              disabled={
                !draft?.name.trim() || !draft.amount || !draft.receivedOn
              }
            >
              Registrar
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <Field
              label="Nome do apoiador"
              required
              maxLength={60}
              list="supporter-names"
              autoComplete="off"
              value={draft.name}
              onChange={(event) => set("name", event.target.value)}
            />
            <datalist id="supporter-names">
              {supporters.map((supporter) => (
                <option key={supporter.id} value={supporter.name} />
              ))}
            </datalist>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Valor (R$)"
                required
                inputMode="numeric"
                placeholder="0,00"
                value={draft.amount}
                onChange={(event) =>
                  set("amount", maskMoney(event.target.value))
                }
              />
              <Field
                label="Recebido em"
                type="date"
                required
                max={today}
                value={draft.receivedOn}
                onChange={(event) => set("receivedOn", event.target.value)}
              />
            </div>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-fg select-none">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-[var(--accent)]"
                checked={draft.showName}
                onChange={(event) => set("showName", event.target.checked)}
              />
              <span>
                Mostrar o nome no ranking
                <span className="block text-xs text-muted">
                  Desmarcado, aparece como “Apoiador anônimo”. Confirme com a
                  pessoa antes de mostrar o nome.
                </span>
              </span>
            </label>
            <TextArea
              label="Observação (interna)"
              rows={2}
              maxLength={200}
              value={draft.note}
              onChange={(event) => set("note", event.target.value)}
            />
          </div>
        )}
      </Drawer>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Editar apoiador"
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
            <Button
              onClick={saveEdit}
              loading={pending}
              disabled={!editName.trim()}
            >
              Salvar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label="Nome"
            required
            maxLength={60}
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-fg select-none">
            <input
              type="checkbox"
              className="size-4 accent-[var(--accent)]"
              checked={editShow}
              onChange={(event) => setEditShow(event.target.checked)}
            />
            Mostrar o nome no ranking
          </label>
        </div>
      </Drawer>

      <Modal
        open={removal !== null}
        onClose={() => setRemoval(null)}
        title={
          removal?.kind === "supporter" ? "Remover apoiador?" : "Remover apoio?"
        }
        tone="danger"
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRemoval(null)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmRemoval} loading={pending}>
              Remover
            </Button>
          </>
        }
      >
        {removal?.kind === "supporter" ? (
          <p className="text-sm text-muted">
            {removal.supporter.name} e todos os{" "}
            {contributionsLabel(removal.supporter.contributions)} saem da lista
            e do ranking. Não dá para desfazer.
          </p>
        ) : removal ? (
          <p className="text-sm text-muted">
            O apoio de {formatCents(removal.item.amountCents)} de{" "}
            {removal.supporter.name}, recebido em{" "}
            {dayLabel(removal.item.receivedOn)}, sai do total. Não dá para
            desfazer.
          </p>
        ) : null}
      </Modal>
    </Card>
  );
}
