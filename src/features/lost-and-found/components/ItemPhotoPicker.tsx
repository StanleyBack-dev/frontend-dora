"use client";

import { useRef } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/design-system";
import type { ItemPhoto } from "@/features/lost-and-found/model/use-item-photo";
import { SPACE_PHOTO_ACCEPT } from "@/features/spaces/model/space-photo-file";

// Take a photo with the camera or attach one; once chosen, its preview
// with "Remover".
export function ItemPhotoPicker({
  photo: { photo, preparing, pick, drop },
  alt,
}: {
  photo: ItemPhoto;
  /** The preview's description ("Foto do item"…). */
  alt: string;
}) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={cameraInput}
        type="file"
        accept={SPACE_PHOTO_ACCEPT}
        capture="environment"
        className="hidden"
        onChange={(event) => void pick(event.target)}
      />
      <input
        ref={fileInput}
        type="file"
        accept={SPACE_PHOTO_ACCEPT}
        className="hidden"
        onChange={(event) => void pick(event.target)}
      />
      {photo ? (
        <div className="flex items-end justify-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
          <img
            src={photo.previewUrl}
            alt={alt}
            className="h-32 w-32 rounded-xl border border-border object-cover"
          />
          <Button
            size="sm"
            variant="secondary"
            icon={<Trash2 className="size-4" />}
            onClick={drop}
          >
            Remover
          </Button>
        </div>
      ) : (
        <div className="mx-auto grid max-w-sm grid-cols-2 gap-2">
          <Button
            variant="brand"
            loading={preparing}
            icon={<Camera className="size-4" />}
            onClick={() => cameraInput.current?.click()}
          >
            Tirar foto
          </Button>
          <Button
            variant="brand"
            disabled={preparing}
            icon={<ImagePlus className="size-4" />}
            onClick={() => fileInput.current?.click()}
          >
            Anexar foto
          </Button>
        </div>
      )}
    </>
  );
}
