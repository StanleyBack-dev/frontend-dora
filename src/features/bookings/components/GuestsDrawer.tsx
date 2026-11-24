"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CircleCheck,
  Copy,
  ListPlus,
  MessageCircle,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  Alert,
  Button,
  ChoiceCards,
  type ChoiceOption,
  CollapsibleSection,
  Drawer,
  EmptyState,
  Field,
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

/** The document asked of a guest: none, CPF or RG (cards in the form). */
const DOCUMENT_OPTIONS: ChoiceOption<DocumentType | "NONE">[] = [
  { value: "NONE", title: "Sem documento", hint: "Só o nome." },
  { value: "CPF", title: DOCUMENT_LABELS.CPF, hint: "11 números." },
  { value: "RG", title: DOCUMENT_LABELS.RG, hint: "Números e um X no fim." },
];

/** Most guests sent in one go (the API's limit per request). */
const MAX_PER_SEND = 100;

const NAME_FIELD_ID = "guest-name";

/** A guest typed but not sent yet (the pre-list). */
type DraftGuest = GuestInput & { key: number };

/** Same person: same name (any case or spacing) or same document. */
function samePerson(
  a: Pick<GuestInput, "name" | "document">,
  b: Pick<GuestInput, "name" | "document">,
): boolean {
  const name = (value: string) =>
    value.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  const digits = (value: string | null | undefined) =>
    (value ?? "").replace(/[^0-9xX]/g, "").toUpperCase();
  return (
    name(a.name) === name(b.name) ||
    (digits(a.document) !== "" && digits(a.document) === digits(b.document))
  );
}

// The guest list of a booking. People are typed into a pre-list first
// (nothing is sent while typing) and added all at once; then each one gets
// the invite (QR code for the gate) by WhatsApp, or all of them in one
// message, and anyone can be taken off the list. Changes are possible while
// the booking is on and hasn't ended. The pre-list survives closing the
// drawer, until it is added.
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
  const [draft, setDraft] = useState<DraftGuest[]>([]);
  const [nextKey, setNextKey] = useState(1);
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

  // Puts the typed guest in the pre-list (nothing is sent yet) and gets the
  // form ready for the next one.
  function include(submit: FormEvent) {
    submit.preventDefault();
    if (invalidDocument) {
      setTriedDocument(true);
      return showError(invalidDocument);
    }
    if (invalidPhone) return showError(invalidPhone);
    const guest: GuestInput = {
      name: form.name.trim().replace(/\s+/g, " "),
      documentType:
        form.documentType && form.document ? form.documentType : null,
      document: form.documentType ? form.document || null : null,
      phone: form.phone || null,
    };
    if (draft.some((item) => samePerson(item, guest))) {
      return showError(`${guest.name} já está na lista para adicionar.`);
    }
    if ((list ?? []).some((item) => samePerson(item, guest))) {
      return showError(`${guest.name} já é convidado desta reserva.`);
    }
    if (draft.length >= MAX_PER_SEND) {
      return showError(
        `Adicione estes ${MAX_PER_SEND} primeiro e depois continue a lista.`,
      );
    }
    setDraft((current) => [...current, { ...guest, key: nextKey }]);
    setNextKey((key) => key + 1);
    // The document type stays: guests usually come with the same one.
    setForm({ ...EMPTY, documentType: form.documentType });
    setTriedDocument(false);
    document.getElementById(NAME_FIELD_ID)?.focus();
  }

  // Sends the whole pre-list in one request; on failure it stays to fix.
  async function addAll() {
    if (draft.length === 0) return;
    const ok = await send(
      draft.map(({ name, documentType, document, phone }) => ({
        name,
        documentType,
        document,
        phone,
      })),
    );
    if (ok) setDraft([]);
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
      busy={adding}
      footer={
        editable && draft.length > 0 ? (
          <>
            <Button
              variant="secondary"
              onClick={() => setDraft([])}
              disabled={adding}
            >
              Limpar lista
            </Button>
            <Button
              onClick={addAll}
              loading={adding}
              icon={<UserPlus className="size-4" />}
            >
              {draft.length === 1
                ? "Adicionar 1 convidado"
                : `Adicionar ${draft.length} convidados`}
            </Button>
          </>
        ) : undefined
      }
    >
      {list === null ? (
        <div className="flex justify-center py-8">
          <Spinner label="Carregando convidados" />
        </div>
      ) : (
        <div className="space-y-4">
          {editable ? (
            <CollapsibleSection
              icon={<UserPlus />}
              title="Adicionar convidado"
              description="Inclua todos na lista e depois adicione de uma vez."
            >
              <form onSubmit={include} noValidate className="space-y-3">
                <Field
                  id={NAME_FIELD_ID}
                  label="Nome completo"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <ChoiceCards
                  name="documentType"
                  legend="Documento"
                  options={DOCUMENT_OPTIONS}
                  value={form.documentType || "NONE"}
                  onChange={(value) => {
                    const type = value === "NONE" ? "" : value;
                    setTriedDocument(false);
                    // Switching type keeps the digits, in the new mask.
                    setForm({
                      ...form,
                      documentType: type,
                      document: type ? maskDocument(type, form.document) : "",
                    });
                  }}
                />
                <div className="grid gap-3 sm:grid-cols-2">
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
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-soft">
                    Inclua todos e depois adicione de uma vez.
                  </p>
                  <Button
                    type="submit"
                    size="sm"
                    variant="secondary"
                    disabled={
                      adding ||
                      form.name.trim().length < 2 ||
                      Boolean(showDocumentError)
                    }
                    icon={<ListPlus className="size-4" />}
                  >
                    Incluir na lista
                  </Button>
                </div>
              </form>

              {draft.length > 0 && (
                <div className="space-y-2 border-t border-border pt-3">
                  <p className="text-sm font-semibold text-fg">
                    Para adicionar ({draft.length})
                  </p>
                  <ul className="divide-y divide-border rounded-lg border border-dashed border-border-strong bg-surface-muted">
                    {draft.map((guest) => (
                      <li
                        key={guest.key}
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-fg">
                            {guest.name}
                          </p>
                          {(guest.document || guest.phone) && (
                            <p className="truncate text-xs text-muted">
                              {[
                                guest.documentType && guest.document
                                  ? `${DOCUMENT_LABELS[guest.documentType]} ${guest.document}`
                                  : null,
                                guest.phone,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((current) =>
                              current.filter((item) => item.key !== guest.key),
                            )
                          }
                          disabled={adding}
                          aria-label={`Tirar ${guest.name} da lista para adicionar`}
                          title="Tirar da lista"
                          className="grid size-8 shrink-0 place-items-center rounded-md text-soft transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                        >
                          <X aria-hidden className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-soft">
                    Ainda não foram adicionados: toque em “Adicionar” no fim do
                    painel.
                  </p>
                </div>
              )}
            </CollapsibleSection>
          ) : (
            <Alert tone="info">
              A lista não muda mais: a reserva terminou ou não está ativa.
            </Alert>
          )}

          <CollapsibleSection
            icon={<Users />}
            title={`Convidados (${guests.length})`}
            description="Cada convidado recebe um convite com QR code para mostrar na portaria."
          >
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
          </CollapsibleSection>
        </div>
      )}
    </Drawer>
  );
}
