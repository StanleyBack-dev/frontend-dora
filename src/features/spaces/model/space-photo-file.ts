// Prepares a space photo in the browser before sending: only JPEG, PNG or
// WebP files, shrunk to 1600 px on the longest side and compressed until
// they fit the API's limit. The API checks and re-encodes it again anyway.

export const SPACE_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Largest file people may pick (it is shrunk before sending). */
export const SPACE_PHOTO_PICK_MAX_BYTES = 15 * 1024 * 1024;
/** What the API accepts after the shrink (bytes). */
const SEND_MAX_BYTES = 1_150_000;
const MAX_SIDE = 1600;

export type PreparedPhoto = {
  /** Base64 without the data: prefix. */
  base64: string;
  /** Local object URL for the preview (revoke when discarded). */
  previewUrl: string;
};

export class PhotoError extends Error {}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function toBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

export async function prepareSpacePhoto(file: File): Promise<PreparedPhoto> {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new PhotoError("Use uma foto JPEG, PNG ou WebP.");
  }
  if (file.size > SPACE_PHOTO_PICK_MAX_BYTES) {
    throw new PhotoError("A foto deve ter até 15 MB.");
  }

  let bitmap: ImageBitmap;
  try {
    // Decoding proves it is a real image (not just a renamed file).
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new PhotoError("Não foi possível abrir esta imagem.");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WebP where the browser supports it, JPEG otherwise; lower the quality
  // until the file fits.
  for (const quality of [0.85, 0.75, 0.65, 0.55, 0.45]) {
    const blob =
      (await toBlob(canvas, "image/webp", quality)) ??
      (await toBlob(canvas, "image/jpeg", quality));
    if (!blob) break;
    if (blob.size <= SEND_MAX_BYTES) {
      return {
        base64: await toBase64(blob),
        previewUrl: URL.createObjectURL(blob),
      };
    }
  }
  throw new PhotoError("Esta foto ficou grande demais. Tente outra.");
}
