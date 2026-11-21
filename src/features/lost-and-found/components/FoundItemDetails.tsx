import { CalendarClock, EyeOff, Lock, MapPin, UserCheck } from "lucide-react";
import { Badge, CardCover } from "@/design-system";
import { FOUND_ITEM_CATEGORY_ICONS } from "@/features/lost-and-found/model/found-item-icons";
import {
  FOUND_ITEM_CATEGORY_LABELS,
  FOUND_ITEM_STATUS_LABELS,
  FOUND_ITEM_STATUS_TONES,
  keepNote,
  reservedFor,
} from "@/features/lost-and-found/model/found-item-labels";
import type { FoundItemDetails as Item } from "@/shared/contracts/lost-and-found";
import { formatDateTime } from "@/shared/lib/datetime";

// A found item at a glance for the desk: its photo (or its category), the
// state and the keeping period, where and when it was found and is kept,
// who it is reserved for, and the details only the desk sees to check the
// owner.
export function FoundItemDetails({ item, now }: { item: Item; now: number }) {
  const keep = keepNote(item, now);
  const Icon = FOUND_ITEM_CATEGORY_ICONS[item.category];
  const owner = reservedFor(item);
  const facts = [
    { label: "Categoria", value: FOUND_ITEM_CATEGORY_LABELS[item.category] },
    { label: "Guardado em", value: item.storageLocation },
    { label: "Registrado por", value: item.registeredByName },
    { label: "Descrição para os moradores", value: item.description },
  ].filter((fact) => fact.value);

  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      <div className="space-y-1.5 sm:w-48 sm:shrink-0">
        {item.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed link
          <img
            src={item.photoUrl}
            alt={`Foto de ${item.title}`}
            className="aspect-[4/3] w-full rounded-xl border border-border object-cover sm:aspect-square"
          />
        ) : (
          <CardCover
            icon={<Icon />}
            label={FOUND_ITEM_CATEGORY_LABELS[item.category]}
            className="aspect-[4/3] rounded-xl sm:aspect-square"
          />
        )}
        {item.photoUrl && item.photoHidden && (
          <p className="flex items-center gap-1 text-xs text-soft">
            <EyeOff aria-hidden className="size-3.5" />
            Foto escondida dos moradores
          </p>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={FOUND_ITEM_STATUS_TONES[item.status]}>
            {FOUND_ITEM_STATUS_LABELS[item.status]}
          </Badge>
          {keep && <Badge tone={keep.tone}>{keep.text}</Badge>}
        </div>

        <div className="space-y-1.5 text-sm text-fg">
          <p className="flex items-center gap-2">
            <MapPin aria-hidden className="size-4 shrink-0 text-soft" />
            Achado em{" "}
            <strong className="font-semibold">{item.foundLocation}</strong>
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock aria-hidden className="size-4 shrink-0 text-soft" />
            {formatDateTime(item.foundAt)}
          </p>
        </div>

        {owner && (
          <div className="flex items-start gap-2.5 rounded-xl border border-brand-border bg-brand-soft p-3">
            <UserCheck
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-brand-ink"
            />
            <p className="text-sm text-fg">
              Reservado para <strong className="font-semibold">{owner}</strong>
              <span className="block text-xs text-muted">
                {item.ownerName
                  ? "Só esse morador vê o item."
                  : "Só os moradores da unidade veem o item."}
              </span>
            </p>
          </div>
        )}

        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-xs text-soft">{fact.label}</dt>
              <dd className="break-words text-fg">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {item.privateDetails && (
          <div className="rounded-xl border border-warning-border bg-warning-soft p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-fg">
              <Lock aria-hidden className="size-3.5" />
              Para conferir o dono (só a portaria vê)
            </p>
            <p className="mt-1 text-sm break-words text-fg">
              {item.privateDetails}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
