import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarClock, ChevronRight, EyeOff, MapPin } from "lucide-react";
import { Badge, Card, CardCover } from "@/design-system";
import { FOUND_ITEM_CATEGORY_ICONS } from "@/features/lost-and-found/model/found-item-icons";
import {
  FOUND_ITEM_CATEGORY_LABELS,
  myClaimView,
} from "@/features/lost-and-found/model/found-item-labels";
import type { KeptFoundItem } from "@/shared/contracts/lost-and-found";
import { formatDateTime } from "@/shared/lib/datetime";

// A kept item as the residents browse it: the photo (unless the desk hid
// it), what it is, where and when it was found, and the resident's own
// claim, if any. In a list, the footer opens the item and holds `action`
// (the "É meu" button).
export function FoundItemCard({
  item,
  action,
  linked = true,
}: {
  item: KeptFoundItem;
  action?: ReactNode;
  /** The title opens the item's page (not on that page itself). */
  linked?: boolean;
}) {
  const claim = item.myClaim ? myClaimView(item.myClaim) : null;
  const Icon = FOUND_ITEM_CATEGORY_ICONS[item.category];
  const href = `/achados-e-perdidos/${item.id}`;

  return (
    <Card className="relative flex h-full flex-col gap-3 overflow-hidden p-5">
      {item.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- short-lived signed link
        <img
          src={item.photoUrl}
          alt={`Foto de ${item.title}`}
          className="-mx-5 -mt-5 aspect-[4/3] w-[calc(100%+2.5rem)] max-w-none object-cover"
        />
      ) : (
        <CardCover
          icon={item.photoHidden ? <EyeOff /> : <Icon />}
          label={
            item.photoHidden
              ? "Foto reservada"
              : FOUND_ITEM_CATEGORY_LABELS[item.category]
          }
          className="-mx-5 -mt-5 aspect-[4/3]"
        />
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral">
          {FOUND_ITEM_CATEGORY_LABELS[item.category]}
        </Badge>
        {(item.ownerUnitLabel || item.ownerName) && item.status === "FOUND" && (
          <Badge tone="brand">
            {item.ownerName ? "Achado para você" : "Para a sua unidade"}
          </Badge>
        )}
        {claim && <Badge tone={claim.tone}>{claim.label}</Badge>}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <h2 className="text-base font-bold break-words text-fg">
          {item.title}
        </h2>
        {item.description && (
          <p className="line-clamp-2 text-[13px] text-muted">
            {item.description}
          </p>
        )}
        <p className="flex items-center gap-1.5 text-xs text-soft">
          <MapPin aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">{item.foundLocation}</span>
        </p>
        <p className="flex items-center gap-1.5 text-xs text-soft">
          <CalendarClock aria-hidden className="size-3.5 shrink-0" />
          Achado em {formatDateTime(item.foundAt)}
        </p>
      </div>
      {linked && (
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-ink hover:underline"
          >
            {item.myClaim ? "Ver meu pedido" : "Ver detalhes"}
            <ChevronRight aria-hidden className="size-4" />
          </Link>
          {action}
        </div>
      )}
    </Card>
  );
}
