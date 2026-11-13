import { ImageResponse } from "next/og";
import { BrandIcon } from "@/features/layout/components/BrandIcon";
import { brandGlyphSrc } from "@/features/layout/model/brand-logo";

// PNG icons referenced by the web manifest, rendered from the brand mark on
// the orange tile.
const VARIANTS = {
  "192": { size: 192, padding: 0.04 },
  "512": { size: 512, padding: 0.04 },
  // Maskable: launchers keep only the central circle (80% wide), so the
  // glyph shrinks to fit inside it.
  "maskable-512": { size: 512, padding: 0.14 },
} as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((variant) => ({ variant }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ variant: string }> },
) {
  const { variant } = await params;
  const spec = VARIANTS[variant as keyof typeof VARIANTS];
  if (!spec) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    <BrandIcon
      size={spec.size}
      padding={spec.padding}
      glyphSrc={await brandGlyphSrc()}
    />,
    { width: spec.size, height: spec.size },
  );
}
