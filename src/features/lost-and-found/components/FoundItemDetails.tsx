import { EyeOff, Lock, SearchCheck } from "lucide-react";
import { Badge } from "@/design-system";
import {
  FOUND_ITEM_CATEGORY_LABELS,
  FOUND_ITEM_STATUS_LABELS,
  FOUND_ITEM_STATUS_TONES,
  keepNote,
} from "@/features/lost-and-found/model/found-item-labels";
import type { FoundItemDetails as Item } from "@/shared/contracts/lost-and-found";
import { formatDateTime } from "@/shared/lib/datetime";

// A found item at a glance for the desk: its photo, what it is, where it was
// found and kept, and the private details used to check the owner.
export function FoundItemDetails({ item, now }: { item: Item; now: number }) {
  const keep = keepNote(item, now);
  const facts = [
    { label: "Categoria", value: FOUND_ITEM_CATEGORY_LABELS[item.category] },
    {
      label: "Achado",
      value: `${item.foundLocation} · ${formatDateTime(item.foundAt)}`,
    },
    { label: "Guardado em", value: item.storageLocation },
    { label: "Registrado por", value: item.registeredByName },
    { label: "Descrição para os moradores", value: item.description },
  ].filter((fact) => fact.value);

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="space-y-1.5 sm:w-44">
        {item.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed link
          <img
            src={item.photoUrl}
            alt={`Foto de ${item.title}`}
            className="h-44 w-full rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-border text-soft sm:h-44">
            <SearchCheck aria-hidden className="size-8" />
          </div>
        )}
        {item.photoUrl && item.photoHidden && (
          <p className="flex items-center gap-1 text-xs text-soft">
            <EyeOff aria-hidden className="size-3.5" />
            Foto escondida dos moradores
          </p>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={FOUND_ITEM_STATUS_TONES[item.status]}>
            {FOUND_ITEM_STATUS_LABELS[item.status]}
          </Badge>
          {keep && <Badge tone={keep.tone}>{keep.text}</Badge>}
        </div>
        <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
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
