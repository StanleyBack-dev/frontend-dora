import {
  EMPTY_PIX_RECEIVER,
  pixReceiverMissing,
  type PixReceiverForm,
} from "@/features/payments/components/PixReceiverFields";
import {
  TICKET_KIND_LABELS,
  TICKET_KINDS,
} from "@/features/events/model/ticket-kinds";
import type {
  CondominiumEvent,
  EventPixSource,
  PixReceiver,
  TicketKind,
  TicketPriceMode,
  TicketTypeInput,
} from "@/shared/contracts/events";
import { centsOf, moneyField } from "@/shared/lib/masks";
import { formatPixKey } from "@/shared/lib/pix-key";

// The ticket part of the event form: the full price (inteira) and the
// audiences accepted (from the fixed list, each once), each paying the full
// price, half, nothing or a value of its own, with an optional age range;
// an optional limit per unit and which PIX receives.

export type TicketRow = {
  /** React key (stable while editing). */
  key: string;
  /** Existing type (null: new). */
  id: string | null;
  kind: TicketKind | "";
  priceMode: TicketPriceMode;
  /** Masked money ("30,00") for CUSTOM. */
  customPrice: string;
  minAge: string;
  maxAge: string;
};

export type TicketingForm = {
  /** Masked money ("50,00"). */
  fullPrice: string;
  types: TicketRow[];
  limitOn: boolean;
  unitLimit: string;
  pixSource: EventPixSource | "";
  customPix: PixReceiverForm;
};

let rowSeq = 0;
export const newTicketRow = (patch: Partial<TicketRow> = {}): TicketRow => ({
  key: `row-${(rowSeq += 1)}`,
  id: null,
  kind: "",
  priceMode: "FULL",
  customPrice: "",
  minAge: "",
  maxAge: "",
  ...patch,
});

const ageField = (age: number | null) => (age === null ? "" : String(age));

/** A row for an audience, with its suggested ages and price. */
export function rowForKind(row: TicketRow, kind: TicketKind): TicketRow {
  const suggested = TICKET_KINDS.find((item) => item.value === kind);
  return {
    ...row,
    kind,
    priceMode: suggested?.priceMode ?? "FULL",
    minAge: ageField(suggested?.minAge ?? null),
    maxAge: ageField(suggested?.maxAge ?? null),
  };
}

/** The receiver as the form edits it (CPF and CNPJ masked again). */
export const pixFormOf = (pix: PixReceiver | null): PixReceiverForm =>
  pix
    ? {
        keyType: pix.keyType,
        key: formatPixKey(pix.keyType, pix.key),
        name: pix.name,
        city: pix.city,
      }
    : EMPTY_PIX_RECEIVER;

export function ticketingFrom(event: CondominiumEvent | null): TicketingForm {
  return {
    fullPrice: moneyField(event?.fullPriceCents ?? null),
    types:
      event && event.ticketTypes.length > 0
        ? event.ticketTypes.map((type) =>
            newTicketRow({
              id: type.id,
              kind: type.kind,
              priceMode: type.priceMode,
              customPrice: moneyField(type.customPriceCents),
              minAge: ageField(type.minAge),
              maxAge: ageField(type.maxAge),
            }),
          )
        : [
            rowForKind(newTicketRow(), "ADULT"),
            rowForKind(newTicketRow(), "CHILD"),
            rowForKind(newTicketRow(), "INFANT"),
          ],
    limitOn: event?.unitTicketLimit != null,
    unitLimit: event?.unitTicketLimit ? String(event.unitTicketLimit) : "",
    pixSource: event?.pixSource ?? "",
    customPix: pixFormOf(event?.customPix ?? null),
  };
}

const age = (value: string): number | null | "bad" => {
  if (!value.trim()) return null;
  return /^\d{1,3}$/.test(value.trim()) && Number(value) <= 120
    ? Number(value)
    : "bad";
};

/** What is still missing in the ticket part (in form order). */
export function ticketingMissing(form: TicketingForm): string[] {
  const out: string[] = [];
  if (!(centsOf(form.fullPrice) ?? 0)) out.push("O valor da inteira.");
  if (form.types.length === 0) out.push("Pelo menos um público aceito.");
  form.types.forEach((row, index) => {
    if (!row.kind) {
      out.push(`O público da linha ${index + 1}.`);
      return;
    }
    const label = TICKET_KIND_LABELS[row.kind];
    if (row.priceMode === "CUSTOM" && centsOf(row.customPrice) === null) {
      out.push(`O valor de "${label}".`);
    }
    const min = age(row.minAge);
    const max = age(row.maxAge);
    if (
      min === "bad" ||
      max === "bad" ||
      (min !== null && max !== null && min > max)
    ) {
      out.push(`A faixa de idade de "${label}".`);
    }
  });
  if (form.limitOn && !/^\d+$/.test(form.unitLimit.trim())) {
    out.push("O limite de ingressos por unidade.");
  }
  if (!form.pixSource) out.push("Qual PIX recebe os ingressos.");
  if (form.pixSource === "CUSTOM") {
    out.push(...pixReceiverMissing(form.customPix));
  }
  return out;
}

/** The ticket part of the event input (call when nothing is missing). */
export function ticketingInput(form: TicketingForm): {
  fullPriceCents: number | null;
  ticketTypes: TicketTypeInput[];
  unitTicketLimit: number | null;
  pixSource: EventPixSource | null;
  customPix: PixReceiver | null;
} {
  const ageOf = (value: string) => {
    const parsed = age(value);
    return parsed === "bad" ? null : parsed;
  };
  return {
    fullPriceCents: centsOf(form.fullPrice),
    ticketTypes: form.types.flatMap((row) =>
      row.kind
        ? [
            {
              id: row.id,
              kind: row.kind,
              priceMode: row.priceMode,
              customPriceCents:
                row.priceMode === "CUSTOM"
                  ? (centsOf(row.customPrice) ?? 0)
                  : null,
              minAge: ageOf(row.minAge),
              maxAge: ageOf(row.maxAge),
            },
          ]
        : [],
    ),
    unitTicketLimit: form.limitOn ? Number(form.unitLimit.trim()) : null,
    pixSource: form.pixSource || null,
    customPix:
      form.pixSource === "CUSTOM" && form.customPix.keyType
        ? {
            keyType: form.customPix.keyType,
            key: form.customPix.key.trim(),
            name: form.customPix.name.trim(),
            city: form.customPix.city.trim(),
          }
        : null,
  };
}

/** "6 a 12 anos", "a partir de 13 anos", "até 5 anos" (null: any age). */
export function ageRange(
  minAge: number | null,
  maxAge: number | null,
): string | null {
  if (minAge !== null && maxAge !== null) {
    if (minAge === 0) return `até ${maxAge} anos`;
    return minAge === maxAge ? `${minAge} anos` : `${minAge} a ${maxAge} anos`;
  }
  if (minAge !== null) return `a partir de ${minAge} anos`;
  if (maxAge !== null) return `até ${maxAge} anos`;
  return null;
}
