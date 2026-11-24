import "server-only";
import { NextResponse } from "next/server";

/** A generated PDF as a download. */
export const pdfResponse = (file: {
  fileName: string;
  mimeType: string;
  content: Buffer;
}) =>
  new NextResponse(new Uint8Array(file.content), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
