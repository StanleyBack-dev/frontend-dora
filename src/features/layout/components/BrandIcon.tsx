import { BRAND_COLORS } from "@/features/layout/model/brand-mark";

// Full-bleed app icon (orange tile + the black "d") for ImageResponse
// renders: apple-icon and the PWA manifest icons. `padding` keeps the glyph
// inside the safe zone of maskable icons.
export function BrandIcon({
  size,
  glyphSrc,
  padding = 0.16,
}: {
  size: number;
  /** From brandGlyphSrc(). */
  glyphSrc: string;
  padding?: number;
}) {
  const inner = Math.round(size * (1 - padding * 2));
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND_COLORS.orange,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse */}
      <img src={glyphSrc} width={inner} height={inner} alt="" />
    </div>
  );
}
