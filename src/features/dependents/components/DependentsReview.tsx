"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ExternalLink, X } from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  TextArea,
  cn,
} from "@/design-system";
import { dependentsClient } from "@/features/dependents/api/dependents.client";
import {
  DEPENDENT_STATUS,
  RELATIONSHIP_LABELS,
} from "@/features/dependents/model/dependent-labels";
import type { Dependent } from "@/shared/contracts/dependents";
import { ApiClientError } from "@/shared/lib/api-client";
import { ageOn, formatBirthDate, todayIso } from "@/shared/lib/birth-date";
import { formatDateTime } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

// The condominium's dependents for the managers, as folding rows: closed,
// who and whose; open, the document next to the name and birth date, and
// (pending) approve or reject with a reason.
export function DependentsReview({ dependents }: { dependents: Dependent[] }) {
  if (dependents.length === 0) {
    return (
      <EmptyState
        title="Nenhum dependente aqui"
        description="Os dependentes desta situação aparecem nesta lista."
      />
    );
  }
  return (
    <ul className="divide-y divide-border">
      {dependents.map((dependent) => (
        <DependentRow key={dependent.id} dependent={dependent} />
      ))}
    </ul>
  );
}

function DependentRow({ dependent }: { dependent: Dependent }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [open, setOpen] = useState(dependent.status === "PENDING");
  const [pending, setPending] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const bodyId = useId();
  const status = DEPENDENT_STATUS[dependent.status];
  const pdf = dependent.documentContentType === "application/pdf";

  async function decide(approve: boolean) {
    setPending(true);
    try {
      if (approve) await dependentsClient.approve(dependent.id);
      else await dependentsClient.reject(dependent.id, reason.trim());
      setRejecting(false);
      showSuccess(
        approve ? `${dependent.name} aprovado.` : `${dependent.name} recusado.`,
        "O morador foi avisado.",
      );
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível salvar a decisão.",
      );
    }
    setPending(false);
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted sm:px-5"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-fg">
            {dependent.name}
          </span>
          <span className="block truncate text-xs text-soft">
            {[
              RELATIONSHIP_LABELS[dependent.relationship],
              `${ageOn(dependent.birthDate, todayIso())} anos`,
              dependent.holderName,
              dependent.unitLabel,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <Badge tone={status.tone}>{status.label}</Badge>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-soft transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        id={bodyId}
        hidden={!open}
        className="space-y-4 border-t border-border bg-surface-muted/60 px-4 py-4 sm:px-5"
      >
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-soft">Data de nascimento</dt>
            <dd className="text-fg">{formatBirthDate(dependent.birthDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-soft">Morador</dt>
            <dd className="text-fg">
              {dependent.holderName ?? "—"}
              {dependent.unitLabel ? ` · ${dependent.unitLabel}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-soft">Enviado em</dt>
            <dd className="text-fg">{formatDateTime(dependent.createdAt)}</dd>
          </div>
          {dependent.rejectReason && (
            <div className="sm:col-span-3">
              <dt className="text-xs text-soft">Motivo da recusa</dt>
              <dd className="text-fg">{dependent.rejectReason}</dd>
            </div>
          )}
        </dl>
        {pdf ? (
          <a
            href={dependent.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink hover:underline"
          >
            <ExternalLink aria-hidden className="size-4" />
            Abrir o documento (PDF)
          </a>
        ) : (
          <a
            href={dependent.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir em tamanho real"
            className="block max-w-xs overflow-hidden rounded-lg border border-border bg-white"
          >
            {/* A signed link to the stored document (WebP). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dependent.documentUrl}
              alt={`Documento de ${dependent.name}`}
              className="max-h-96 w-full object-contain"
            />
          </a>
        )}
        {dependent.status === "PENDING" && (
          <div className="flex flex-wrap gap-2">
            <Button
              icon={<Check className="size-4" />}
              loading={pending && !rejecting}
              onClick={() => decide(true)}
            >
              Aprovar
            </Button>
            <Button
              variant="danger"
              icon={<X className="size-4" />}
              disabled={pending}
              onClick={() => setRejecting(true)}
            >
              Recusar
            </Button>
          </div>
        )}
      </div>
      <Modal
        open={rejecting}
        onClose={() => !pending && setRejecting(false)}
        title={`Recusar ${dependent.name}?`}
        footer={
          <>
            <Button
              variant="cancel"
              onClick={() => setRejecting(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={pending}
              disabled={reason.trim().length < 3}
              onClick={() => decide(false)}
            >
              Recusar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p>O morador é avisado com o motivo e pode cadastrar de novo.</p>
          <TextArea
            label="Motivo"
            required
            rows={3}
            maxLength={300}
            data-autofocus
            placeholder="Ex.: o documento não mostra a data de nascimento."
            value={reason}
            onChange={(change) => setReason(change.target.value)}
          />
        </div>
      </Modal>
    </li>
  );
}
