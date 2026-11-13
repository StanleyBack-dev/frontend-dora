"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, KeyRound, UserRound, X } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Drawer,
  FormSection,
  Modal,
  Select,
  TextArea,
} from "@/design-system";
import {
  GROUP_DESCRIPTIONS,
  GROUP_LABELS,
} from "@/features/access/model/access-labels";
import { TemporaryAccessPanel } from "@/features/admin/components/TemporaryAccessPanel";
import { enrollmentClient } from "@/features/enrollment/api/enrollment.client";
import { EnrollmentFields } from "@/features/enrollment/components/EnrollmentFields";
import {
  ENROLLMENT_STATUS,
  enrollmentErrors,
  fromRequest,
  toEnrollmentData,
  type EnrollmentForm,
} from "@/features/enrollment/model/enrollment-form";
import type { TemporaryAccess, UserGroup } from "@/shared/contracts/api";
import type { EnrollmentRequest } from "@/shared/contracts/enrollment";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatDateTime } from "@/shared/lib/format";
import { formatPhone } from "@/shared/lib/masks";
import { useToast } from "@/shared/toast/useToast";

const failure = (cause: unknown, fallback: string) =>
  cause instanceof ApiClientError ? cause.message : fallback;

// Review of one sign-up. Pending: the manager can correct the data, then
// approve (gives access to the condominium) or reject it.
export function EnrollmentReviewDrawer({
  request,
  assignableGroups,
  units,
  onClose,
}: {
  request: EnrollmentRequest;
  /** Roles the current manager may give. */
  assignableGroups: UserGroup[];
  /** The condominium's units (the choice can be corrected). */
  units: { id: string; label: string }[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<EnrollmentForm>(() => fromRequest(request));
  // No default: the manager decides the access of each new account.
  const [group, setGroup] = useState<UserGroup | "">("");
  const [submitted, setSubmitted] = useState(false);
  const { showError } = useToast();
  const [pending, setPending] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [access, setAccess] = useState<TemporaryAccess | null>(null);
  const status = ENROLLMENT_STATUS[request.status];
  const reviewable = request.status === "PENDENTE" && !access;

  const errors = enrollmentErrors(form, units.length > 0);

  const finish = () => {
    router.refresh();
    onClose();
  };

  async function approve() {
    setSubmitted(true);
    if (Object.keys(errors).length > 0 || !group) {
      return showError("Corrija os campos destacados antes de aprovar.");
    }
    setPending(true);
    try {
      const approval = await enrollmentClient.approve(
        request.id,
        toEnrollmentData(form),
        group,
      );
      setAccess(approval.access);
    } catch (cause) {
      showError(failure(cause, "Não foi possível aprovar o cadastro."));
    }
    setPending(false);
  }

  return (
    <Drawer
      open
      width="lg"
      onClose={access ? finish : onClose}
      title={
        access
          ? access.temporaryPassword
            ? "Acesso criado"
            : "Acesso liberado"
          : "Cadastro recebido"
      }
      busy={pending}
      footer={
        access ? (
          <Button onClick={finish}>Concluir</Button>
        ) : reviewable ? (
          <>
            <Button
              variant="secondary"
              icon={<X className="size-4" />}
              onClick={() => setRejecting(true)}
              disabled={pending}
            >
              Recusar
            </Button>
            <Button
              icon={<Check className="size-4" />}
              onClick={approve}
              loading={pending}
            >
              Aprovar
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        )
      }
    >
      {access ? (
        <TemporaryAccessPanel access={access} />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-surface-muted text-soft">
              {request.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- signed storage URL
                <img
                  src={request.photoUrl}
                  alt={`Foto de ${request.fullName}`}
                  className="size-full object-cover"
                />
              ) : (
                <UserRound className="size-7" aria-hidden />
              )}
            </span>
            <div className="min-w-0 space-y-1 text-sm text-muted">
              <p className="truncate font-medium text-fg">{request.fullName}</p>
              <p className="flex flex-wrap items-center gap-2">
                <Badge tone={status.tone}>{status.label}</Badge>
                Enviado em {formatDateTime(request.createdAt)}
              </p>
            </div>
          </div>

          {reviewable ? (
            <>
              <Alert tone="info">
                Confira e corrija o que for preciso. O usuário de acesso é
                gerado a partir do nome (ex.: <strong>ana.souza</strong>) e o
                e-mail também serve para entrar.
              </Alert>
              <FormSection
                icon={<KeyRound />}
                title="Acesso ao app"
                description="O grupo define o que a pessoa pode fazer no app."
              >
                <div>
                  <Select
                    label="Grupo"
                    required
                    placeholder="Selecione"
                    value={group}
                    onChange={(event) =>
                      setGroup(event.target.value as UserGroup)
                    }
                    options={assignableGroups.map((value) => ({
                      value,
                      label: GROUP_LABELS[value],
                    }))}
                    error={
                      submitted && !group ? "Selecione o grupo." : undefined
                    }
                  />
                  {group && (
                    <p className="mt-1.5 text-xs text-soft">
                      {GROUP_DESCRIPTIONS[group]}
                    </p>
                  )}
                </div>
              </FormSection>
              <EnrollmentFields
                form={form}
                onChange={setForm}
                errors={errors}
                showErrors={submitted}
                units={units}
              />
            </>
          ) : (
            <ReviewedSummary request={request} />
          )}
        </div>
      )}

      {rejecting && (
        <RejectModal
          request={request}
          onClose={() => setRejecting(false)}
          onRejected={finish}
        />
      )}
    </Drawer>
  );
}

function ReviewedSummary({ request }: { request: EnrollmentRequest }) {
  const rows: [string, string][] = [
    ["Nome completo", request.fullName],
    ["E-mail", request.email],
    ["Telefone", formatPhone(request.phone)],
    ["Unidade", request.unitLabel ?? "—"],
    ["Analisado em", formatDateTime(request.reviewedAt)],
  ];
  return (
    <div className="space-y-4">
      {request.status === "RECUSADA" && request.rejectionReason && (
        <Alert tone="danger">Motivo da recusa: {request.rejectionReason}</Alert>
      )}
      <dl className="divide-y divide-border rounded-lg border border-border text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-3 py-2">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right text-fg">{value}</dd>
          </div>
        ))}
      </dl>
      {request.userId && (
        <Link
          href={`/admin/usuarios/${request.userId}`}
          className="text-sm font-medium text-brand-ink hover:underline"
        >
          Ver o morador
        </Link>
      )}
    </div>
  );
}

function RejectModal({
  request,
  onClose,
  onRejected,
}: {
  request: EnrollmentRequest;
  onClose: () => void;
  onRejected: () => void;
}) {
  const [reason, setReason] = useState("");
  const { showError } = useToast();
  const [pending, setPending] = useState(false);
  const valid = reason.trim().length >= 3;

  async function reject() {
    setPending(true);
    try {
      await enrollmentClient.reject(request.id, reason);
      onRejected();
    } catch (cause) {
      showError(failure(cause, "Não foi possível recusar o cadastro."));
      setPending(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Recusar cadastro"
      tone="danger"
      busy={pending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Voltar
          </Button>
          <Button
            variant="danger"
            onClick={reject}
            loading={pending}
            disabled={!valid}
          >
            Recusar
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-muted">
          O cadastro de <strong className="text-fg">{request.fullName}</strong>{" "}
          não vira usuário. O motivo fica registrado aqui.
        </p>
        <TextArea
          label="Motivo"
          required
          data-autofocus
          rows={3}
          maxLength={500}
          placeholder="Ex.: cadastro duplicado, não mora no condomínio…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </Modal>
  );
}
