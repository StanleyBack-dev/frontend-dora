"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  ChevronRight,
  HandHeart,
  MapPin,
  SearchX,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardCover,
  EmptyState,
  Modal,
  TextArea,
} from "@/design-system";
import { lostAndFoundClient } from "@/features/lost-and-found/api/lost-and-found.client";
import { FOUND_ITEM_CATEGORY_ICONS } from "@/features/lost-and-found/model/found-item-icons";
import { FOUND_ITEM_CATEGORY_LABELS } from "@/features/lost-and-found/model/found-item-labels";
import { lostOnLabel } from "@/features/lost-and-found/model/lost-report-labels";
import type { LostReportBoardItem } from "@/shared/contracts/lost-and-found";
import { ApiClientError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/toast/useToast";

// The neighbours' "Procura-se" board: what residents lost and chose to
// show (never who). Found one? "Achei isso" tells the owner and the desk;
// the finder leaves it at the desk.
export function LostReportBoard({
  reports,
}: {
  reports: LostReportBoardItem[];
}) {
  const { showError, showSuccess } = useToast();
  const [spotting, setSpotting] = useState<LostReportBoardItem | null>(null);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  // Said in this visit (before the page refreshes with spottedByMe).
  const [spotted, setSpotted] = useState<string[]>([]);

  function close() {
    setSpotting(null);
    setNote("");
  }

  async function spot() {
    if (!spotting) return;
    setSending(true);
    try {
      await lostAndFoundClient.spotLostReport(spotting.id, note.trim() || null);
      showSuccess(
        "Obrigado! Quem perdeu e a portaria foram avisados.",
        "Deixe o item na portaria para ser devolvido com segurança.",
      );
      setSpotted((current) => [...current, spotting.id]);
      close();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível avisar.",
      );
    } finally {
      setSending(false);
    }
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="size-5" />}
        title="Ninguém procurando nada"
        description="Quando um vizinho avisar que perdeu algo e escolher mostrar, aparece aqui."
        action={
          <Link
            href="/achados-e-perdidos/perdi"
            className="text-sm font-semibold text-brand-ink hover:underline"
          >
            Perdeu algo? Avise aqui
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = FOUND_ITEM_CATEGORY_ICONS[report.category];
          const done = report.spottedByMe || spotted.includes(report.id);
          return (
            <Card
              key={report.id}
              className="relative flex h-full flex-col gap-3 overflow-hidden p-5"
            >
              {report.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- short-lived signed link
                <img
                  src={report.photoUrl}
                  alt={`Foto de ${report.title}`}
                  className="-mx-5 -mt-5 aspect-[4/3] w-[calc(100%+2.5rem)] max-w-none object-cover"
                />
              ) : (
                <CardCover
                  icon={<Icon />}
                  label={FOUND_ITEM_CATEGORY_LABELS[report.category]}
                  className="-mx-5 -mt-5 aspect-[4/3]"
                />
              )}
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="warning">Procura-se</Badge>
                <Badge tone="neutral">
                  {FOUND_ITEM_CATEGORY_LABELS[report.category]}
                </Badge>
                {report.mine && <Badge tone="brand">Seu aviso</Badge>}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <h2 className="text-base font-bold break-words text-fg">
                  {report.title}
                </h2>
                {report.lostLocation && (
                  <p className="flex items-center gap-1.5 text-xs text-soft">
                    <MapPin aria-hidden className="size-3.5 shrink-0" />
                    <span className="truncate">
                      Perdido em {report.lostLocation}
                    </span>
                  </p>
                )}
                {report.lostOn && (
                  <p className="flex items-center gap-1.5 text-xs text-soft">
                    <CalendarClock aria-hidden className="size-3.5 shrink-0" />
                    <span className="first-letter:uppercase">
                      {lostOnLabel(report.lostOn)}
                    </span>
                  </p>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
                {report.mine ? (
                  <Link
                    href="/achados-e-perdidos/perdi"
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-ink hover:underline"
                  >
                    Ver meu aviso
                    <ChevronRight aria-hidden className="size-4" />
                  </Link>
                ) : done ? (
                  <span className="text-sm font-medium text-success">
                    Você avisou que achou
                  </span>
                ) : (
                  <>
                    <span className="text-xs text-soft">Achou? Avise.</span>
                    <Button
                      variant="brand"
                      size="sm"
                      icon={<HandHeart className="size-4" />}
                      onClick={() => setSpotting(report)}
                    >
                      Achei isso
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={spotting !== null}
        onClose={close}
        busy={sending}
        icon={<HandHeart className="size-5" />}
        title="Achei isso"
        footer={
          <>
            <Button variant="cancel" onClick={close} disabled={sending}>
              Voltar
            </Button>
            <Button loading={sending} onClick={() => void spot()}>
              Avisar
            </Button>
          </>
        }
      >
        {spotting && (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Quem perdeu “{spotting.title}” e a portaria são avisados. Deixe o
              item na portaria: lá conferem o dono e devolvem com assinatura.
            </p>
            <TextArea
              label="Recado (opcional)"
              rows={3}
              maxLength={300}
              placeholder="Ex.: achei na garagem, deixo na portaria hoje à noite."
              value={note}
              onChange={(event) => setNote(event.target.value)}
              data-autofocus
            />
          </div>
        )}
      </Modal>
    </>
  );
}
