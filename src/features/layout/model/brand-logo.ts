import "server-only";
import { glyphSvg, markSvg } from "@/features/layout/model/brand-mark";

const toDataUrl = (svg: string) =>
  `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

/** The full mark as a data: URL, for <img> inside ImageResponse renders. */
export async function brandLogoSrc(): Promise<string> {
  return toDataUrl(markSvg());
}

/** Only the "d", for icons that draw their own orange background. */
export async function brandGlyphSrc(): Promise<string> {
  return toDataUrl(glyphSvg());
}
