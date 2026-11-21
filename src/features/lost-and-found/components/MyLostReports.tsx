"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck, ChevronRight, SearchX, XCircle } from "lucide-react";
import { Badge, Button, Card, EmptyState, Modal } from "@/design-system";
import { lostAndFoundClient } from "@/features/lost-and-found/api/lost-and-found.client";
import { LostReportDrawer } from "@/features/lost-and-found/components/LostReportDrawer";
import { FOUND_ITEM_CATEGORY_ICONS } from "@/features/lost-and-found/model/found-item-icons";
import { FOUND_ITEM_CATEGORY_LABELS } from "@/features/lost-and-found/model/found-item-labels";
import {
  LOST_REPORT_STATUS_LABELS,
  LOST_REPORT_STATUS_TONES,
  lostOnLabel,
} from "@/features/lost-and-found/model/lost-report-labels";
import type { LostReport } from "@/shared/contracts/lost-and-found";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatDateTime } from "@/shared/lib/datetime";
import { useToast } from "@/shared/toast/useToast";

type Closing = { report: LostReport; found: boolean };

// "Perdi algo": the button to say what was lost (its own row, at the
// right) and the caller's reports, two per row on wide screens. An open one
// links to the kept items of its category and ends with "Encontrei" or
// "Não procuro mais".
export function MyLostReports({ reports }: { reports: LostReport[] }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [reporting, setReporting] = useState(false);
  const [closing, setClosing] = useState<Closing | null>(null);
  const [sending, setSending] = useState(false);

  async function close() {
    if (!closing) return;
    setSending(true);
    try {
      await lostAndFoundClient.closeLostReport(
        closing.report.id,
        closing.found,
      );
      showSuccess(
        closing.found ? "Que bom que encontrou!" : "Aviso encerrado.",
      );
      setClosing(null);
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível encerrar o aviso.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button
          icon={<SearchX className="size-4" />}
          onClick={() => setReporting(true)}
        >
          Avisar que perdi
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <EmptyState
            icon={<SearchX className="size-5" />}
            title="Nenhum aviso"
            description="Perdeu algo no condomínio? Avise aqui: quando a portaria registrar um item parecido, você recebe uma notificação."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {reports.map((report) => {
            const Icon = FOUND_ITEM_CATEGORY_ICONS[report.category];
            const open = report.status === "OPEN";
            const facts = [
              {
                label: "Categoria",
                value: FOUND_ITEM_CATEGORY_LABELS[report.category],
              },
              { label: "Onde", value: report.lostLocation },
              {
                label: "Quando",
                value: report.lostOn ? lostOnLabel(report.lostOn) : null,
              },
              { label: "Avisado em", value: formatDateTime(report.createdAt) },
              {
                label: "Encerrado em",
                value: report.closedAt ? formatDateTime(report.closedAt) : null,
              },
            ].filter((fact) => fact.value);

            return (
              <Card key={report.id} className="flex flex-col gap-4 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  {report.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- short-lived signed link
                    <img
                      src={report.photoUrl}
                      alt=""
                      className="size-14 shrink-0 rounded-2xl border border-border object-cover shadow-sm"
                    />
                  ) : (
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-brand-fg shadow-sm">
                      <Icon aria-hidden className="size-7" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="leading-snug font-semibold break-words text-fg">
                      {report.title}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={LOST_REPORT_STATUS_TONES[report.status]}>
                        {LOST_REPORT_STATUS_LABELS[report.status]}
                      </Badge>
                      {open && report.shared && (
                        <Badge tone="info">No mural dos vizinhos</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {report.description && (
                  <div className="rounded-xl border border-border bg-surface-muted/60 p-3">
                    <p className="text-xs text-soft">Detalhes</p>
                    <p className="mt-0.5 text-[13px] break-words text-fg">
                      {report.description}
                    </p>
                  </div>
                )}

                <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                  {facts.map((fact) => (
                    <div key={fact.label} className="min-w-0">
                      <dt className="text-xs text-soft">{fact.label}</dt>
                      <dd className="break-words text-fg">{fact.value}</dd>
                    </div>
                  ))}
                </dl>

                {(open || report.foundItemId) && (
                  <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      href={
                        report.foundItemId
                          ? `/achados-e-perdidos/${report.foundItemId}`
                          : `/achados-e-perdidos?categoria=${report.category}`
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-1 text-sm font-semibold text-brand-ink hover:underline"
                    >
                      {report.foundItemId
                        ? "Ver o item"
                        : "Ver achados parecidos"}
                      <ChevronRight aria-hidden className="size-4" />
                    </Link>
                    {open && (
                      <div className="grid grid-cols-2 gap-2 sm:flex">
                        <Button
                          size="sm"
                          variant="cancel"
                          className="justify-center"
                          icon={<XCircle className="size-4" />}
                          onClick={() => setClosing({ report, found: false })}
                        >
                          Não procuro mais
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="justify-center"
                          icon={<CircleCheck className="size-4" />}
                          onClick={() => setClosing({ report, found: true })}
                        >
                          Encontrei
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <LostReportDrawer
        open={reporting}
        onClose={() => setReporting(false)}
        onDone={() => {
          setReporting(false);
          router.refresh();
        }}
      />

      <Modal
        open={closing !== null}
        onClose={() => setClosing(null)}
        busy={sending}
        tone={closing?.found ? "neutral" : "danger"}
        icon={
          closing?.found ? (
            <CircleCheck className="size-5" />
          ) : (
            <XCircle className="size-5" />
          )
        }
        title={closing?.found ? "Encontrei" : "Não procuro mais"}
        footer={
          <>
            <Button
              variant="cancel"
              onClick={() => setClosing(null)}
              disabled={sending}
            >
              Voltar
            </Button>
            <Button
              variant={closing?.found ? "primary" : "danger"}
              loading={sending}
              onClick={() => void close()}
            >
              Encerrar aviso
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          O aviso de “{closing?.report.title}” é encerrado e você deixa de
          receber notificações de itens dessa categoria.
        </p>
      </Modal>
    </>
  );
}
