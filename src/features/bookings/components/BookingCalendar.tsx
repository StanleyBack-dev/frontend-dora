"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellRing,
  CalendarCheck,
  Lock,
  Repeat,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  Select,
  Spinner,
  TextArea,
  cn,
} from "@/design-system";
import { bookingsClient } from "@/features/bookings/api/bookings.client";
import {
  datesBetween,
  formatSlot,
  noonOf,
} from "@/features/bookings/model/booking-labels";
import type {
  AvailabilitySlot,
  SpaceAvailability,
} from "@/shared/contracts/bookings";
import { ApiClientError } from "@/shared/lib/api-client";
import { dateParts, formatLongDay } from "@/shared/lib/datetime";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

type Props = {
  space: {
    id: string;
    name: string;
    usageRules: string | null;
    requiresApproval: boolean;
    /** Usage fee per booking, in cents (null: free). */
    feeCents: number | null;
    guestsAllowed: boolean;
  };
  initial: SpaceAvailability;
  /** BOOKINGS_CREATE: may book (otherwise the grid is read-only). */
  canBook: boolean;
  /** May book weekly (the space allows it, or a manager). */
  canRepeat: boolean;
};

/** 2 … 26 weeks for a weekly booking. */
const WEEK_OPTIONS = Array.from({ length: 25 }, (_, i) => i + 2);

// The person's own bookings in the app's orange, someone else's in dark red.
// Free ones stay neutral (the hover only outlines them).
const SLOT_STYLES: Record<AvailabilitySlot["state"], string> = {
  FREE: "border-border bg-surface text-fg hover:border-brand hover:text-brand-ink",
  MINE: "border-brand bg-brand text-brand-fg shadow-sm",
  TAKEN: "border-booked bg-booked text-booked-fg",
  BLOCKED: "border-dashed border-border bg-surface-muted text-soft",
  UNAVAILABLE: "border-border bg-surface-muted/60 text-soft/70",
};

const LEGEND: { state: AvailabilitySlot["state"]; label: string }[] = [
  { state: "FREE", label: "Livre" },
  { state: "TAKEN", label: "Reservado" },
  { state: "MINE", label: "Sua reserva" },
  { state: "BLOCKED", label: "Bloqueado" },
];

const SLOT_HINT: Record<AvailabilitySlot["state"], string> = {
  FREE: "Livre",
  MINE: "Sua reserva",
  TAKEN: "Reservado",
  BLOCKED: "Bloqueado",
  UNAVAILABLE: "Indisponível",
};

// The booking calendar of a space: pick a day, then a free slot. Taken and
// blocked slots stay visible so people understand the day at a glance.
export function BookingCalendar({ space, initial, canBook, canRepeat }: Props) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [availability, setAvailability] = useState(initial);
  const [loadingDate, setLoadingDate] = useState<string | null>(null);
  const [chosen, setChosen] = useState<AvailabilitySlot | null>(null);
  const [notes, setNotes] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [weeks, setWeeks] = useState(4);
  // A taken slot: offer the waiting list.
  const [waitSlot, setWaitSlot] = useState<AvailabilitySlot | null>(null);

  const dates = datesBetween(availability.firstDate, availability.lastDate);
  const strip = useRef<HTMLDivElement>(null);

  // Keep the chosen day in view inside the strip (it scrolls sideways).
  useEffect(() => {
    strip.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({
        block: "nearest",
        inline: "center",
        behavior: "smooth",
      });
  }, [availability.date]);

  async function load(date: string) {
    setLoadingDate(date);
    try {
      setAvailability(await bookingsClient.availability(space.id, date));
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível carregar os horários.",
      );
    }
    setLoadingDate(null);
  }

  function choose(slot: AvailabilitySlot) {
    setChosen(slot);
    setNotes("");
    setRepeat(false);
    setAccepted(!space.usageRules);
  }

  async function toggleWaitlist() {
    if (!waitSlot) return;
    setPending(true);
    try {
      if (waitSlot.waitlisted) {
        await bookingsClient.leaveWaitlist(space.id, waitSlot.startsAt);
        showSuccess("Você saiu da lista de espera.");
      } else {
        await bookingsClient.joinWaitlist(space.id, waitSlot.startsAt);
        showSuccess(
          "Você está na lista de espera.",
          "Se o horário for liberado, você recebe um aviso. Quem reservar primeiro fica com ele.",
        );
      }
      setWaitSlot(null);
      await load(availability.date);
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível atualizar a lista de espera.",
      );
    }
    setPending(false);
  }

  async function bookSeries(slot: AvailabilitySlot) {
    const result = await bookingsClient.createSeries({
      spaceId: space.id,
      startsAt: slot.startsAt,
      weeks,
      notes: notes.trim() || null,
    });
    const created = result.created.length;
    const pendingApproval = result.created[0]?.status === "PENDING";
    showSuccess(
      pendingApproval
        ? `${created} reservas semanais enviadas para aprovação.`
        : `${created} reservas semanais confirmadas!`,
      result.skipped.length > 0
        ? `${result.skipped.length} data${result.skipped.length === 1 ? " não pôde" : "s não puderam"} ser reservada${result.skipped.length === 1 ? "" : "s"}: ${result.skipped
            .map((item) => `${formatLongDay(item.startsAt)} (${item.reason})`)
            .join("; ")}`
        : "Todas as datas foram reservadas.",
    );
  }

  async function book() {
    if (!chosen) return;
    setPending(true);
    try {
      if (repeat) {
        await bookSeries(chosen);
        setChosen(null);
        await load(availability.date);
        router.refresh();
        setPending(false);
        return;
      }
      const booking = await bookingsClient.create({
        spaceId: space.id,
        startsAt: chosen.startsAt,
        notes: notes.trim() || null,
      });
      showSuccess(
        booking.status === "PENDING"
          ? "Reserva enviada para aprovação."
          : "Reserva confirmada!",
        booking.status === "PENDING"
          ? "Você recebe um aviso quando a administração decidir."
          : space.guestsAllowed
            ? "Adicione os convidados em Reservas: cada um recebe um convite com QR code."
            : "O convite para a agenda do celular chega no seu e-mail.",
      );
      setChosen(null);
      await load(availability.date);
      router.refresh();
    } catch (cause) {
      showError(
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível reservar.",
      );
      // Someone else may have taken it: show the day as it is now.
      await load(availability.date);
      setChosen(null);
    }
    setPending(false);
  }

  const free = availability.slots.filter((slot) => slot.state === "FREE");

  return (
    <Card className="min-w-0">
      <CardHeader
        title="Reservar"
        description={
          space.requiresApproval
            ? "Escolha o dia e o horário. A reserva passa pela aprovação da administração."
            : "Escolha o dia e o horário. A reserva é confirmada na hora."
        }
        action={<CalendarCheck aria-hidden className="size-5 text-soft" />}
      />
      <CardBody className="min-w-0 space-y-5 pt-0">
        {/* Days of the booking window: a strip that scrolls sideways. */}
        <div
          ref={strip}
          role="tablist"
          aria-label="Dias"
          className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-5 sm:scroll-px-5 sm:px-5 [&::-webkit-scrollbar]:hidden"
        >
          {dates.map((date) => {
            const parts = dateParts(noonOf(date));
            const active = date === availability.date;
            return (
              <button
                key={date}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={loadingDate !== null}
                onClick={() => load(date)}
                className={cn(
                  "flex w-14 shrink-0 snap-start flex-col items-center rounded-2xl border py-2 transition-colors",
                  active
                    ? "border-fg bg-fg text-surface"
                    : "border-border bg-surface text-fg hover:border-fg",
                )}
              >
                <span className="text-[10px] font-bold tracking-wide uppercase opacity-70">
                  {parts.weekday}
                </span>
                <span className="text-lg leading-tight font-extrabold">
                  {parts.day}
                </span>
                <span className="text-[10px] uppercase opacity-70">
                  {parts.month}
                </span>
              </button>
            );
          })}
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg capitalize">
            {formatLongDay(noonOf(availability.date))}
            {loadingDate && <Spinner size="sm" label="Carregando horários" />}
          </p>
          <ul className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
            {LEGEND.map((item) => (
              <li key={item.state} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn(
                    "size-3 rounded border",
                    SLOT_STYLES[item.state],
                  )}
                />
                {item.label}
              </li>
            ))}
          </ul>
          {availability.slots.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
              O espaço não abre neste dia.
            </p>
          ) : (
            <>
              <div
                aria-busy={loadingDate !== null}
                className={cn(
                  "grid grid-cols-2 gap-2 transition-opacity sm:grid-cols-3 xl:grid-cols-4",
                  loadingDate && "opacity-50",
                )}
              >
                {availability.slots.map((slot) => {
                  const clickable =
                    canBook &&
                    (slot.state === "FREE" || slot.state === "TAKEN");
                  return (
                    <button
                      key={slot.startsAt}
                      type="button"
                      disabled={!clickable}
                      onClick={() =>
                        slot.state === "TAKEN"
                          ? setWaitSlot(slot)
                          : choose(slot)
                      }
                      title={slot.label ?? undefined}
                      className={cn(
                        "flex min-w-0 flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-colors disabled:cursor-default",
                        SLOT_STYLES[slot.state],
                      )}
                    >
                      <span className="text-sm font-bold whitespace-nowrap tabular-nums">
                        {formatSlot(slot.startsAt, slot.endsAt)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium opacity-80">
                        {slot.state === "BLOCKED" && (
                          <Lock aria-hidden className="size-3" />
                        )}
                        {slot.waitlisted && (
                          <BellRing aria-hidden className="size-3" />
                        )}
                        {slot.state === "MINE" &&
                        slot.bookingStatus === "PENDING"
                          ? "Sua · aguardando"
                          : slot.waitlisted
                            ? "Reservado · na fila"
                            : SLOT_HINT[slot.state]}
                      </span>
                      {slot.label && slot.state !== "FREE" && (
                        <span className="mt-0.5 line-clamp-1 text-[11px] opacity-80">
                          {slot.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {free.length === 0 && (
                <p className="mt-3 text-sm text-muted">
                  Nenhum horário livre neste dia. Tente outro dia.
                </p>
              )}
            </>
          )}
        </div>

        {!canBook && (
          <Alert tone="info">
            Você pode ver os horários, mas não tem permissão para reservar. Fale
            com a administração do condomínio.
          </Alert>
        )}
        <p className="text-xs text-soft">
          Suas reservas ficam em{" "}
          <Link href="/reservas" className="font-semibold text-brand-ink">
            Reservas
          </Link>
          , onde você também cancela.
        </p>
      </CardBody>

      <Modal
        open={chosen !== null}
        onClose={() => setChosen(null)}
        title="Confirmar reserva"
        busy={pending}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setChosen(null)}
              disabled={pending}
            >
              Voltar
            </Button>
            <Button
              variant="brand"
              onClick={book}
              loading={pending}
              disabled={!accepted}
            >
              {space.requiresApproval
                ? "Enviar para aprovação"
                : repeat
                  ? `Reservar ${weeks} semanas`
                  : "Reservar"}
            </Button>
          </>
        }
      >
        {chosen && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-brand-soft p-4">
              <p className="text-xs font-bold tracking-wide text-muted uppercase">
                {space.name}
              </p>
              <p className="text-lg font-bold text-fg capitalize">
                {formatLongDay(chosen.startsAt)}
              </p>
              <p className="text-fg">
                {formatSlot(chosen.startsAt, chosen.endsAt)}
              </p>
            </div>
            {space.feeCents !== null && (
              <p className="flex items-start gap-2 rounded-xl border border-border p-3 text-sm text-fg">
                <Wallet
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-soft"
                />
                <span>
                  Taxa de uso de <strong>{formatCents(space.feeCents)}</strong>
                  {repeat ? " por semana" : ""}, lançada na cobrança do
                  condomínio.
                </span>
              </p>
            )}
            {canRepeat && (
              <div
                className={cn(
                  "rounded-xl border border-border p-3",
                  repeat && "bg-surface-muted",
                )}
              >
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-fg">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--brand)]"
                    checked={repeat}
                    onChange={(event) => setRepeat(event.target.checked)}
                  />
                  <Repeat aria-hidden className="size-4 text-soft" />
                  Repetir toda semana neste horário
                </label>
                {repeat && (
                  <div className="mt-3 sm:max-w-48">
                    <Select
                      label="Por quantas semanas"
                      value={String(weeks)}
                      onChange={(event) => setWeeks(Number(event.target.value))}
                      options={WEEK_OPTIONS.map((value) => ({
                        value: String(value),
                        label: `${value} semanas`,
                      }))}
                    />
                    <p className="mt-1.5 text-xs text-soft">
                      Datas já ocupadas ou fora das regras são puladas e
                      informadas no fim.
                    </p>
                  </div>
                )}
              </div>
            )}
            {space.requiresApproval && (
              <Alert tone="info">
                <ShieldCheck aria-hidden className="mr-1 inline size-4" />
                Este espaço exige aprovação: o horário fica guardado para você
                enquanto a administração decide.
              </Alert>
            )}
            {space.usageRules && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-fg">Regras de uso</p>
                <p className="max-h-40 overflow-y-auto rounded-xl border border-border p-3 text-sm whitespace-pre-line text-muted">
                  {space.usageRules}
                </p>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-fg">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]"
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                  />
                  Li e concordo com as regras de uso.
                </label>
              </div>
            )}
            <TextArea
              label="Observação"
              rows={2}
              maxLength={300}
              placeholder="Opcional. Ex.: aniversário, 15 convidados."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={waitSlot !== null}
        onClose={() => setWaitSlot(null)}
        title={waitSlot?.waitlisted ? "Lista de espera" : "Horário reservado"}
        busy={pending}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setWaitSlot(null)}
              disabled={pending}
            >
              Voltar
            </Button>
            <Button
              variant={waitSlot?.waitlisted ? "secondary" : "brand"}
              onClick={toggleWaitlist}
              loading={pending}
              icon={<BellRing className="size-4" />}
            >
              {waitSlot?.waitlisted
                ? "Sair da lista de espera"
                : "Entrar na lista de espera"}
            </Button>
          </>
        }
      >
        {waitSlot && (
          <div className="space-y-3 text-sm text-muted">
            <p className="font-semibold text-fg capitalize">
              {formatLongDay(waitSlot.startsAt)} ·{" "}
              {formatSlot(waitSlot.startsAt, waitSlot.endsAt)}
            </p>
            <p>
              {waitSlot.waitlisted
                ? "Você já está na lista de espera deste horário. Se ele for liberado, você recebe um aviso no app e no e-mail."
                : "Este horário já tem reserva. Entre na lista de espera: se a reserva for cancelada ou recusada, todos da lista recebem um aviso, e quem reservar primeiro fica com o horário."}
            </p>
          </div>
        )}
      </Modal>
    </Card>
  );
}
