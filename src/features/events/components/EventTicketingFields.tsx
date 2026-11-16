"use client";

import Link from "next/link";
import { Building2, Plus, Trash2, WalletCards } from "lucide-react";
import {
  Alert,
  Button,
  ChoiceCards,
  Field,
  Select,
  type ChoiceOption,
} from "@/design-system";
import {
  isConditionKind,
  PRICE_MODE_LABELS,
  priceFor,
  TICKET_KINDS,
} from "@/features/events/model/ticket-kinds";
import {
  newTicketRow,
  rowForKind,
  type TicketingForm,
  type TicketRow,
} from "@/features/events/model/ticketing-form";
import { PixReceiverFields } from "@/features/payments/components/PixReceiverFields";
import type {
  EventPixSource,
  PixReceiver,
  TicketKind,
  TicketPriceMode,
} from "@/shared/contracts/events";
import { formatCents } from "@/shared/lib/format";
import { centsOf, maskMoney } from "@/shared/lib/masks";

const PRICE_MODES: TicketPriceMode[] = ["FULL", "HALF", "FREE", "CUSTOM"];
import { formatPixKey, PIX_KEY_TYPE_LABELS } from "@/shared/lib/pix-key";

type YesNo = "no" | "yes";

const LIMIT_OPTIONS: ChoiceOption<YesNo>[] = [
  {
    value: "no",
    title: "Sem limite por unidade",
    hint: "Só a lotação e o limite de convidados valem.",
  },
  {
    value: "yes",
    title: "Limitar por unidade",
    hint: "Um máximo de ingressos para cada unidade.",
  },
];

// The ticket part of a paid event: the full price (inteira) and the
// audiences accepted (from the fixed list, each once), each paying the full
// price, half, nothing or a value of its own, with the age range the
// audience suggests; the optional limit per unit and which PIX receives
// (the condominium's or another just for this event, the key checked by its
// type).
export function EventTicketingFields({
  value,
  onChange,
  condominiumPix,
}: {
  value: TicketingForm;
  onChange: (value: TicketingForm) => void;
  /**
   * The condominium's PIX; null: not set; undefined: unknown (the manager
   * can't see payments).
   */
  condominiumPix: PixReceiver | null | undefined;
}) {
  const set = <K extends keyof TicketingForm>(
    key: K,
    field: TicketingForm[K],
  ) => onChange({ ...value, [key]: field });
  const setRow = (key: string, patch: Partial<TicketRow>) =>
    set(
      "types",
      value.types.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );

  const fullCents = centsOf(value.fullPrice) ?? 0;

  const pixOptions: ChoiceOption<EventPixSource>[] = [
    {
      value: "CONDOMINIUM",
      title: "PIX do condomínio",
      hint: condominiumPix
        ? `${condominiumPix.name} · ${PIX_KEY_TYPE_LABELS[condominiumPix.keyType]} ${formatPixKey(condominiumPix.keyType, condominiumPix.key)}`
        : condominiumPix === null
          ? "Ainda não cadastrado."
          : "O cadastrado em Administração → Pagamentos.",
      icon: <Building2 />,
    },
    {
      value: "CUSTOM",
      title: "Outro PIX",
      hint: "Só para este evento (ex.: a comissão da festa).",
      icon: <WalletCards />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="sm:max-w-60">
        <Field
          label="Valor da inteira (R$)"
          required
          inputMode="numeric"
          placeholder="0,00"
          value={value.fullPrice}
          onChange={(event) => set("fullPrice", maskMoney(event.target.value))}
        />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium text-fg">Públicos aceitos</p>
        {value.types.map((row, index) => {
          const price = priceFor(
            row.priceMode,
            fullCents,
            centsOf(row.customPrice),
          );
          return (
            <div
              key={row.key}
              className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_11rem_5rem_5rem_auto] sm:items-end"
            >
              <Select
                label={`Público ${index + 1}`}
                required
                placeholder="Escolha"
                value={row.kind}
                onChange={(event) =>
                  set(
                    "types",
                    value.types.map((item) =>
                      item.key === row.key
                        ? rowForKind(item, event.target.value as TicketKind)
                        : item,
                    ),
                  )
                }
                options={TICKET_KINDS.filter(
                  // Each audience once: the ones other rows took are left out.
                  (kind) =>
                    kind.value === row.kind ||
                    !value.types.some((other) => other.kind === kind.value),
                ).map((kind) => ({ value: kind.value, label: kind.label }))}
              />
              <div className="space-y-2">
                <Select
                  label="Paga"
                  required
                  value={row.priceMode}
                  onChange={(event) =>
                    setRow(row.key, {
                      priceMode: event.target.value as TicketPriceMode,
                    })
                  }
                  options={PRICE_MODES.map((mode) => ({
                    value: mode,
                    label:
                      mode === "CUSTOM" || mode === "FREE" || !fullCents
                        ? PRICE_MODE_LABELS[mode]
                        : `${PRICE_MODE_LABELS[mode]} · ${formatCents(priceFor(mode, fullCents, null))}`,
                  }))}
                />
                {row.priceMode === "CUSTOM" && (
                  <Field
                    label="Valor (R$)"
                    hideLabel
                    required
                    inputMode="numeric"
                    placeholder="Valor (R$)"
                    value={row.customPrice}
                    onChange={(event) =>
                      setRow(row.key, {
                        customPrice: maskMoney(event.target.value),
                      })
                    }
                  />
                )}
              </div>
              <Field
                label="Idade de"
                inputMode="numeric"
                placeholder="—"
                maxLength={3}
                value={row.minAge}
                onChange={(event) =>
                  setRow(row.key, {
                    minAge: event.target.value.replace(/\D/g, ""),
                  })
                }
              />
              <Field
                label="até"
                inputMode="numeric"
                placeholder="—"
                maxLength={3}
                value={row.maxAge}
                onChange={(event) =>
                  setRow(row.key, {
                    maxAge: event.target.value.replace(/\D/g, ""),
                  })
                }
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remover público ${index + 1}`}
                title="Remover"
                disabled={value.types.length === 1}
                onClick={() =>
                  set(
                    "types",
                    value.types.filter((item) => item.key !== row.key),
                  )
                }
              >
                <Trash2 className="size-4" />
              </Button>
              {row.kind && price < fullCents && (
                <p className="text-xs text-soft sm:col-span-5">
                  {isConditionKind(row.kind)
                    ? "Desconto por condição: o morador envia o comprovante (carteirinha, laudo…) no pedido."
                    : "Desconto por idade: quem não tem a data de nascimento no app (convidados) envia um documento no pedido."}
                </p>
              )}
            </div>
          );
        })}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-soft">
            Cada público uma vez por evento. A meia é a metade da inteira. A
            faixa de idade vem sugerida e pode ser ajustada (vazia: qualquer
            idade); quem não estiver em nenhum público não consegue o ingresso.
          </p>
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="size-4" />}
            disabled={value.types.length >= TICKET_KINDS.length}
            onClick={() => set("types", [...value.types, newTicketRow()])}
          >
            Adicionar público
          </Button>
        </div>
      </div>

      <ChoiceCards
        name="unitLimit"
        legend="Ingressos por unidade"
        options={LIMIT_OPTIONS}
        value={value.limitOn ? "yes" : "no"}
        onChange={(choice) => set("limitOn", choice === "yes")}
      />
      {value.limitOn && (
        <div className="sm:max-w-60">
          <Field
            label="Máximo por unidade"
            required
            inputMode="numeric"
            placeholder="Ex.: 10"
            value={value.unitLimit}
            onChange={(event) =>
              set("unitLimit", event.target.value.replace(/\D/g, ""))
            }
          />
        </div>
      )}

      <ChoiceCards
        name="pixSource"
        legend="Quem recebe o PIX"
        options={pixOptions}
        value={value.pixSource}
        onChange={(source) => set("pixSource", source)}
      />
      {value.pixSource === "CONDOMINIUM" && condominiumPix === null && (
        <Alert tone="warning">
          O condomínio ainda não tem PIX cadastrado: o evento só pode ser
          publicado depois do cadastro em{" "}
          <Link href="/admin/pagamentos" className="font-semibold underline">
            Administração → Pagamentos
          </Link>
          .
        </Alert>
      )}
      {value.pixSource === "CUSTOM" && (
        <PixReceiverFields
          value={value.customPix}
          onChange={(customPix) => set("customPix", customPix)}
        />
      )}
      <p className="text-xs text-soft">
        Cada pedido gera um PIX com o valor e o código do pedido. O morador tem
        48 horas para enviar o comprovante; a conferência é feita por quem cuida
        dos pagamentos.
      </p>
    </div>
  );
}
