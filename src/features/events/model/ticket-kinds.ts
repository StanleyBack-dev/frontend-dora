import type { TicketKind, TicketPriceMode } from "@/shared/contracts/events";
import { formatCents } from "@/shared/lib/format";

// The audiences an event can accept (the API keeps the same list), each
// once per event, with the age range it suggests; and what each pays.

export const TICKET_KINDS: {
  value: TicketKind;
  label: string;
  /** Suggested when chosen (still editable). */
  minAge: number | null;
  maxAge: number | null;
  /** Suggested price. */
  priceMode: TicketPriceMode;
  /** By a condition (not by age): a discount always asks a document. */
  condition: boolean;
}[] = [
  {
    value: "ADULT",
    label: "Adulto",
    minAge: 13,
    maxAge: 59,
    priceMode: "FULL",
    condition: false,
  },
  {
    value: "CHILD",
    label: "Criança",
    minAge: 6,
    maxAge: 12,
    priceMode: "HALF",
    condition: false,
  },
  {
    value: "INFANT",
    label: "Infantil",
    minAge: 0,
    maxAge: 5,
    priceMode: "FREE",
    condition: false,
  },
  {
    value: "SENIOR",
    label: "Idoso",
    minAge: 60,
    maxAge: null,
    priceMode: "HALF",
    condition: false,
  },
  {
    value: "STUDENT",
    label: "Estudante",
    minAge: null,
    maxAge: null,
    priceMode: "HALF",
    condition: true,
  },
  {
    value: "PCD",
    label: "PcD",
    minAge: null,
    maxAge: null,
    priceMode: "HALF",
    condition: true,
  },
  {
    value: "TEACHER",
    label: "Professor",
    minAge: null,
    maxAge: null,
    priceMode: "HALF",
    condition: true,
  },
];

export const TICKET_KIND_LABELS = Object.fromEntries(
  TICKET_KINDS.map((kind) => [kind.value, kind.label]),
) as Record<TicketKind, string>;

export const isConditionKind = (kind: TicketKind) =>
  TICKET_KINDS.some((item) => item.value === kind && item.condition);

export const PRICE_MODE_LABELS: Record<TicketPriceMode, string> = {
  FULL: "Inteira",
  HALF: "Meia",
  FREE: "Grátis",
  CUSTOM: "Outro valor",
};

/** What a mode costs from the full price (as the API computes it). */
export function priceFor(
  mode: TicketPriceMode,
  fullPriceCents: number,
  customPriceCents: number | null,
): number {
  if (mode === "FULL") return fullPriceCents;
  if (mode === "HALF") return Math.round(fullPriceCents / 2);
  if (mode === "FREE") return 0;
  return customPriceCents ?? 0;
}

/** "Meia · R$ 25,00", "Grátis". */
export const priceLabel = (mode: TicketPriceMode, priceCents: number) =>
  mode === "FREE"
    ? "Grátis"
    : mode === "CUSTOM"
      ? formatCents(priceCents)
      : `${PRICE_MODE_LABELS[mode]} · ${formatCents(priceCents)}`;
