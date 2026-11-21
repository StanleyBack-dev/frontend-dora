"use client";

import Link from "next/link";
import { HandHelping, PackageCheck, SearchCheck } from "lucide-react";
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
  reservedFor,
} from "@/features/lost-and-found/model/found-item-labels";
import type { FoundItem } from "@/shared/contracts/lost-and-found";
import { formatDateTime } from "@/shared/lib/datetime";

/** A long badge (a name, a unit) wraps instead of being cut on phones. */
const WRAPS = "max-w-full rounded-lg whitespace-normal break-words";

/** What opening the item shows first: its claims, the item, or how it left. */
const openLabel = (item: FoundItem) =>
  item.status === "FOUND"
    ? item.pendingClaims > 0
      ? `Ver pedidos (${item.pendingClaims})`
      : "Ver item"
    : "Ver detalhes";

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
      // Phones: who it waits for, when someone may come for it.
      renderMobile: (item) =>
        item.awaitedByName ? (
          <span className="font-medium text-success">
            Aguardando retirada: {item.awaitedByName}
          </span>
        ) : (
          item.foundLocation
        ),
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
            {item.awaitedByName && (
              <Badge tone="success" className={WRAPS}>
                Aguardando retirada: {item.awaitedByName.split(" ")[0]}
              </Badge>
            )}
            {reservedFor(item) && (
              <Badge tone="brand" className={WRAPS}>
                Reservado: {reservedFor(item)}
              </Badge>
            )}
            {keep && keep.tone !== "neutral" && (
              <Badge tone={keep.tone} className={WRAPS}>
                {keep.text}
              </Badge>
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
      // The same buttons as the phone cards' footer.
      render: (item) => (
        <span className="inline-flex justify-end gap-2 whitespace-nowrap">
          <Link
            href={itemHref(item)}
            className={buttonClasses("secondary", "sm")}
          >
            {openLabel(item)}
          </Link>
          {item.status === "FOUND" && (
            <Link
              href={`${itemHref(item)}?devolver=1`}
              className={buttonClasses("primary", "sm")}
            >
              <PackageCheck aria-hidden className="mr-1.5 size-4" />
              Devolver
            </Link>
          )}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      rows={items}
      columns={columns}
      getId={(item) => item.id}
      // Phones: the item's page and, while kept, the return, without
      // opening the card.
      renderFooter={(item) => (
        <div
          className={cn(
            "grid gap-2 border-t border-border bg-surface-muted/40 p-3",
            item.status === "FOUND" && "grid-cols-2",
          )}
        >
          <Link
            href={itemHref(item)}
            className={cn(buttonClasses("secondary", "sm"), "w-full")}
          >
            {openLabel(item)}
          </Link>
          {item.status === "FOUND" && (
            <Link
              href={`${itemHref(item)}?devolver=1`}
              className={cn(buttonClasses("primary", "sm"), "w-full")}
            >
              <PackageCheck aria-hidden className="mr-1.5 size-4" />
              Devolver
            </Link>
          )}
        </div>
      )}
    />
  );
}
