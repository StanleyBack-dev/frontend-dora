"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, CircleHelp, UserRound } from "lucide-react";
import {
  Alert,
  ChoiceCards,
  Combobox,
  type ComboboxOption,
} from "@/design-system";

import type { ResidentOption } from "@/shared/contracts/residents-search";

export type { ResidentOption };

type Mode = "none" | "unit" | "resident";

/** What the picker hands over: the unit, and the resident when chosen by name. */
export type UnitOrResidentPick = {
  unitId: string;
  resident: ResidentOption | null;
};

/** Shortest search the API answers, and the pause before asking. */
const SEARCH_MIN = 2;
const SEARCH_DELAY_MS = 300;

// Who something is for (a parcel, a found item): by the unit (address) or
// by the resident's name. The units come with the page; the residents are
// searched by the API as the person types (only those with a unit), each
// shown with their unit. By unit, every resident there is told; by name,
// only that resident. With `optional`, "Não sei" comes first and picks
// nobody.
export function UnitOrResidentPicker({
  name,
  units,
  value,
  initialResident = null,
  optional = false,
  notes,
  search,
  onChange,
}: {
  /** The radio group's name (unique in the page). */
  name: string;
  units: { id: string; label: string }[];
  /** The chosen unit (null: none yet). */
  value: string | null;
  /** Chosen by name before (a restored draft): starts on "Morador". */
  initialResident?: ResidentOption | null;
  /** May be left unknown ("Não sei"). */
  optional?: boolean;
  /** What each choice means (who is told and sees it). */
  notes: { none?: string; unit: string; resident: string };
  /** Residents whose name matches (the feature's API). */
  search: (term: string) => Promise<ResidentOption[]>;
  onChange: (pick: UnitOrResidentPick | null) => void;
}) {
  const [mode, setMode] = useState<Mode>(
    initialResident ? "resident" : value ? "unit" : optional ? "none" : "unit",
  );
  const [term, setTerm] = useState("");
  const [found, setFound] = useState<ResidentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [resident, setResident] = useState<ResidentOption | null>(
    initialResident,
  );
  const request = useRef(0);
  // The latest search function, without restarting the effect each render.
  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  // Asks the API once the typing pauses; an older answer never wins.
  useEffect(() => {
    if (mode !== "resident" || term.trim().length < SEARCH_MIN) return;
    const id = ++request.current;
    const timer = setTimeout(() => {
      setLoading(true);
      searchRef
        .current(term.trim())
        .then((list) => id === request.current && setFound(list))
        .catch(() => id === request.current && setFound([]))
        .finally(() => id === request.current && setLoading(false));
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [mode, term]);

  function switchTo(next: Mode) {
    setMode(next);
    setTerm("");
    setFound([]);
    setResident(null);
    onChange(null);
  }

  // The chosen resident stays in the list while a new search runs.
  const options: ComboboxOption[] = [
    ...(resident && !found.some((item) => item.userId === resident.userId)
      ? [resident]
      : []),
    ...found,
  ].map((item) => ({
    value: item.userId,
    label: item.name,
    description: item.unitLabel,
  }));

  const note =
    mode === "none"
      ? notes.none
      : mode === "unit"
        ? notes.unit
        : notes.resident;

  return (
    <div className="space-y-3">
      <ChoiceCards<Mode>
        name={name}
        legend="Buscar por"
        value={mode}
        onChange={switchTo}
        options={[
          ...(optional
            ? [
                {
                  value: "none" as const,
                  title: "Não sei",
                  hint: "Fica para todos os moradores",
                  icon: <CircleHelp />,
                },
              ]
            : []),
          {
            value: "unit",
            title: "Unidade",
            hint: "Bloco e número, ou rua, quadra e lote",
            icon: <Building2 />,
          },
          {
            value: "resident",
            title: "Morador",
            hint: "Pelo nome de quem mora na unidade",
            icon: <UserRound />,
          },
        ]}
      />
      {note && <Alert tone="info">{note}</Alert>}
      {mode === "unit" && (
        <Combobox
          label="Unidade"
          required
          placeholder="Digite ou escolha o bloco e o número"
          options={units.map((unit) => ({
            value: unit.id,
            label: unit.label,
          }))}
          value={value}
          onSelect={(unitId) =>
            onChange(unitId ? { unitId, resident: null } : null)
          }
          emptyText="Nenhuma unidade encontrada"
        />
      )}
      {mode === "resident" && (
        <Combobox
          label="Morador"
          required
          placeholder="Digite o nome do morador"
          options={options}
          value={resident?.userId ?? null}
          selectedLabel={
            resident ? `${resident.name} · ${resident.unitLabel}` : undefined
          }
          onInputChange={(text) => {
            setTerm(text);
            if (text.trim().length < SEARCH_MIN) setFound([]);
          }}
          loading={loading}
          emptyText={
            term.trim().length < SEARCH_MIN
              ? "Digite ao menos 2 letras do nome"
              : "Nenhum morador encontrado"
          }
          onSelect={(userId) => {
            const picked =
              [...found, ...(resident ? [resident] : [])].find(
                (item) => item.userId === userId,
              ) ?? null;
            setResident(picked);
            onChange(
              picked ? { unitId: picked.unitId, resident: picked } : null,
            );
          }}
        />
      )}
    </div>
  );
}
