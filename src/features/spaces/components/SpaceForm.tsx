"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  ClipboardList,
  Clock,
  Copy,
  ImageIcon,
  MapPin,
  Save,
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
import { spacesClient } from "@/features/spaces/api/spaces.client";
import {
  photosDraftOf,
  SpacePhotosField,
  type PhotosDraft,
} from "@/features/spaces/components/SpacePhotosField";
import {
  formatDuration,
  LIMIT_PERIODS,
  SLOT_OPTIONS,
  SPACE_KIND_ORDER,
  SPACE_KINDS,
  WEEKDAYS,
} from "@/features/spaces/model/space-labels";
import type {
  LimitPeriod,
  OpeningHours,
  Space,
  SpaceInput,
  SpaceKind,
} from "@/shared/contracts/spaces";
import { ApiClientError } from "@/shared/lib/api-client";
import { centsOf, maskMoney, moneyField } from "@/shared/lib/masks";
import { startNavigation } from "@/shared/lib/navigation-progress";
import { useToast } from "@/shared/toast/useToast";

type DayForm = { open: boolean; opensAt: string; closesAt: string };

type YesNo = "no" | "yes";
const yesNo = (value: boolean): YesNo => (value ? "yes" : "no");
const choice = (
  no: Omit<ChoiceOption<YesNo>, "value">,
  yes: Omit<ChoiceOption<YesNo>, "value">,
): ChoiceOption<YesNo>[] => [
  { value: "no", ...no },
  { value: "yes", ...yes },
];

const LIMIT_CHOICE = choice(
  { title: "Sem limite", hint: "Cada unidade reserva quantas vezes quiser." },
  {
    title: "Limitar por unidade",
    hint: "Um número máximo de reservas por período.",
  },
);
const APPROVAL_CHOICE = choice(
  {
    title: "Confirmação automática",
    hint: "A reserva vale assim que é feita.",
  },
  {
    title: "Exigir aprovação",
    hint: "Só vale depois que um gestor aprovar. Bom para salão e churrasqueira.",
  },
);
const FEE_CHOICE = choice(
  { title: "Uso gratuito", hint: "Sem taxa por reserva." },
  {
    title: "Cobrar taxa de uso",
    hint: "Gravada em cada reserva; aparece em Reservas → Taxas.",
  },
);
const GUESTS_CHOICE = choice(
  { title: "Sem lista de convidados", hint: "Só quem reserva." },
  {
    title: "Aceitar convidados",
    hint: "Convite com QR code; a portaria confere e libera a entrada.",
  },
);
const DOCUMENT_CHOICE = choice(
  { title: "Documento opcional", hint: "Nome basta para cada convidado." },
  { title: "Exigir documento", hint: "CPF ou RG de cada convidado." },
);
const RECURRING_CHOICE = choice(
  { title: "Só reservas avulsas", hint: "Uma data por vez." },
  {
    title: "Permitir reserva semanal",
    hint: "O mesmo horário toda semana (2 a 26 semanas). Gestores sempre podem.",
  },
);

type FormState = {
  name: string;
  kind: SpaceKind;
  capacity: string;
  description: string;
  usageRules: string;
  days: Record<number, DayForm>;
  slotMinutes: number;
  minAdvanceHours: string;
  maxAdvanceDays: string;
  limitOn: boolean;
  limitCount: string;
  limitPeriod: LimitPeriod;
  requiresApproval: boolean;
  cancelUntilHours: string;
  paid: boolean;
  /** Masked money ("150,00"). */
  fee: string;
  guestsAllowed: boolean;
  /** "" = no limit besides the capacity. */
  maxGuests: string;
  guestDocumentRequired: boolean;
  recurringAllowed: boolean;
};

const CLOSED: DayForm = { open: false, opensAt: "08:00", closesAt: "22:00" };

function toForm(space: Space | null): FormState {
  const rules = space?.rules;
  const days: Record<number, DayForm> = {};
  for (const { value } of WEEKDAYS) {
    const day = rules
      ? rules.openingHours.find((item) => item.weekday === value)
      : { opensAt: "08:00", closesAt: "22:00" };
    days[value] = day
      ? { open: true, opensAt: day.opensAt, closesAt: day.closesAt }
      : { ...CLOSED };
  }
  return {
    name: space?.name ?? "",
    kind: space?.kind ?? "COURT",
    capacity: space?.capacity ? String(space.capacity) : "",
    description: space?.description ?? "",
    usageRules: space?.usageRules ?? "",
    days,
    slotMinutes: rules?.slotMinutes ?? 60,
    minAdvanceHours: String(rules?.minAdvanceHours ?? 0),
    maxAdvanceDays: String(rules?.maxAdvanceDays ?? 30),
    limitOn: Boolean(rules?.unitLimit),
    limitCount: String(rules?.unitLimit?.count ?? 2),
    limitPeriod: rules?.unitLimit?.period ?? "WEEK",
    requiresApproval: rules?.requiresApproval ?? false,
    cancelUntilHours: String(rules?.cancelUntilHours ?? 0),
    paid: rules?.feeCents != null,
    fee: moneyField(rules?.feeCents ?? null),
    guestsAllowed: rules?.guests.allowed ?? false,
    maxGuests: rules?.guests.max ? String(rules.guests.max) : "",
    guestDocumentRequired: rules?.guests.documentRequired ?? false,
    recurringAllowed: rules?.recurringAllowed ?? false,
  };
}

const int = (value: string) => (value.trim() === "" ? NaN : Number(value));

function toInput(form: FormState): SpaceInput {
  const openingHours: OpeningHours[] = WEEKDAYS.filter(
    ({ value }) => form.days[value]?.open,
  ).map(({ value }) => ({
    weekday: value,
    opensAt: form.days[value]!.opensAt,
    closesAt: form.days[value]!.closesAt,
  }));
  return {
    name: form.name,
    kind: form.kind,
    capacity: form.capacity.trim() ? int(form.capacity) : null,
    description: form.description.trim() || null,
    usageRules: form.usageRules.trim() || null,
    rules: {
      openingHours,
      slotMinutes: form.slotMinutes,
      minAdvanceHours: int(form.minAdvanceHours) || 0,
      maxAdvanceDays: int(form.maxAdvanceDays) || 0,
      unitLimit: form.limitOn
        ? { count: int(form.limitCount) || 0, period: form.limitPeriod }
        : null,
      requiresApproval: form.requiresApproval,
      cancelUntilHours: int(form.cancelUntilHours) || 0,
      // Paid but without a value: the API answers with the valid range.
      feeCents: form.paid ? (centsOf(form.fee) ?? 0) : null,
      guests: {
        allowed: form.guestsAllowed,
        max: form.maxGuests.trim() ? int(form.maxGuests) || 0 : null,
        documentRequired: form.guestDocumentRequired,
      },
      recurringAllowed: form.recurringAllowed,
    },
  };
}

// Creates or edits a space: its details, when it opens and how residents
// book it. The API validates every rule and answers with readable messages.
export function SpaceForm({ space }: { space: Space | null }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [form, setForm] = useState<FormState>(() => toForm(space));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The missing fields show only after a submit attempt.
  const [tried, setTried] = useState(false);
  const [photos, setPhotos] = useState<PhotosDraft>(() =>
    photosDraftOf(space?.photos ?? []),
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const setDay = (weekday: number, patch: Partial<DayForm>) =>
    setForm((current) => ({
      ...current,
      days: {
        ...current.days,
        [weekday]: { ...current.days[weekday]!, ...patch },
      },
    }));

  /** Copies one day's hours to every open day. */
  function copyToAll(weekday: number) {
    const source = form.days[weekday]!;
    setForm((current) => ({
      ...current,
      days: Object.fromEntries(
        WEEKDAYS.map(({ value }) => [
          value,
          { open: true, opensAt: source.opensAt, closesAt: source.closesAt },
        ]),
      ),
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    if (!form.name.trim()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setPending(true);
    setError(null);
    try {
      const input = toInput(form);
      const saved = space
        ? await spacesClient.update(space.id, input)
        : await spacesClient.create(input);

      // Photos go after the space exists: removals first, then the new ones
      // one by one (each is checked by the API on its own).
      const failures: string[] = [];
      for (const photoId of photos.removed) {
        await spacesClient
          .removePhoto(saved.id, photoId)
          .catch(() => failures.push("Uma foto não pôde ser removida."));
      }
      for (const photo of photos.added) {
        await spacesClient
          .addPhoto(saved.id, photo.base64)
          .catch((cause) =>
            failures.push(
              cause instanceof ApiClientError
                ? cause.message
                : "Uma foto não pôde ser enviada.",
            ),
          );
      }

      if (failures.length > 0) {
        showError(
          "Espaço salvo, mas houve problema com as fotos.",
          [...new Set(failures)].join(" "),
        );
        // Back to the form (edit) so the photos can be sent again.
        startNavigation();
        router.push(`/gestao/reservas/espacos/${saved.id}/editar`);
      } else {
        showSuccess(space ? "Espaço atualizado." : `${saved.name} cadastrado.`);
        startNavigation();
        router.push(`/gestao/reservas/espacos/${saved.id}`);
      }
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível salvar o espaço.";
      setError(message);
      showError(message);
      setPending(false);
    }
  }

  const slotOptions = SLOT_OPTIONS.includes(form.slotMinutes)
    ? SLOT_OPTIONS
    : [...SLOT_OPTIONS, form.slotMinutes].sort((a, b) => a - b);

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <FormIssues
        missing={tried && !form.name.trim() ? ["O nome do espaço."] : []}
        error={error}
      />

      <CollapsibleSection
        icon={<MapPin />}
        title="Dados do espaço"
        description="Como o espaço aparece para os moradores."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nome"
            required
            maxLength={80}
            placeholder="Ex.: Quadra poliesportiva"
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
          />
          <Select
            label="Tipo"
            required
            value={form.kind}
            onChange={(event) => set("kind", event.target.value as SpaceKind)}
            options={SPACE_KIND_ORDER.map((kind) => ({
              value: kind,
              label: SPACE_KINDS[kind].label,
            }))}
          />
        </div>
        <Field
          label="Capacidade (pessoas)"
          type="number"
          inputMode="numeric"
          min={1}
          max={5000}
          placeholder="Opcional"
          value={form.capacity}
          onChange={(event) => set("capacity", event.target.value)}
          className="sm:max-w-xs"
        />
        <TextArea
          label="Descrição"
          rows={3}
          maxLength={1000}
          placeholder="Opcional. Ex.: coberta, piso sintético, iluminação noturna."
          value={form.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </CollapsibleSection>

      <CollapsibleSection
        icon={<ImageIcon />}
        title="Fotos"
        description="Até 3 fotos: ajudam os moradores a reconhecer o espaço."
      >
        <SpacePhotosField value={photos} onChange={setPhotos} />
      </CollapsibleSection>

      <CollapsibleSection
        icon={<Clock />}
        title="Horário de funcionamento"
        description="Os dias desmarcados ficam fechados para reserva."
      >
        <div className="divide-y divide-border rounded-xl border border-border">
          {WEEKDAYS.map(({ value, long }) => {
            const day = form.days[value]!;
            return (
              <div
                key={value}
                className="flex flex-wrap items-center gap-3 px-3 py-2.5"
              >
                <label className="flex w-28 cursor-pointer items-center gap-2 text-sm font-medium text-fg">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--brand)]"
                    checked={day.open}
                    onChange={(event) =>
                      setDay(value, { open: event.target.checked })
                    }
                  />
                  {long}
                </label>
                {day.open ? (
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <Field
                      label={`${long}: abre`}
                      hideLabel
                      type="time"
                      step={900}
                      value={day.opensAt}
                      onChange={(event) =>
                        setDay(value, { opensAt: event.target.value })
                      }
                      className="w-32"
                    />
                    <span className="text-sm text-soft">até</span>
                    <Field
                      label={`${long}: fecha`}
                      hideLabel
                      type="time"
                      step={900}
                      value={day.closesAt === "24:00" ? "23:59" : day.closesAt}
                      onChange={(event) =>
                        setDay(value, {
                          closesAt:
                            event.target.value === "23:59"
                              ? "24:00"
                              : event.target.value,
                        })
                      }
                      className="w-32"
                    />
                    <button
                      type="button"
                      onClick={() => copyToAll(value)}
                      title="Usar este horário em todos os dias"
                      className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:bg-surface-muted hover:text-fg"
                    >
                      <Copy aria-hidden className="size-3.5" />
                      Todos os dias
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-soft">Fechado</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-soft">
          Para funcionar até meia-noite, use 23:59 no horário de fechamento.
        </p>
      </CollapsibleSection>

      <CollapsibleSection
        icon={<CalendarClock />}
        title="Regras de reserva"
        description="Valem para as próximas reservas; as já feitas não mudam."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Duração de cada reserva"
            required
            value={String(form.slotMinutes)}
            onChange={(event) => set("slotMinutes", Number(event.target.value))}
            options={slotOptions.map((minutes) => ({
              value: String(minutes),
              label: formatDuration(minutes),
            }))}
          />
          <Field
            label="Antecedência mínima (horas)"
            type="number"
            inputMode="numeric"
            min={0}
            max={720}
            value={form.minAdvanceHours}
            onChange={(event) => set("minAdvanceHours", event.target.value)}
          />
          <Field
            label="Agenda aberta até (dias à frente)"
            type="number"
            inputMode="numeric"
            min={1}
            max={365}
            value={form.maxAdvanceDays}
            onChange={(event) => set("maxAdvanceDays", event.target.value)}
          />
          <Field
            label="Cancelar até (horas antes)"
            type="number"
            inputMode="numeric"
            min={0}
            max={720}
            value={form.cancelUntilHours}
            onChange={(event) => set("cancelUntilHours", event.target.value)}
          />
        </div>

        <ChoiceCards
          name="limit"
          legend="Reservas por unidade"
          options={LIMIT_CHOICE}
          value={yesNo(form.limitOn)}
          onChange={(value) => set("limitOn", value === "yes")}
        />
        <div>
          {form.limitOn && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Quantidade"
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                value={form.limitCount}
                onChange={(event) => set("limitCount", event.target.value)}
              />
              <Select
                label="Período"
                value={form.limitPeriod}
                onChange={(event) =>
                  set("limitPeriod", event.target.value as LimitPeriod)
                }
                options={(Object.keys(LIMIT_PERIODS) as LimitPeriod[]).map(
                  (period) => ({
                    value: period,
                    label: LIMIT_PERIODS[period].label,
                  }),
                )}
              />
            </div>
          )}
        </div>

        <ChoiceCards
          name="approval"
          legend="Confirmação"
          options={APPROVAL_CHOICE}
          value={yesNo(form.requiresApproval)}
          onChange={(value) => set("requiresApproval", value === "yes")}
        />
      </CollapsibleSection>

      <CollapsibleSection
        icon={<Wallet />}
        title="Taxa, convidados e recorrência"
        description="O que o morador paga pelo uso, quem pode levar e se pode reservar toda semana."
      >
        <ChoiceCards
          name="fee"
          legend="Taxa de uso"
          options={FEE_CHOICE}
          value={yesNo(form.paid)}
          onChange={(value) => set("paid", value === "yes")}
        />
        <div>
          {form.paid && (
            <div className="sm:max-w-60">
              <Field
                label="Valor por reserva (R$)"
                required
                inputMode="numeric"
                placeholder="0,00"
                value={form.fee}
                onChange={(event) => set("fee", maskMoney(event.target.value))}
              />
            </div>
          )}
        </div>

        <ChoiceCards
          name="guests"
          legend="Convidados"
          options={GUESTS_CHOICE}
          value={yesNo(form.guestsAllowed)}
          onChange={(value) => set("guestsAllowed", value === "yes")}
        />
        <div>
          {form.guestsAllowed && (
            <div className="space-y-4">
              <Field
                label="Máximo de convidados"
                type="number"
                inputMode="numeric"
                min={1}
                max={500}
                placeholder={
                  form.capacity.trim()
                    ? `Até ${Math.max(0, int(form.capacity) - 1)} (capacidade)`
                    : "Sem limite"
                }
                value={form.maxGuests}
                onChange={(event) => set("maxGuests", event.target.value)}
              />
              <ChoiceCards
                name="guestDocument"
                legend="Documento dos convidados"
                options={DOCUMENT_CHOICE}
                value={yesNo(form.guestDocumentRequired)}
                onChange={(value) =>
                  set("guestDocumentRequired", value === "yes")
                }
              />
            </div>
          )}
        </div>

        <ChoiceCards
          name="recurring"
          legend="Reserva semanal"
          options={RECURRING_CHOICE}
          value={yesNo(form.recurringAllowed)}
          onChange={(value) => set("recurringAllowed", value === "yes")}
        />
      </CollapsibleSection>

      <CollapsibleSection
        icon={<ClipboardList />}
        title="Regras de uso"
        description="Aparecem para o morador antes de reservar."
      >
        <TextArea
          label="Regras de uso"
          hideLabel
          rows={5}
          maxLength={3000}
          placeholder="Ex.: Proibido som alto após as 22h. Deixe o espaço limpo. Máximo de 20 convidados."
          value={form.usageRules}
          onChange={(event) => set("usageRules", event.target.value)}
        />
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
          {space ? "Salvar alterações" : "Cadastrar espaço"}
        </Button>
      </FormActions>
    </form>
  );
}
