"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, UsersRound } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  DraftNotice,
  Drawer,
  EmptyState,
  Field,
  FormIssues,
  Modal,
  Select,
} from "@/design-system";
import { dependentsClient } from "@/features/dependents/api/dependents.client";
import {
  DocumentField,
  type PickedDocument,
} from "@/features/documents/components/DocumentField";
import {
  DEPENDENT_STATUS,
  RELATIONSHIP_LABELS,
} from "@/features/dependents/model/dependent-labels";
import type {
  Dependent,
  DependentRelationship,
} from "@/shared/contracts/dependents";
import { ApiClientError } from "@/shared/lib/api-client";
import {
  ageOn,
  birthDateError,
  formatBirthDate,
  todayIso,
} from "@/shared/lib/birth-date";
import { sameShape } from "@/shared/lib/form-draft";
import { useFormDraft } from "@/shared/lib/use-form-draft";
import { useToast } from "@/shared/toast/useToast";

const RELATIONSHIPS = Object.entries(RELATIONSHIP_LABELS).map(
  ([value, label]) => ({ value, label }),
);

// A resident's dependents (children, spouse… who don't use the app): each
// registered once with a document showing the birth date, approved by the
// administration, then picked in any event order.
export function MyDependents({ dependents }: { dependents: Dependent[] }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Dependent | null>(null);
  const [pending, setPending] = useState(false);
  const today = todayIso();

  async function remove() {
    if (!removing) return;
    setPending(true);
    try {
      await dependentsClient.remove(removing.id);
      showSuccess(`${removing.name} removido.`);
      setRemoving(null);
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível remover.",
      );
    }
    setPending(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="brand"
          icon={<Plus className="size-4" />}
          onClick={() => setAdding(true)}
        >
          Adicionar dependente
        </Button>
      </div>
      <Card>
        {dependents.length === 0 ? (
          <EmptyState
            icon={<UsersRound className="size-5" />}
            title="Nenhum dependente"
            description="Cadastre quem mora com você e não usa o app, como os filhos. Depois de aprovados, eles entram nos pedidos de ingressos com a idade certa, sem documento a cada evento."
          />
        ) : (
          <ul className="divide-y divide-border">
            {dependents.map((dependent) => {
              const status = DEPENDENT_STATUS[dependent.status];
              return (
                <li
                  key={dependent.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg">
                      {dependent.name}
                    </span>
                    <span className="block text-xs text-soft">
                      {RELATIONSHIP_LABELS[dependent.relationship]} ·{" "}
                      {formatBirthDate(dependent.birthDate)} (
                      {ageOn(dependent.birthDate, today)} anos)
                    </span>
                    {dependent.status === "REJECTED" &&
                      dependent.rejectReason && (
                        <span className="mt-0.5 block text-xs text-danger">
                          Motivo: {dependent.rejectReason}
                        </span>
                      )}
                  </span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <a
                    href={dependent.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-brand-ink hover:underline"
                  >
                    Documento
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover ${dependent.name}`}
                    title="Remover"
                    onClick={() => setRemoving(dependent)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <AddDependentDrawer open={adding} onClose={() => setAdding(false)} />

      <Modal
        open={removing !== null}
        onClose={() => !pending && setRemoving(null)}
        title={`Remover ${removing?.name ?? ""}?`}
        footer={
          <>
            <Button
              variant="cancel"
              onClick={() => setRemoving(null)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button variant="danger" loading={pending} onClick={remove}>
              Remover
            </Button>
          </>
        }
      >
        O dependente sai da sua lista e o documento é apagado. Pedidos de
        ingressos já feitos continuam com o nome e a idade.
      </Modal>
    </div>
  );
}

type DependentDraft = {
  name: string;
  birthDate: string;
  relationship: DependentRelationship | "";
};

const EMPTY_DEPENDENT: DependentDraft = {
  name: "",
  birthDate: "",
  relationship: "",
};

function AddDependentDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  // The texts are a draft (kept when the drawer closes, back after a
  // reload); the document file stays only while the page is open.
  const {
    value: fields,
    set: setFields,
    discard,
    restored,
  } = useFormDraft<DependentDraft>(
    "add-dependent",
    EMPTY_DEPENDENT,
    (raw) => sameShape(EMPTY_DEPENDENT, raw),
    { open },
  );
  const { name, birthDate, relationship } = fields;
  const setField =
    <K extends keyof DependentDraft>(key: K) =>
    (value: DependentDraft[K]) =>
      setFields((current) => ({ ...current, [key]: value }));
  const setName = setField("name");
  const setBirthDate = setField("birthDate");
  const setRelationship = setField("relationship");
  const [document, setDocument] = useState<PickedDocument | null>(null);
  const [pending, setPending] = useState(false);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const birthProblem = birthDateError(birthDate, true);
  const missing = [
    name.trim().length < 3 && "O nome completo.",
    birthProblem && `Data de nascimento: ${birthProblem}`,
    !relationship && "O parentesco.",
    !document && "O documento com a data de nascimento.",
  ].filter((item): item is string => Boolean(item));

  // "Cancelar", or after sending: the form starts over.
  function reset() {
    discard();
    setDocument(null);
    setTried(false);
    setError(null);
  }

  async function submit() {
    setTried(true);
    if (missing.length > 0 || !relationship || !document) return;
    setPending(true);
    setError(null);
    try {
      await dependentsClient.add({
        name: name.trim(),
        birthDate,
        relationship,
        document: document.base64,
      });
      showSuccess(
        "Dependente enviado.",
        "A administração vai conferir o documento.",
      );
      reset();
      onClose();
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível cadastrar.";
      setError(message);
      showError(message);
    }
    setPending(false);
  }

  return (
    <Drawer
      open={open}
      // X, Esc or a tap outside: hides it, what was typed stays.
      onClose={() => {
        if (pending) return;
        onClose();
      }}
      busy={pending}
      title="Adicionar dependente"
      footer={
        <>
          <Button
            variant="cancel"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button onClick={submit} loading={pending}>
            Enviar para aprovação
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {restored && <DraftNotice onDiscard={reset} />}
        <FormIssues missing={tried ? missing : []} error={error} />
        <p className="text-sm text-muted">
          Para quem mora com você e não usa o app. A administração confere o
          documento uma vez; depois, o dependente entra nos pedidos de ingressos
          com a idade certa.
        </p>
        <Field
          label="Nome completo"
          required
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Data de nascimento"
            required
            type="date"
            max={todayIso()}
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            error={(birthDate && birthProblem) || undefined}
          />
          <Select
            label="Parentesco"
            required
            placeholder="Escolha"
            value={relationship}
            onChange={(event) =>
              setRelationship(event.target.value as DependentRelationship)
            }
            options={RELATIONSHIPS}
          />
        </div>
        <DocumentField
          label="Documento com a data de nascimento"
          hint="Certidão de nascimento, RG ou outro documento com foto: imagem ou PDF, até 1 MB."
          value={document}
          onChange={setDocument}
        />
      </div>
    </Drawer>
  );
}
