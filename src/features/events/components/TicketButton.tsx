"use client";

import { useEffect, useState } from "react";
import {
  CircleCheck,
  Copy,
  ExternalLink,
  MessageCircle,
  QrCode,
} from "lucide-react";
import { Alert, Button, Modal, buttonClasses } from "@/design-system";
import { InviteCode } from "@/features/bookings/components/InviteCode";
import { inviteQrSvg } from "@/features/bookings/model/invite-qr";
import { whatsappLink } from "@/features/bookings/model/guest-invite";
import { ticketMessage, ticketUrl } from "@/features/events/model/ticket-pass";
import { formatTime } from "@/shared/lib/datetime";
import { useToast } from "@/shared/toast/useToast";

// One person's ticket: a button that opens the QR and the code (to show at
// the gate from this phone), with the link to send to whoever goes with
// you (WhatsApp, copy, open the ticket page).
export function TicketButton({
  person,
  eventTitle,
}: {
  person: { name: string; ticketCode: string; checkedInAt: string | null };
  eventTitle: string;
}) {
  const { showError, showSuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || qr) return;
    let alive = true;
    inviteQrSvg(ticketUrl(person.ticketCode))
      .then((svg) => alive && setQr(svg))
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [open, qr, person.ticketCode]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(ticketUrl(person.ticketCode));
      showSuccess("Link do ingresso copiado.");
    } catch {
      showError("Não foi possível copiar o link.");
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        icon={<QrCode className="size-3.5" />}
        onClick={() => setOpen(true)}
      >
        Ingresso
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Ingresso de ${person.name}`}
        icon={<QrCode className="size-5" />}
        footer={
          <Button variant="cancel" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        }
      >
        <div className="space-y-4">
          <InviteCode
            code={person.ticketCode}
            qrSvg={qr ?? ""}
            muted={person.checkedInAt !== null}
            label="Código do ingresso"
            qrLabel={`QR code do ingresso de ${person.name}`}
          />
          {person.checkedInAt ? (
            <Alert tone="success">
              <CircleCheck aria-hidden className="mr-1 inline size-4" />
              {person.name} entrou às {formatTime(person.checkedInAt)}.
            </Alert>
          ) : (
            <p className="text-center text-sm text-muted">
              Na portaria, mostre este QR ou diga o código. Cada ingresso entra
              uma vez, a partir de 3 horas antes do evento.
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {/* The link uses this site's address: made on the click. */}
            <Button
              size="sm"
              variant="secondary"
              icon={<MessageCircle className="size-3.5" />}
              onClick={() =>
                window.open(
                  whatsappLink(ticketMessage(person, eventTitle)),
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              Enviar pelo WhatsApp
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Copy className="size-3.5" />}
              onClick={copyLink}
            >
              Copiar link
            </Button>
            <a
              href={`/ingresso/${person.ticketCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("secondary", "sm")}
            >
              <ExternalLink aria-hidden className="size-3.5" />
              Abrir
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
}
