"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CircleCheck,
  Copy,
  MessageCircle,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Alert,
  Button,
  Drawer,
  EmptyState,
  Field,
  Select,
  Spinner,
} from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import {
  allInvitesMessage,
  inviteMessage,
  inviteUrl,
  whatsappLink,
} from "@/features/bookings/model/guest-invite";
import type { BookingGuest, GuestInput } from "@/shared/contracts/bookings";
import { ApiClientError } from "@/shared/lib/api-client";
import { formatTime } from "@/shared/lib/datetime";
import {
  DOCUMENT_LABELS,
  documentError,
  formatDocument,
  maskDocument,
  type DocumentType,
} from "@/shared/lib/identity-document";
import { formatPhone, maskPhone, phoneError } from "@/shared/lib/masks";
import { useToast } from "@/shared/toast/useToast";

const EMPTY = {
  name: "",
  /** "" until a document type is chosen (then its field shows). */
  documentType: "" as DocumentType | "",
  document: "",
  phone: "",
};

const DOCUMENT_TYPES: DocumentType[] = ["CPF", "RG"];

// The guest list of a booking: add people, send each one the invite (QR code
// for the gate) by WhatsApp, or all of them in one message, and take someone
// off the list. Changes are possible while the booking is on and hasn't
// ended.
export function GuestsDrawer({
  open,
  onClose,
  booking,
  editable,
}: {
  open: boolean;
  onClose: () => void;
  booking: { id: string; spaceName: string; period: string };
  editable: boolean;
}) {
  const { showError, showSuccess } = useToast();
  const [list, setList] = useState<BookingGuest[] | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const event = { spaceName: booking.spaceName, period: booking.period };
  const invalidPhone = form.phone ? phoneError(form.phone) : null;
  const invalidDocument =
    form.documentType && form.document
      ? documentError(form.documentType, form.document)
      : null;
  // Shown once the field is full or after an attempt to add, not while
  // the first digits are still coming.
  const [triedDocument, setTriedDocument] = useState(false);
  const documentComplete =
    form.documentType === "CPF"
      ? form.document.replace(/\D/g, "").length === 11
      : false;
  const showDocumentError =
    invalidDocument && (triedDocument || documentComplete);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    bookingsClient
      .guests(booking.id)
      .then((loaded) => !cancelled && setList(loaded))
      .catch((cause: unknown) => {
        if (cancelled) return;
        setList([]);
        showError(
          cause instanceof ApiClientError
            ? cause.message
            : "Não foi possível carregar os convidados.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [open, booking.id, showError]);

  // Closing clears the list: the next opening shows the spinner and loads
  // it again (someone else may have changed it).
  function close() {
    setList(null);
    onClose();
  }

  async function send(guests: GuestInput[]): Promise<boolean> {
    setAdding(true);
    try {
      const added = await bookingsClient.addGuests(booking.id, guests);
      setList((current) => [...(current ?? []), ...added]);
      showSuccess(
        guests.length === 1
          ? "Convidado adicionado."
          : `${guests.length} convidados adicionados.`,
        "Envie os convites pelo WhatsApp para mostrarem na portaria.",
      );
      setAdding(false);
      return true;
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível adicionar.",
      );
      setAdding(false);
      return false;
    }
  }

  async function addOne(submit: FormEvent) {
    submit.preventDefault();
    if (invalidDocument) {
      setTriedDocument(true);
      return showError(invalidDocument);
    }
    if (invalidPhone) return showError(invalidPhone);
    const ok = await send([
      {
        name: form.name,
        documentType:
          form.documentType && form.document ? form.documentType : null,
        document: form.documentType ? form.document || null : null,
        phone: form.phone || null,
      },
    ]);
    if (ok) {
      setForm({ ...EMPTY, documentType: form.documentType });
      setTriedDocument(false);
    }
  }

  async function remove(guest: BookingGuest) {
    setRemoving(guest.id);
    try {
      await bookingsClient.removeGuest(guest.id);
      setList((current) =>
        (current ?? []).filter((item) => item.id !== guest.id),
      );
      showSuccess(`${guest.name} saiu da lista.`);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível remover.",
      );
    }
    setRemoving(null);
  }

  async function copyLink(code: string) {
    // One guest's invite link.
    try {
      await navigator.clipboard.writeText(inviteUrl(code));
      showSuccess("Link do convite copiado.");
    } catch {
      showError("Não foi possível copiar o link.");
    }
  }

  const guests = list ?? [];

  return (
    <Drawer
      open={open}
      onClose={close}
      title="Convidados"
      subtitle={`${booking.spaceName} · ${booking.period}`}
      width="lg"
    >
      {list === null ? (
        <div className="flex justify-center py-8">
          <Spinner label="Carregando convidados" />
        </div>
      ) : (
        <div className="space-y-5">
          {editable ? (
            <div className="space-y-3 rounded-xl border border-border p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-fg">
                <UserPlus aria-hidden className="size-4 text-soft" />
                Adicionar convidado
              </p>
              <form onSubmit={addOne} noValidate className="space-y-3">
                <Field
                  label="Nome completo"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    label="Documento"
                    placeholder="Sem documento"
                    value={form.documentType}
                    onChange={(e) => {
                      const type = e.target.value as DocumentType | "";
                      setTriedDocument(false);
                      // Switching type keeps the digits, in the new mask.
                      setForm({
                        ...form,
                        documentType: type,
                        document: type ? maskDocument(type, form.document) : "",
                      });
                    }}
                    options={DOCUMENT_TYPES.map((type) => ({
                      value: type,
                      label: DOCUMENT_LABELS[type],
                    }))}
                  />
                  {form.documentType && (
                    <Field
                      label={
                        form.documentType === "CPF"
                          ? "Número do CPF"
                          : "Número do RG"
                      }
                      required
                      inputMode={
                        form.documentType === "CPF" ? "numeric" : "text"
                      }
                      autoCapitalize="characters"
                      autoComplete="off"
                      placeholder={
                        form.documentType === "CPF"
                          ? "000.000.000-00"
                          : "00.000.000-0"
                      }
                      value={form.document}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          document: maskDocument(
                            form.documentType as DocumentType,
                            e.target.value,
                          ),
                        })
                      }
                      onBlur={() => form.document && setTriedDocument(true)}
                      error={showDocumentError ? invalidDocument! : undefined}
                    />
                  )}
                  <Field
                    label="WhatsApp"
                    type="tel"
                    inputMode="tel"
                    placeholder="(62) 99999-0000"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: maskPhone(e.target.value) })
                    }
                    error={invalidPhone ?? undefined}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    loading={adding}
                    disabled={
                      form.name.trim().length < 2 || Boolean(showDocumentError)
                    }
                    icon={<UserPlus className="size-4" />}
                  >
                    Adicionar
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <Alert tone="info">
              A lista não muda mais: a reserva terminou ou não está ativa.
            </Alert>
          )}

          {guests.length === 0 ? (
            <EmptyState
              icon={<Users className="size-5" />}
              title="Nenhum convidado ainda"
              description="Cada convidado recebe um convite com QR code para mostrar na portaria."
            />
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-fg">
                  {guests.length} convidado{guests.length === 1 ? "" : "s"}
                  {guests.some((guest) => guest.checkedInAt) &&
                    ` · ${guests.filter((guest) => guest.checkedInAt).length} já entr${guests.filter((guest) => guest.checkedInAt).length === 1 ? "ou" : "aram"}`}
                </p>
                <a
                  href={whatsappLink(allInvitesMessage(guests, event))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink hover:underline"
                >
                  <MessageCircle aria-hidden className="size-4" />
                  Enviar todos os convites
                </a>
              </div>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {guests.map((guest) => (
                  <li
                    key={guest.id}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">
                        {guest.name}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {[
                          formatDocument(guest.documentType, guest.document),
                          guest.phone ? formatPhone(guest.phone) : null,
                          `Código ${guest.code}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {guest.checkedInAt && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-success">
                          <CircleCheck aria-hidden className="size-3.5" />
                          Entrou às {formatTime(guest.checkedInAt)}
                        </p>
                      )}
                    </div>
                    <a
                      href={whatsappLink(
                        inviteMessage(guest, event),
                        guest.phone,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Enviar o convite de ${guest.name} pelo WhatsApp`}
                      title="Enviar pelo WhatsApp"
                      className="grid size-8 place-items-center rounded-md text-soft transition-colors hover:bg-surface-muted hover:text-fg"
                    >
                      <MessageCircle aria-hidden className="size-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyLink(guest.code)}
                      aria-label={`Copiar o link do convite de ${guest.name}`}
                      title="Copiar link"
                      className="grid size-8 place-items-center rounded-md text-soft transition-colors hover:bg-surface-muted hover:text-fg"
                    >
                      <Copy aria-hidden className="size-4" />
                    </button>
                    {editable && (
                      <button
                        type="button"
                        onClick={() => remove(guest)}
                        disabled={removing !== null}
                        aria-label={`Tirar ${guest.name} da lista`}
                        title="Tirar da lista"
                        className="grid size-8 place-items-center rounded-md text-soft transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                      >
                        {removing === guest.id ? (
                          <Spinner size="sm" label="Removendo" />
                        ) : (
                          <Trash2 aria-hidden className="size-4" />
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
