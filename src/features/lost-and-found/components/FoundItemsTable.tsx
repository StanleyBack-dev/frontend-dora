"use client";

import Link from "next/link";
import { ChevronRight, HandHelping, SearchCheck } from "lucide-react";
import {
  Badge,
  buttonClasses,
  cn,
  DataTable,
  EmptyState,
  type DataTableColumn,
} from "@/design-system";
import {
  FOUND_ITEM_CATEGORY_LABELS,
  FOUND_ITEM_STATUS_LABELS,
  FOUND_ITEM_STATUS_TONES,
  foundItemOutcome,
  keepNote,
} from "@/features/lost-and-found/model/found-item-labels";
import type { FoundItem } from "@/shared/contracts/lost-and-found";
import { formatDateTime } from "@/shared/lib/datetime";

const itemHref = (item: FoundItem) => `/achados-e-perdidos/${item.id}`;

// The condominium's found items for the gate and the administration. The
// claims, the return with a signature, donating and discarding are on the
// item's page.
export function FoundItemsTable({
  items,
  filtered,
  now,
}: {
  items: FoundItem[];
  filtered: boolean;
  /** This request's time (the keeping period). */
  now: number;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<SearchCheck className="size-5" />}
        title={filtered ? "Nenhum item encontrado" : "Nenhum item guardado"}
        description={
          filtered
            ? "Tente outra busca, categoria ou situação, ou limpe os filtros."
            : "Os itens achados no condomínio aparecem aqui."
        }
      />
    );
  }

  const columns: DataTableColumn<FoundItem>[] = [
    {
      key: "item",
      label: "Item",
      mobile: "title",
      render: (item) => (
        <span className="flex min-w-0 items-center gap-3">
          {item.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- short-lived signed link
            <img
              src={item.photoUrl}
              alt=""
              className="hidden size-10 shrink-0 rounded-lg border border-border object-cover sm:block"
            />
          ) : null}
          <span className="flex min-w-0 flex-col">
            <Link
              href={itemHref(item)}
              className="truncate font-medium text-fg hover:underline"
            >
              {item.title}
            </Link>
            <span className="truncate text-xs text-soft">
              {FOUND_ITEM_CATEGORY_LABELS[item.category]}
            </span>
          </span>
        </span>
      ),
      renderMobile: (item) => (
        <span className="font-medium text-fg">{item.title}</span>
      ),
    },
    {
      key: "found",
      label: "Achado",
      mobile: "subtitle",
      render: (item) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{item.foundLocation}</span>
          <span className="text-xs text-soft">
            {formatDateTime(item.foundAt)}
          </span>
        </span>
      ),
    },
    {
      key: "storage",
      label: "Guardado em",
      render: (item) => item.storageLocation,
    },
    {
      key: "status",
      label: "Situação",
      render: (item) => {
        const keep = keepNote(item, now);
        return (
          <span className="flex flex-col items-start gap-1">
            <Badge tone={FOUND_ITEM_STATUS_TONES[item.status]}>
              {FOUND_ITEM_STATUS_LABELS[item.status]}
            </Badge>
            {item.pendingClaims > 0 && (
              <Badge tone="info">
                <HandHelping aria-hidden className="mr-1 size-3" />
                {item.pendingClaims === 1
                  ? "1 pedido"
                  : `${item.pendingClaims} pedidos`}
              </Badge>
            )}
            {keep && keep.tone !== "neutral" && (
              <Badge tone={keep.tone}>{keep.text}</Badge>
            )}
          </span>
        );
      },
    },
    {
      key: "registered",
      label: "Registrado por",
      desktop: "detail",
      render: (item) => item.registeredByName ?? "—",
    },
    {
      key: "description",
      label: "Descrição",
      desktop: "detail",
      render: (item) => item.description ?? "—",
    },
    {
      key: "outcome",
      label: "Saída",
      desktop: "detail",
      render: (item) =>
        foundItemOutcome(item) ?? keepNote(item, now)?.text ?? "Ainda guardado",
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      mobile: "hidden",
      render: (item) => (
        <Link href={itemHref(item)} className={buttonClasses("ghost", "sm")}>
          Abrir
          <ChevronRight aria-hidden className="ml-1 size-4" />
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      rows={items}
      columns={columns}
      getId={(item) => item.id}
      renderExpanded={(item) => (
        <div className="border-t border-border bg-surface-muted/40 p-3">
          <Link
            href={itemHref(item)}
            className={cn(buttonClasses("secondary", "sm"), "w-full")}
          >
            {item.status === "FOUND"
              ? "Ver pedidos e devolver"
              : "Ver detalhes"}
            <ChevronRight aria-hidden className="ml-1 size-4" />
          </Link>
        </div>
      )}
    />
  );
}
