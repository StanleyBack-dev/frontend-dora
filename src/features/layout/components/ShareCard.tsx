import { BRAND_COLORS } from "@/features/layout/model/brand-mark";

// Link preview (1200×630) for ImageResponse: what WhatsApp, Instagram,
// Facebook and X show when someone shares an address of the app. Black card
// with a big orange circle on the right (a ball on the court), the mark, the
// "dora." wordmark and a headline.
export const SHARE_CARD_SIZE = { width: 1200, height: 630 };

export function ShareCard({
  headline,
  note,
  logoSrc,
}: {
  /** Big line under the name (e.g. "Cadastro de morador"). */
  headline: string;
  /** Small line at the bottom. */
  note: string;
  /** From brandLogoSrc(). */
  logoSrc: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: BRAND_COLORS.black,
        color: BRAND_COLORS.white,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -160,
          top: -120,
          width: 620,
          height: 620,
          borderRadius: 310,
          background: BRAND_COLORS.orange,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: -260,
          width: 420,
          height: 420,
          borderRadius: 210,
          border: `3px solid rgba(255,255,255,0.12)`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse */}
          <img src={logoSrc} width={120} height={120} alt="" />
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 800,
              letterSpacing: -5,
              lineHeight: 1,
            }}
          >
            dora<span style={{ color: BRAND_COLORS.orange }}>.</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 52,
            fontWeight: 700,
            maxWidth: 680,
            lineHeight: 1.12,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            color: BRAND_COLORS.muted,
            maxWidth: 640,
          }}
        >
          {note}
        </div>
      </div>
    </div>
  );
}
