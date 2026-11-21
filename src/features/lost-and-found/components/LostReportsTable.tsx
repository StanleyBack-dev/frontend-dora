"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, PackagePlus, SearchX } from "lucide-react";
import {
  Badge,
  Button,
  buttonClasses,
  cn,
  DataTable,
  EmptyState,
  type DataTableColumn,
} from "@/design-system";
import {
  FoundItemRegisterDrawer,
  type RegisterPrefill,
} from "@/features/lost-and-found/components/FoundItemRegisterDrawer";
import { FOUND_ITEM_CATEGORY_LABELS } from "@/features/lost-and-found/model/found-item-labels";
import {
  LOST_REPORT_STATUS_LABELS,
  LOST_REPORT_STATUS_TONES,
  lostOnLabel,
} from "@/features/lost-and-found/model/lost-report-labels";
import type { LostReport } from "@/shared/contracts/lost-and-found";
import type { StaffOption } from "@/shared/contracts/residents-search";
import { formatDateTime } from "@/shared/lib/datetime";

const itemHref = (id: string) => `/achados-e-perdidos/${id}`;

/**
 * The register form filled in from a report, its owner already named: the
 * resident (with their unit) or, for someone of the team, the staff member.
 */
const prefillFrom = (
  report: LostReport,
  staff: StaffOption[],
): RegisterPrefill => ({
  key: report.id,
  lostReportId: report.id,
  values: {
    category: report.category,
    title: report.title,
    // What the owner told is how the desk checks them: never public.
    privateDetails: report.description ?? "",
    foundLocation: report.lostLocation ?? "",
    ownerUnitId: report.unitId,
    ownerResident: report.unitId
      ? {
          userId: report.userId,
          name: report.userName,
          unitId: report.unitId,
          unitLabel: report.unitLabel ?? "",
        }
      : null,
    ownerStaff: report.unitId
      ? null
      : (staff.find((member) => member.userId === report.userId) ?? null),
  },
});

// What residents said they lost, for the desk: who, what, where and when.
// Phones show a card per report; the details open in it. An open report
// turns into a found item ("Registrar item achado"), its reporter named as
// the owner: told at once, and the report ends when it is handed back.
export function LostReportsTable({
  reports,
  open,
  units,
  staff,
}: {
  reports: LostReport[];
  /** Listing the open ones (else the closed ones). */
  open: boolean;
  /** The condominium's units, for the register form. */
  units: { id: string; label: string }[];
  /** The team, to name a staff member who reported as the owner. */
  staff: StaffOption[];
}) {
  const router = useRouter();
  const [registering, setRegistering] = useState<LostReport | null>(null);

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="size-5" />}
        title={open ? "Ninguém procurando nada" : "Nenhum aviso encerrado"}
        description={
          open
            ? "Quando alguém do condomínio avisar em “Perdi algo”, o aviso aparece aqui."
            : "Os avisos encontrados, cancelados ou sem notícias aparecem aqui."
        }
      />
    );
  }

  const columns: DataTableColumn<LostReport>[] = [
    {
      key: "item",
      label: "O que perdeu",
      mobile: "title",
      render: (report) => (
        <span className="flex min-w-0 items-center gap-3">
          {report.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- short-lived signed link
            <img
              src={report.photoUrl}
              alt=""
              className="hidden size-10 shrink-0 rounded-lg border border-border object-cover sm:block"
            />
          ) : null}
          <span className="flex min-w-0 flex-col">
            <span className="font-medium break-words text-fg">
              {report.title}
            </span>
            <span className="text-xs text-soft">
              {FOUND_ITEM_CATEGORY_LABELS[report.category]}
            </span>
          </span>
        </span>
      ),
      renderMobile: (report) => (
        <span className="font-medium text-fg">{report.title}</span>
      ),
    },
    {
      key: "who",
      label: "Quem perdeu",
      mobile: "subtitle",
      render: (report) =>
        report.unitLabel
          ? `${report.userName} · ${report.unitLabel}`
          : report.userName,
    },
    {
      key: "where",
      label: "Onde e quando",
      render: (report) =>
        [report.lostLocation, report.lostOn ? lostOnLabel(report.lostOn) : null]
          .filter(Boolean)
          .join(" · ") || "—",
    },
    {
      key: "status",
      label: "Situação",
      render: (report) => (
        <span className="flex flex-col items-start gap-1">
          <Badge tone={LOST_REPORT_STATUS_TONES[report.status]}>
            {LOST_REPORT_STATUS_LABELS[report.status]}
          </Badge>
          {report.status === "OPEN" && report.shared && (
            <Badge tone="info">No mural</Badge>
          )}
          {report.status === "OPEN" && report.spotCount > 0 && (
            <Badge tone="success">
              {report.spotCount === 1
                ? "1 vizinho achou"
                : `${report.spotCount} vizinhos acharam`}
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: "created",
      label: "Avisado em",
      render: (report) => formatDateTime(report.createdAt),
    },
    {
      key: "description",
      label: "Detalhes",
      desktop: "detail",
      render: (report) => report.description ?? "—",
    },
    {
      key: "photo",
      label: "Foto",
      desktop: "detail",
      render: (report) =>
        report.photoUrl ? (
          <a
            href={report.photoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed link */}
            <img
              src={report.photoUrl}
              alt={`Foto de ${report.title}`}
              className="h-32 w-32 rounded-xl border border-border object-cover"
            />
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      mobile: "hidden",
      render: (report) =>
        report.status === "OPEN" ? (
          <Button
            size="sm"
            className="whitespace-nowrap"
            icon={<PackagePlus className="size-4" />}
            onClick={() => setRegistering(report)}
          >
            Registrar item achado
          </Button>
        ) : report.foundItemId ? (
          <Link
            href={itemHref(report.foundItemId)}
            className={cn(buttonClasses("ghost", "sm"), "whitespace-nowrap")}
          >
            Ver o item
            <ChevronRight aria-hidden className="ml-1 size-4" />
          </Link>
        ) : null,
    },
  ];

  return (
    <>
      <DataTable
        rows={reports}
        columns={columns}
        getId={(report) => report.id}
        // Phones: the action without opening the card.
        renderFooter={(report) =>
          report.status === "OPEN" ? (
            <div className="border-t border-border bg-surface-muted/40 p-3">
              <Button
                size="sm"
                className="w-full justify-center"
                icon={<PackagePlus className="size-4" />}
                onClick={() => setRegistering(report)}
              >
                Registrar item achado
              </Button>
            </div>
          ) : report.foundItemId ? (
            <div className="border-t border-border bg-surface-muted/40 p-3">
              <Link
                href={itemHref(report.foundItemId)}
                className={cn(buttonClasses("secondary", "sm"), "w-full")}
              >
                Ver o item
              </Link>
            </div>
          ) : null
        }
      />
      <FoundItemRegisterDrawer
        open={registering !== null}
        units={units}
        staff={staff}
        prefill={registering ? prefillFrom(registering, staff) : null}
        onClose={() => setRegistering(null)}
        onDone={() => {
          setRegistering(null);
          router.refresh();
        }}
      />
    </>
  );
}
