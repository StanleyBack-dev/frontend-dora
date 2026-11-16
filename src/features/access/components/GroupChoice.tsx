"use client";

import { DoorOpen, Shield, ShieldCheck, UserRound } from "lucide-react";
import { ChoiceCards, type ChoiceOption } from "@/design-system";
import {
  GROUP_DESCRIPTIONS,
  GROUP_LABELS,
} from "@/features/access/model/access-labels";
import type { UserGroup } from "@/shared/contracts/api";

const ICONS: Record<UserGroup, React.ReactNode> = {
  USER: <UserRound />,
  CONCIERGE: <DoorOpen />,
  ADMIN: <ShieldCheck />,
  ADMIN_MASTER: <Shield />,
};

const HINTS: Record<UserGroup, string> = {
  USER: "Reserva espaços e recebe os avisos.",
  CONCIERGE: "Libera a entrada de convidados.",
  ADMIN: "Administra o condomínio.",
  ADMIN_MASTER: "Administra a plataforma.",
};

// The role of a person in the condominium, as choice cards; the full
// description of the chosen one goes below.
export function GroupChoice({
  groups,
  value,
  onChange,
  legend = "Papel no condomínio",
  error,
}: {
  groups: UserGroup[];
  value: UserGroup | "";
  onChange: (group: UserGroup) => void;
  legend?: string;
  error?: string;
}) {
  const options: ChoiceOption<UserGroup>[] = groups.map((group) => ({
    value: group,
    title: GROUP_LABELS[group],
    hint: HINTS[group],
    icon: ICONS[group],
  }));

  return (
    <div>
      <ChoiceCards
        name="group"
        legend={legend}
        options={options}
        value={value}
        onChange={onChange}
      />
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
      {value && (
        <p className="mt-1.5 text-xs text-soft">{GROUP_DESCRIPTIONS[value]}</p>
      )}
    </div>
  );
}
