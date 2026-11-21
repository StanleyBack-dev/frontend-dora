"use client";

import { useState } from "react";
import {
  PhotoError,
  prepareSpacePhoto,
  type PreparedPhoto,
} from "@/features/spaces/model/space-photo-file";
import { useToast } from "@/shared/toast/useToast";

/** What the API accepts for a lost and found photo (bytes). */
export const ITEM_PHOTO_MAX_BYTES = 1_000_000;

// The photo of a lost and found form (a found item, a "Perdi algo"):
// shrunk in the browser to what the API accepts, with a local preview that
// is released when replaced or removed.
export function useItemPhoto() {
  const { showError } = useToast();
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [preparing, setPreparing] = useState(false);

  function drop() {
    setPhoto((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
  }

  async function pick(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    setPreparing(true);
    try {
      const prepared = await prepareSpacePhoto(file, ITEM_PHOTO_MAX_BYTES);
      setPhoto((current) => {
        if (current) URL.revokeObjectURL(current.previewUrl);
        return prepared;
      });
    } catch (cause) {
      showError(
        cause instanceof PhotoError
          ? cause.message
          : "Não foi possível usar esta foto.",
      );
    } finally {
      setPreparing(false);
      // The same photo can be picked again after removing it.
      input.value = "";
    }
  }

  return { photo, preparing, pick, drop };
}

export type ItemPhoto = ReturnType<typeof useItemPhoto>;
