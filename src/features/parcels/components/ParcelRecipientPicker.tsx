"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, UserRound } from "lucide-react";
import {
  Alert,
  ChoiceCards,
  Combobox,
  type ComboboxOption,
} from "@/design-system";
import { parcelsClient } from "@/features/parcels/api/parcels.client";
import type { ParcelRecipient } from "@/shared/contracts/parcels";

type Mode = "unit" | "resident";

/** What the picker hands over: the unit, and the resident when chosen by name. */
export type RecipientPick = {
  unitId: string;
  resident: ParcelRecipient | null;
};

/** Shortest search the API answers, and the pause before asking. */
const SEARCH_MIN = 2;
const SEARCH_DELAY_MS = 300;

// Who a parcel is for: by the unit (address) or by the resident's name. The
// units come with the page; the residents are searched by the API as the
// person types (only those with a unit), each shown with their unit. By
// unit, every resident there is told; by name, only that resident (a
// surprise or a gift stays private), and the notice says so.
export function ParcelRecipientPicker({
  units,
  value,
  initialResident = null,
  onChange,
}: {
  units: { id: string; label: string }[];
  /** Chosen by name before (a restored draft): starts on "Morador". */
  initialResident?: ParcelRecipient | null;
  /** The chosen unit (null: none yet). */
  value: string | null;
  onChange: (pick: RecipientPick | null) => void;
}) {
  const [mode, setMode] = useState<Mode>(initialResident ? "resident" : "unit");
  const [search, setSearch] = useState("");
  const [found, setFound] = useState<ParcelRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [resident, setResident] = useState<ParcelRecipient | null>(
    initialResident,
  );
  const request = useRef(0);

  // Asks the API once the typing pauses; an older answer never wins.
  useEffect(() => {
    if (mode !== "resident" || search.trim().length < SEARCH_MIN) return;
    const id = ++request.current;
    const timer = setTimeout(() => {
      setLoading(true);
      parcelsClient
        .recipients(search.trim())
        .then((list) => id === request.current && setFound(list))
        .catch(() => id === request.current && setFound([]))
        .finally(() => id === request.current && setLoading(false));
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [mode, search]);

  function switchTo(next: Mode) {
    setMode(next);
    setSearch("");
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

  return (
    <div className="space-y-3">
      <ChoiceCards<Mode>
        name="parcel-recipient-mode"
        legend="Buscar por"
        value={mode}
        onChange={switchTo}
        options={[
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
      <Alert tone="info">
        {mode === "unit"
          ? "Todos os moradores da unidade são avisados e veem a encomenda."
          : "Só o morador escolhido é avisado e vê a encomenda: bom para uma surpresa ou um presente. Os outros da unidade não ficam sabendo."}
      </Alert>
      {mode === "unit" ? (
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
      ) : (
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
            setSearch(text);
            if (text.trim().length < SEARCH_MIN) setFound([]);
          }}
          loading={loading}
          emptyText={
            search.trim().length < SEARCH_MIN
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
