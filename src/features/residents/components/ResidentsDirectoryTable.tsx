"use client";

import { MessageCircle, Phone, UsersRound } from "lucide-react";
import {
  Avatar,
  Badge,
  DataTable,
  EmptyState,
  type DataTableColumn,
} from "@/design-system";
import { RELATIONSHIP_LABELS } from "@/features/dependents/model/dependent-labels";
import type { ResidentListing } from "@/shared/contracts/residents";
import { formatPhone } from "@/shared/lib/masks";

/** "55" + the number: the WhatsApp link of a Brazilian phone. */
const whatsappLink = (digits: string) => `https://wa.me/55${digits}`;

// The residents' directory for the gate (read only): who lives in each
// unit, how to reach them (call or WhatsApp) and their approved
// dependents. No e-mail, documents or birth dates.
export function ResidentsDirectoryTable({
  residents,
  filtered,
}: {
  residents: ResidentListing[];
  filtered: boolean;
}) {
  if (residents.length === 0) {
    return (
      <EmptyState
        icon={<UsersRound className="size-5" />}
        title={filtered ? "Nenhum morador encontrado" : "Nenhum morador"}
        description={
          filtered
            ? "Tente outro nome ou unidade, ou limpe os filtros."
            : "Os moradores com acesso ao app aparecem aqui."
        }
      />
    );
  }

  const columns: DataTableColumn<ResidentListing>[] = [
    {
      key: "name",
      label: "Morador",
      mobile: "title",
      render: (resident) => (
        <span className="flex min-w-0 items-center gap-3">
          <Avatar name={resident.name} src={resident.photoUrl} size="sm" />
          <span className="truncate font-medium text-fg">{resident.name}</span>
        </span>
      ),
    },
    {
      key: "unit",
      label: "Unidade",
      mobile: "subtitle",
      render: (resident) =>
        resident.unitLabel ? (
          <span className="flex flex-col">
            <span>{resident.unitLabel}</span>
            {resident.unitComplement && (
              <span className="text-xs text-soft">
                {resident.unitComplement}
              </span>
            )}
          </span>
        ) : (
          <span className="text-soft">Sem unidade</span>
        ),
    },
    {
      key: "phone",
      label: "Telefone",
      render: (resident) =>
        resident.phone ? (
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <a
              href={`tel:${resident.phone}`}
              className="inline-flex items-center gap-1 font-medium text-brand-ink hover:underline"
            >
              <Phone aria-hidden className="size-3.5" />
              {formatPhone(resident.phone)}
            </a>
            <a
              href={whatsappLink(resident.phone)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-success hover:underline"
            >
              <MessageCircle aria-hidden className="size-3.5" />
              WhatsApp
            </a>
          </span>
        ) : (
          <span className="text-soft">Não informado</span>
        ),
    },
    {
      key: "dependents",
      label: "Dependentes",
      render: (resident) =>
        resident.dependents.length > 0 ? (
          <span className="flex flex-wrap gap-1">
            {resident.dependents.map((dependent) => (
              <Badge key={dependent.id} tone="neutral">
                {dependent.name} · {RELATIONSHIP_LABELS[dependent.relationship]}
              </Badge>
            ))}
          </span>
        ) : (
          <span className="text-soft">Nenhum</span>
        ),
    },
  ];

  return (
    <DataTable
      rows={residents}
      columns={columns}
      getId={(resident) => resident.userId}
    />
  );
}
