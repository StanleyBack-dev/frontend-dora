"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/design-system";
import {
  PhotoError,
  prepareSpacePhoto,
  SPACE_PHOTO_ACCEPT,
  type PreparedPhoto,
} from "@/features/spaces/model/space-photo-file";
import { SPACE_PHOTO_LIMIT, type SpacePhoto } from "@/shared/contracts/spaces";
import { useToast } from "@/shared/toast/useToast";

/** The photos as the form edits them; sent after the space is saved. */
export type PhotosDraft = {
  /** Already stored and kept. */
  kept: SpacePhoto[];
  /** Stored photos the manager removed. */
  removed: string[];
  /** New ones, prepared in the browser. */
  added: (PreparedPhoto & { key: string })[];
};

export const photosDraftOf = (photos: SpacePhoto[]): PhotosDraft => ({
  kept: photos,
  removed: [],
  added: [],
});

// Up to 3 photos of the space: thumbnails with remove buttons and an "add"
// tile while there is room. Files are checked and shrunk in the browser.
export function SpacePhotosField({
  value,
  onChange,
}: {
  value: PhotosDraft;
  onChange: (value: PhotosDraft) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { showError } = useToast();
  const [preparing, setPreparing] = useState(false);
  const count = value.kept.length + value.added.length;
  const room = SPACE_PHOTO_LIMIT - count;

  async function pick(files: FileList | null) {
    if (!files || files.length === 0) return;
    const chosen = Array.from(files).slice(0, room);
    if (files.length > room) {
      showError(`Cada espaço pode ter até ${SPACE_PHOTO_LIMIT} fotos.`);
    }
    setPreparing(true);
    const added: PhotosDraft["added"] = [];
    for (const file of chosen) {
      try {
        const photo = await prepareSpacePhoto(file);
        added.push({ ...photo, key: crypto.randomUUID() });
      } catch (cause) {
        showError(
          cause instanceof PhotoError
            ? `${file.name}: ${cause.message}`
            : `${file.name}: não foi possível preparar a foto.`,
        );
      }
    }
    setPreparing(false);
    if (added.length > 0)
      onChange({ ...value, added: [...value.added, ...added] });
    if (input.current) input.current.value = "";
  }

  const removeKept = (id: string) =>
    onChange({
      ...value,
      kept: value.kept.filter((photo) => photo.id !== id),
      removed: [...value.removed, id],
    });

  const removeAdded = (key: string) => {
    const photo = value.added.find((item) => item.key === key);
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    onChange({
      ...value,
      added: value.added.filter((item) => item.key !== key),
    });
  };

  const tiles = [
    ...value.kept.map((photo) => ({
      id: photo.id,
      src: photo.url,
      remove: () => removeKept(photo.id),
    })),
    ...value.added.map((photo) => ({
      id: photo.key,
      src: photo.previewUrl,
      remove: () => removeAdded(photo.key),
    })),
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((tile, index) => (
          <div
            key={tile.id}
            className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URLs and local previews */}
            <img
              src={tile.src}
              alt={`Foto ${index + 1} do espaço`}
              className="size-full object-cover"
            />
            {index === 0 && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-fg/80 px-2 py-0.5 text-[10px] font-bold text-surface">
                Capa
              </span>
            )}
            <button
              type="button"
              onClick={tile.remove}
              aria-label={`Remover foto ${index + 1}`}
              className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-fg/80 text-surface transition-colors hover:bg-danger"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        ))}
        {room > 0 && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={preparing}
            className={cn(
              "flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-muted transition-colors",
              "hover:border-brand hover:bg-brand-soft hover:text-fg disabled:cursor-wait",
            )}
          >
            {preparing ? (
              <Loader2 aria-hidden className="size-5 animate-spin" />
            ) : (
              <ImagePlus aria-hidden className="size-5" />
            )}
            {preparing ? "Preparando…" : "Adicionar foto"}
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={SPACE_PHOTO_ACCEPT}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => pick(event.target.files)}
      />
      <p className="text-xs text-soft">
        Até {SPACE_PHOTO_LIMIT} fotos JPEG, PNG ou WebP (até 15 MB cada). O app
        reduz as fotos antes de enviar; a primeira é a capa.
      </p>
    </div>
  );
}
