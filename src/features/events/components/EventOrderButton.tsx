"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, Ticket, Trash2, UserRound } from "lucide-react";
import {
  Alert,
  Button,
  CollapsibleSection,
  Drawer,
  Field,
  FormIssues,
  Select,
} from "@/design-system";
import { eventsClient } from "@/features/events/api/events.client";
import { isConditionKind } from "@/features/events/model/ticket-kinds";
import { typesForAge } from "@/features/events/model/order-labels";
import { ageRange } from "@/features/events/model/ticketing-form";
import type {
  AttendeeInput,
  CondominiumEvent,
  TicketType,
} from "@/shared/contracts/events";
import { ApiClientError } from "@/shared/lib/api-client";
import { ageOn } from "@/shared/lib/birth-date";
import { formatCents } from "@/shared/lib/format";
import { useToast } from "@/shared/toast/useToast";

/** Someone the app knows (the viewer or an approved dependent). */
export type KnownPerson = { id: string; name: string; birthDate: string };

/** "SELF", "dep:<id>", "GUEST" or "" (not chosen). */
type Who = string;

type Row = {
  key: number;
  who: Who;
  /** GUEST: typed. */
  name: string;
  age: string;
  outside: boolean;
  ticketTypeId: string;
};

const MAX_PEOPLE = 20;
let seq = 0;
const newRow = (who: Who = ""): Row => ({
  key: (seq += 1),
  who,
  name: "",
  age: "",
  outside: false,
  ticketTypeId: "",
});

const typedAge = (value: string) =>
  /^\d{1,3}$/.test(value.trim()) ? Number(value) : null;

// Orders places for an event: the person, their approved dependents (ages
// from the birth dates) and other people (name and age typed, from outside
// or not), and on a paid event the ticket of each. A discount the app can't
// confirm (a guest's age, or a student/PcD/teacher ticket) asks a document
// after the order is made.
export function EventOrderButton({
  event,
  viewer,
  dependents,
  heldNames,
}: {
  event: CondominiumEvent;
  /**
   * The viewer: name, birth date (null: not informed) and whether they
   * already have a ticket for this event (then they are not offered again).
   */
  viewer: { name: string; birthDate: string | null; held: boolean };
  /** The viewer's approved dependents still without a ticket. */
  dependents: KnownPerson[];
  /** Who already has a ticket (the viewer, dependents): a note says so. */
  heldNames: string[];
}) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guestsAllowed = event.externalGuestLimit > 0;
  const eventDay = new Date(event.startsAt).toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
  const fullPrice = event.fullPriceCents ?? 0;

  /** Name and age of a row (known or typed). */
  function person(row: Row): {
    name: string;
    age: number | null;
    known: boolean;
  } {
    if (row.who === "SELF" && viewer.birthDate) {
      return {
        name: viewer.name,
        age: ageOn(viewer.birthDate, eventDay),
        known: true,
      };
    }
    if (row.who.startsWith("dep:")) {
      const dependent = dependents.find((item) => `dep:${item.id}` === row.who);
      if (dependent) {
        return {
          name: dependent.name,
          age: ageOn(dependent.birthDate, eventDay),
          known: true,
        };
      }
    }
    return { name: row.name.trim(), age: typedAge(row.age), known: false };
  }

  const typeOf = (row: Row): TicketType | undefined =>
    event.ticketTypes.find((type) => type.id === row.ticketTypeId);

  /** Whether the chosen ticket will ask this person's document. */
  function needsProof(row: Row): boolean {
    const type = typeOf(row);
    if (!type || type.priceCents >= fullPrice) return false;
    if (isConditionKind(type.kind)) return true;
    const byAge = type.minAge !== null || type.maxAge !== null;
    return byAge && !person(row).known;
  }

  /**
   * A new who/age keeps the ticket only if it still fits. Otherwise the one
   * the age points to is picked (student, PcD and teacher are left for the
   * person to choose: they ask a document).
   */
  function fitTicket(row: Row): Row {
    if (!event.ticketed) return row;
    const age = person(row).age;
    const fits = typesForAge(event.ticketTypes, age);
    if (fits.some((type) => type.id === row.ticketTypeId)) return row;
    const byAge =
      age === null ? [] : fits.filter((type) => !isConditionKind(type.kind));
    return { ...row, ticketTypeId: byAge.length === 1 ? byAge[0].id : "" };
  }

  // The viewer first (with the ticket their age points to), when known.
  const selfAvailable = Boolean(viewer.birthDate) && !viewer.held;
  const first = () => [fitTicket(newRow(selfAvailable ? "SELF" : ""))];
  const [rows, setRows] = useState<Row[]>(first);

  const setRow = (key: number, patch: Partial<Row>) =>
    setRows((current) =>
      current.map((row) =>
        row.key === key ? fitTicket({ ...row, ...patch }) : row,
      ),
    );

  const total = rows.reduce(
    (sum, row) => sum + (typeOf(row)?.priceCents ?? 0),
    0,
  );
  const outside = rows.filter(
    (row) => row.who === "GUEST" && row.outside,
  ).length;
  const proofs = rows.filter(needsProof).map((row) => person(row).name || "—");

  const missing: string[] = [];
  rows.forEach((row, index) => {
    const label = person(row).name || `Pessoa ${index + 1}`;
    if (!row.who) {
      missing.push(`Quem é a pessoa ${index + 1}.`);
      return;
    }
    if (row.who === "GUEST") {
      if (row.name.trim().length < 3) {
        missing.push(`O nome completo da pessoa ${index + 1}.`);
      }
      if (typedAge(row.age) === null) missing.push(`A idade de ${label}.`);
    }
    if (event.ticketed && !row.ticketTypeId) {
      missing.push(`O ingresso de ${label}.`);
    }
  });
  if (rows.length > event.placesLeft) {
    missing.push(`Só restam ${event.placesLeft} vagas.`);
  }
  if (outside > event.outsidePlacesLeft) {
    missing.push(
      `Só restam ${event.outsidePlacesLeft} vagas para convidados de fora.`,
    );
  }

  function close() {
    if (pending) return;
    setOpen(false);
    setTried(false);
    setError(null);
  }

  async function submit() {
    setTried(true);
    if (missing.length > 0) return;
    setPending(true);
    setError(null);
    try {
      const attendees: AttendeeInput[] = rows.map((row) => {
        const ticketTypeId = event.ticketed ? row.ticketTypeId : null;
        if (row.who === "SELF") {
          return {
            source: "SELF",
            dependentId: null,
            name: null,
            age: null,
            outside: false,
            ticketTypeId,
          };
        }
        if (row.who.startsWith("dep:")) {
          return {
            source: "DEPENDENT",
            dependentId: row.who.slice(4),
            name: null,
            age: null,
            outside: false,
            ticketTypeId,
          };
        }
        return {
          source: "GUEST",
          dependentId: null,
          name: row.name.trim(),
          age: typedAge(row.age),
          outside: row.outside,
          ticketTypeId,
        };
      });
      const order = await eventsClient.createOrder(event.id, attendees);
      if (order.status === "CONFIRMED") {
        showSuccess("Pedido confirmado.", `Pedido ${order.code}.`);
      } else {
        showSuccess(
          "Vagas reservadas por 48 horas.",
          order.totalCents > 0
            ? "Pague o PIX e envie o comprovante (e os documentos pedidos) no seu pedido."
            : "Envie os documentos pedidos no seu pedido.",
        );
      }
      setOpen(false);
      setTried(false);
      setRows(first());
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof ApiClientError
          ? cause.message
          : "Não foi possível fazer o pedido.";
      setError(message);
      showError(message);
    }
    setPending(false);
  }

  const label = event.ticketed ? "Garantir ingressos" : "Inscrever-se";
  const taken = (who: Who, key: number) =>
    rows.some((row) => row.key !== key && row.who === who);

  return (
    <>
      <Button
        variant="brand"
        icon={<Ticket className="size-4" />}
        onClick={() => setOpen(true)}
        disabled={event.placesLeft === 0}
      >
        {event.placesLeft === 0 ? "Esgotado" : label}
      </Button>
      <Drawer
        open={open}
        onClose={close}
        busy={pending}
        title={label}
        subtitle={event.title}
        footer={
          <>
            <span className="mr-auto text-sm text-muted">
              {event.ticketed ? (
                <>
                  Total{" "}
                  <strong className="text-fg">{formatCents(total)}</strong>
                </>
              ) : (
                `${rows.length} ${rows.length === 1 ? "pessoa" : "pessoas"}`
              )}
            </span>
            <Button variant="cancel" onClick={close} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={submit} loading={pending}>
              {total > 0 ? "Reservar e pagar" : "Confirmar"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormIssues missing={tried ? missing : []} error={error} />
          <p className="text-sm text-muted">
            {guestsAllowed
              ? `Restam ${event.placesLeft} vagas, ${event.outsidePlacesLeft} para convidados de fora.`
              : `Restam ${event.placesLeft} vagas. Só para moradores.`}
            {event.unitTicketLimit
              ? ` Até ${event.unitTicketLimit} por unidade.`
              : ""}
          </p>
          {heldNames.length > 0 && (
            <p className="text-sm text-muted">
              {heldNames.join(", ")}{" "}
              {heldNames.length === 1 ? "já tem" : "já têm"} ingresso neste
              evento e não {heldNames.length === 1 ? "aparece" : "aparecem"} na
              lista: cada pessoa entra uma vez.
            </p>
          )}
          {!viewer.birthDate && (
            <Alert tone="info">
              Para se incluir com a idade certa, informe sua data de nascimento
              em{" "}
              <Link href="/perfil" className="font-semibold underline">
                Meu perfil
              </Link>
              . Filhos e familiares: cadastre em{" "}
              <Link
                href="/perfil/dependentes"
                className="font-semibold underline"
              >
                Meus dependentes
              </Link>
              .
            </Alert>
          )}
          {rows.map((row, index) => {
            const who = person(row);
            const fits = typesForAge(event.ticketTypes, who.age);
            const type = typeOf(row);
            return (
              <CollapsibleSection
                key={row.key}
                icon={<UserRound />}
                title={who.name || `Pessoa ${index + 1}`}
                description={
                  [
                    who.age !== null ? `${who.age} anos` : null,
                    type
                      ? type.priceCents > 0
                        ? formatCents(type.priceCents)
                        : "Grátis"
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || undefined
                }
              >
                <Select
                  label="Quem"
                  required
                  placeholder="Escolha"
                  value={row.who}
                  onChange={(change) =>
                    setRow(row.key, { who: change.target.value })
                  }
                  options={[
                    ...(viewer.birthDate &&
                    selfAvailable &&
                    !taken("SELF", row.key)
                      ? [
                          {
                            value: "SELF",
                            label: `Eu (${viewer.name}, ${ageOn(viewer.birthDate, eventDay)} anos)`,
                          },
                        ]
                      : []),
                    ...dependents
                      .filter(
                        (dependent) => !taken(`dep:${dependent.id}`, row.key),
                      )
                      .map((dependent) => ({
                        value: `dep:${dependent.id}`,
                        label: `${dependent.name} (${ageOn(dependent.birthDate, eventDay)} anos)`,
                      })),
                    { value: "GUEST", label: "Outra pessoa" },
                  ]}
                />
                {row.who === "GUEST" && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
                      <Field
                        label="Nome completo"
                        required
                        maxLength={80}
                        value={row.name}
                        onChange={(change) =>
                          setRow(row.key, { name: change.target.value })
                        }
                      />
                      <Field
                        label="Idade"
                        required
                        inputMode="numeric"
                        maxLength={3}
                        value={row.age}
                        onChange={(change) =>
                          setRow(row.key, {
                            age: change.target.value.replace(/\D/g, ""),
                          })
                        }
                      />
                    </div>
                    {guestsAllowed && (
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
                        <input
                          type="checkbox"
                          className="size-4 accent-[var(--brand)]"
                          checked={row.outside}
                          onChange={(change) =>
                            setRow(row.key, { outside: change.target.checked })
                          }
                        />
                        Convidado de fora do condomínio
                      </label>
                    )}
                  </>
                )}
                {event.ticketed && row.who && (
                  <Select
                    label="Ingresso"
                    required
                    placeholder={
                      who.age === null
                        ? "Informe a idade primeiro"
                        : fits.length === 0
                          ? "Nenhum ingresso para esta idade"
                          : "Escolha o ingresso"
                    }
                    value={row.ticketTypeId}
                    onChange={(change) =>
                      setRow(row.key, { ticketTypeId: change.target.value })
                    }
                    options={fits.map((item) => {
                      const range = ageRange(item.minAge, item.maxAge);
                      return {
                        value: item.id,
                        label: `${item.name} · ${item.priceCents > 0 ? formatCents(item.priceCents) : "grátis"}${range ? ` (${range})` : ""}`,
                      };
                    })}
                  />
                )}
                {needsProof(row) && (
                  <p className="flex items-start gap-1.5 text-xs text-warning">
                    <FileText
                      aria-hidden
                      className="mt-0.5 size-3.5 shrink-0"
                    />
                    {type && isConditionKind(type.kind)
                      ? `Depois do pedido, envie o comprovante de ${type.name.toLowerCase()} (carteirinha, laudo…).`
                      : "Depois do pedido, envie um documento com a data de nascimento."}
                  </p>
                )}
                {rows.length > 1 && (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="size-4" />}
                      onClick={() =>
                        setRows((current) =>
                          current.filter((item) => item.key !== row.key),
                        )
                      }
                    >
                      Remover
                    </Button>
                  </div>
                )}
              </CollapsibleSection>
            );
          })}
          <Button
            variant="secondary"
            icon={<Plus className="size-4" />}
            disabled={
              rows.length >= Math.min(MAX_PEOPLE, Math.max(1, event.placesLeft))
            }
            onClick={() => setRows((current) => [...current, newRow()])}
          >
            Adicionar pessoa
          </Button>
          {proofs.length > 0 && (
            <Alert tone="warning">
              Documentos a enviar depois do pedido: {proofs.join(", ")}. As
              vagas ficam reservadas por 48 horas.
            </Alert>
          )}
        </div>
      </Drawer>
    </>
  );
}
