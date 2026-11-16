"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarClock,
  House,
  MapPin,
  MapPinned,
  PartyPopper,
  Save,
  Ticket,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import {
  Button,
  ChoiceCards,
  CollapsibleSection,
  Field,
  FormActions,
  FormIssues,
  Select,
  TextArea,
  type ChoiceOption,
} from "@/design-system";
import { eventsClient } from "@/features/events/api/events.client";
import type {
  CondominiumEvent,
  EventAddress,
  EventInput,
} from "@/shared/contracts/events";
import { ApiClientError } from "@/shared/lib/api-client";
import { BRAZILIAN_STATES } from "@/shared/lib/brazilian-states";
import { fromLocalInput, toLocalInput } from "@/shared/lib/datetime";
import { maskCep } from "@/shared/lib/masks";
import { startNavigation } from "@/shared/lib/navigation-progress";
import { useToast } from "@/shared/toast/useToast";

const NO_NUMBER = "S/N";

type Where = "SPACE" | "OUTSIDE";
type Audience = "RESIDENTS" | "GUESTS";
type Entry = "FREE" | "PAID";

type FormState = {
  title: string;
  description: string;
  /** "" until chosen. */
  where: Where | "";
  spaceId: string;
  /** In a space, a detail; outside, the name of the place. */
  location: string;
  zip: string;
  street: string;
  number: string;
  /** The place has no number: "S/N". */
  noNumber: boolean;
  complement: string;
  district: string;
  city: string;
  state: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  audience: Audience;
  externalGuestLimit: string;
  entry: Entry;
};

const WHERE_OPTIONS: ChoiceOption<Where>[] = [
  {
    value: "SPACE",
    title: "Espaço do condomínio",
    hint: "Salão, quadra, área de lazer… cadastrados em Espaços.",
    icon: <Building2 />,
  },
  {
    value: "OUTSIDE",
    title: "Fora do condomínio",
    hint: "Outro lugar, com o endereço completo.",
    icon: <MapPinned />,
  },
];

const AUDIENCE_OPTIONS: ChoiceOption<Audience>[] = [
  {
    value: "RESIDENTS",
    title: "Só moradores",
    hint: "Ninguém de fora do condomínio.",
    icon: <House />,
  },
  {
    value: "GUESTS",
    title: "Com convidados de fora",
    hint: "Moradores podem levar convidados, até um limite.",
    icon: <UserPlus />,
  },
];

const ENTRY_OPTIONS: ChoiceOption<Entry>[] = [
  {
    value: "FREE",
    title: "Gratuito",
    hint: "Inscrição com ingresso gratuito e QR code na entrada.",
    icon: <Ticket />,
  },
  {
    value: "PAID",
    title: "Ingresso pago",
    hint: "Pago por Pix ao condomínio, com o comprovante conferido pela administração.",
    icon: <Wallet />,
  },
];

const fromEvent = (event: CondominiumEvent | null): FormState => {
  const address = event?.address ?? null;
  return {
    title: event?.title ?? "",
    description: event?.description ?? "",
    where: event ? (event.spaceId ? "SPACE" : "OUTSIDE") : "",
    spaceId: event?.spaceId ?? "",
    location: event?.location ?? "",
    zip: address ? maskCep(address.zip) : "",
    street: address?.street ?? "",
    number: address && address.number !== NO_NUMBER ? address.number : "",
    noNumber: address?.number === NO_NUMBER,
    complement: address?.complement ?? "",
    district: address?.district ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    startsAt: toLocalInput(event?.startsAt),
    endsAt: toLocalInput(event?.endsAt),
    capacity: event ? String(event.capacity) : "",
    audience: event && event.externalGuestLimit > 0 ? "GUESTS" : "RESIDENTS",
    externalGuestLimit:
      event && event.externalGuestLimit > 0
        ? String(event.externalGuestLimit)
        : "",
    entry: event?.ticketed ? "PAID" : "FREE",
  };
};

/** A whole number from a field ("" or not a number: NaN). */
const numberOf = (value: string) =>
  /^\d+$/.test(value.trim()) ? Number(value.trim()) : Number.NaN;

/** What is missing before the form can be sent (null: complete). */
// Everything still missing, in the order of the form.
function missing(form: FormState): string[] {
  const out: string[] = [];
  if (form.title.trim().length < 3) out.push("O título do evento.");
  if (!form.startsAt || !form.endsAt) out.push("O início e o fim.");
  if (!form.where) out.push("Onde será o evento.");
  if (form.where === "SPACE" && !form.spaceId) out.push("O espaço.");
  if (form.where === "OUTSIDE") {
    if (form.zip.replace(/\D/g, "").length !== 8) out.push("O CEP.");
    if (!form.street.trim()) out.push("A rua.");
    if (!form.noNumber && !form.number.trim()) out.push("O número.");
    if (!form.district.trim()) out.push("O bairro.");
    if (!form.city.trim()) out.push("A cidade.");
    if (!form.state) out.push("A UF.");
  }
  const capacity = numberOf(form.capacity);
  if (!(capacity >= 1)) out.push("A lotação total.");
  if (form.audience === "GUESTS") {
    const guests = numberOf(form.externalGuestLimit);
    if (!(guests >= 1)) out.push("Quantos convidados de fora.");
    else if (capacity >= 1 && guests > capacity) {
      out.push("Convidados de fora até a lotação total.");
    }
  }
  return out;
}

// Create or edit an event (managers), in folding sections. It is saved as a
// draft; publishing is a separate step on the event's page.
export function EventForm({
  event,
  spaces,
}: {
  event: CondominiumEvent | null;
  /** The condominium's spaces; their capacity fills the event's. */
  spaces: { id: string; name: string; capacity: number | null }[];
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [form, setForm] = useState<FormState>(() => fromEvent(event));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The missing fields show only after a submit attempt.
  const [tried, setTried] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  // Choosing a space fills the capacity with the space's (still editable).
  function chooseSpace(spaceId: string) {
    const space = spaces.find((item) => item.id === spaceId);
    setForm((current) => ({
      ...current,
      spaceId,
      capacity:
        space?.capacity != null ? String(space.capacity) : current.capacity,
    }));
  }

  const problems = missing(form);

  async function submit(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    setTried(true);
    if (problems.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const startsAt = fromLocalInput(form.startsAt);
    const endsAt = fromLocalInput(form.endsAt);
    if (!startsAt || !endsAt) {
      return setError("Informe o início e o fim do evento.");
    }
    const outside = form.where === "OUTSIDE";
    const address: EventAddress | null = outside
      ? {
          zip: form.zip.replace(/\D/g, ""),
          street: form.street.trim(),
          number: form.noNumber ? NO_NUMBER : form.number.trim(),
          complement: form.complement.trim() || null,
          district: form.district.trim(),
          city: form.city.trim(),
          state: form.state,
        }
      : null;
    const input: EventInput = {
      title: form.title,
      description: form.description.trim() || null,
      spaceId: outside ? null : form.spaceId,
      location: form.location.trim() || null,
      address,
      startsAt,
      endsAt,
      capacity: numberOf(form.capacity),
      externalGuestLimit:
        form.audience === "GUESTS" ? numberOf(form.externalGuestLimit) : 0,
      ticketed: form.entry === "PAID",
    };
    setPending(true);
    setError(null);
    try {
      const saved = event
        ? await eventsClient.update(event.id, input)
        : await eventsClient.create(input);
      showSuccess(
        event ? "Evento atualizado." : "Evento criado como rascunho.",
        event ? undefined : "Confira os detalhes e publique quando quiser.",
      );
      startNavigation();
      router.push(`/eventos/${saved.id}`);
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível salvar o evento.";
      setError(message);
      showError(message);
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <FormIssues missing={tried ? problems : []} error={error} />

      <CollapsibleSection
        icon={<PartyPopper />}
        title="O evento"
        description="Como o evento aparece para os moradores."
      >
        <Field
          label="Título"
          required
          maxLength={120}
          placeholder="Ex.: Festa de Fim de Ano"
          value={form.title}
          onChange={(change) => set("title", change.target.value)}
        />
        <TextArea
          label="Descrição"
          rows={4}
          maxLength={4000}
          placeholder="Opcional. Programação, o que levar, regras…"
          value={form.description}
          onChange={(change) => set("description", change.target.value)}
        />
      </CollapsibleSection>

      <CollapsibleSection
        icon={<CalendarClock />}
        title="Quando"
        description="Início e fim (até 7 dias)."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Início"
            type="datetime-local"
            required
            value={form.startsAt}
            onChange={(change) => set("startsAt", change.target.value)}
          />
          <Field
            label="Fim"
            type="datetime-local"
            required
            min={form.startsAt || undefined}
            value={form.endsAt}
            onChange={(change) => set("endsAt", change.target.value)}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        icon={<MapPin />}
        title="Onde"
        description="Num espaço do condomínio ou fora dele, com o endereço."
      >
        <ChoiceCards
          name="where"
          legend="Local do evento"
          options={WHERE_OPTIONS}
          value={form.where}
          onChange={(value) => set("where", value)}
        />

        {form.where === "SPACE" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Espaço"
              required
              placeholder="Escolha o espaço"
              value={form.spaceId}
              onChange={(change) => chooseSpace(change.target.value)}
              options={spaces.map((space) => ({
                value: space.id,
                label: space.name,
              }))}
            />
            <Field
              label="Detalhe do local"
              maxLength={120}
              placeholder="Opcional. Ex.: área coberta"
              value={form.location}
              onChange={(change) => set("location", change.target.value)}
            />
          </div>
        )}

        {form.where === "OUTSIDE" && (
          <div className="space-y-4">
            <Field
              label="Nome do local"
              maxLength={120}
              placeholder="Opcional. Ex.: Chácara Bela Vista"
              value={form.location}
              onChange={(change) => set("location", change.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
              <Field
                label="CEP"
                required
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                value={form.zip}
                onChange={(change) => set("zip", maskCep(change.target.value))}
              />
              <Field
                label="Rua"
                required
                maxLength={120}
                autoComplete="address-line1"
                placeholder="Ex.: Rua das Palmeiras"
                value={form.street}
                onChange={(change) => set("street", change.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
              <div>
                <Field
                  label="Número"
                  required={!form.noNumber}
                  maxLength={10}
                  inputMode="numeric"
                  disabled={form.noNumber}
                  value={form.noNumber ? NO_NUMBER : form.number}
                  onChange={(change) => set("number", change.target.value)}
                />
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-muted select-none">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--accent)]"
                    checked={form.noNumber}
                    onChange={(change) =>
                      set("noNumber", change.target.checked)
                    }
                  />
                  Sem número (S/N)
                </label>
              </div>
              <Field
                label="Complemento"
                maxLength={80}
                placeholder="Opcional. Ex.: Km 5, galpão 2"
                value={form.complement}
                onChange={(change) => set("complement", change.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem]">
              <Field
                label="Bairro"
                required
                maxLength={80}
                value={form.district}
                onChange={(change) => set("district", change.target.value)}
              />
              <Field
                label="Cidade"
                required
                maxLength={80}
                autoComplete="address-level2"
                value={form.city}
                onChange={(change) => set("city", change.target.value)}
              />
              <Select
                label="UF"
                required
                placeholder="UF"
                value={form.state}
                onChange={(change) => set("state", change.target.value)}
                options={BRAZILIAN_STATES.map((state) => ({
                  value: state,
                  label: state,
                }))}
              />
            </div>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        icon={<Users />}
        title="Quantas pessoas"
        description="A lotação total e quem pode vir."
      >
        <div className="sm:max-w-xs">
          <Field
            label="Lotação total"
            required
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="Ex.: 120"
            value={form.capacity}
            onChange={(change) => set("capacity", change.target.value)}
          />
          <p className="mt-1.5 text-xs text-soft">
            Moradores e convidados somados. Ao escolher um espaço, vem a
            capacidade dele.
          </p>
        </div>
        <ChoiceCards
          name="audience"
          legend="Quem pode vir"
          options={AUDIENCE_OPTIONS}
          value={form.audience}
          onChange={(value) => set("audience", value)}
        />
        {form.audience === "GUESTS" && (
          <div className="sm:max-w-xs">
            <Field
              label="Convidados de fora"
              required
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="Quantos, no máximo"
              value={form.externalGuestLimit}
              onChange={(change) =>
                set("externalGuestLimit", change.target.value)
              }
            />
            <p className="mt-1.5 text-xs text-soft">
              No máximo a lotação total.
            </p>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        icon={<Ticket />}
        title="Entrada"
        description="Todos entram com ingresso e QR code; escolha se ele é pago."
      >
        <ChoiceCards
          name="entry"
          legend="Ingresso"
          options={ENTRY_OPTIONS}
          value={form.entry}
          onChange={(value) => set("entry", value)}
        />
        {form.entry === "PAID" && (
          <p className="text-xs text-soft">
            Os tipos de ingresso e os valores (inteira, meia, faixas de idade)
            são definidos na etapa de ingressos.
          </p>
        )}
      </CollapsibleSection>

      <FormActions>
        <Button
          type="button"
          variant="cancel"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={pending}
          icon={<Save className="size-4" />}
        >
          {event ? "Salvar alterações" : "Criar rascunho"}
        </Button>
      </FormActions>
    </form>
  );
}
