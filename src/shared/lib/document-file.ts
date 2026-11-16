// Prepares a document in the browser before sending (a PIX receipt, a
// birth certificate, a student card…): a PDF goes as it is (up to the
// API's limit); a photo or screenshot is shrunk to 2000 px on the longest
// side and compressed until it fits. The API checks the content again (and
// re-encodes images without metadata).

export const DOCUMENT_ACCEPT =
  "image/jpeg,image/png,image/webp,application/pdf";

/** What the API takes (bytes, before base64). */
const SEND_MAX_BYTES = 1_150_000;
/** Largest file people may pick (images get shrunk). */
const PICK_MAX_BYTES = 15 * 1024 * 1024;
const MAX_SIDE = 2000;

export class DocumentFileError extends Error {}

async function toBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

const toBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );

/** The document as base64 (no data: prefix), ready for the API. */
export async function prepareDocumentFile(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    if (file.size > SEND_MAX_BYTES) {
      throw new DocumentFileError(
        "O PDF deve ter até 1,1 MB. Envie uma foto ou um print.",
      );
    }
    return toBase64(file);
  }
  if (!file.type.startsWith("image/")) {
    throw new DocumentFileError("Envie uma imagem (JPG, PNG, WebP) ou um PDF.");
  }
  if (file.size > PICK_MAX_BYTES) {
    throw new DocumentFileError("A imagem deve ter até 15 MB.");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new DocumentFileError("Não foi possível abrir esta imagem.");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (context) {
    // White under transparent screenshots (JPEG has no transparency).
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }
  bitmap.close();
  for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5]) {
    const blob = await toBlob(canvas, quality);
    if (blob && blob.size <= SEND_MAX_BYTES) return toBase64(blob);
  }
  throw new DocumentFileError(
    "A imagem ficou grande demais. Envie um print menor.",
  );
}
