import { BRAND_COLORS } from "@/features/layout/model/brand-mark";

// Link preview (1200×630) for ImageResponse: what WhatsApp, Instagram,
// Facebook and X show when someone shares an address of the app. Black card
// with the mark, the "dora." wordmark and a headline on the left; on the
// right, a big orange circle (a ball on the court) with a white ticket that
// shows what the link is about (a booking, an invite…).
export const SHARE_CARD_SIZE = { width: 1200, height: 630 };

export type ShareTicket = {
  /** Small caps line with a colored dot (e.g. "Reserva confirmada"). */
  label: string;
  /** Dot color: green for confirmed, orange otherwise. */
  tone?: "success" | "brand";
  /** Big line of the ticket (e.g. the space). */
  title: string;
  /** Up to three short lines under it (date, place…). */
  lines: string[];
};

const SUCCESS = "#16a34a";
const INK_MUTED = "#6b6560";
const LINE = "#ece8e3";

export function ShareCard({
  headline,
  note,
  logoSrc,
  ticket,
}: {
  /** Big line under the name (e.g. "Cadastro de morador"). */
  headline: string;
  /** Small line at the bottom. */
  note: string;
  /** From brandLogoSrc(). */
  logoSrc: string;
  ticket: ShareTicket;
}) {
  const dot = ticket.tone === "success" ? SUCCESS : BRAND_COLORS.orange;

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
      {/* The ball and the court lines. */}
      <div
        style={{
          position: "absolute",
          right: -170,
          top: -90,
          width: 640,
          height: 640,
          borderRadius: 320,
          background: BRAND_COLORS.orange,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 250,
          bottom: -300,
          width: 460,
          height: 460,
          borderRadius: 230,
          border: "3px solid rgba(255,255,255,0.10)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 10,
          background: BRAND_COLORS.orange,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 0 0 88px",
          width: 700,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse */}
          <img src={logoSrc} width={92} height={92} alt="" />
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 1,
            }}
          >
            dora<span style={{ color: BRAND_COLORS.orange }}>.</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 52,
            fontSize: 54,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: -1,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 28,
            lineHeight: 1.35,
            color: BRAND_COLORS.muted,
          }}
        >
          {note}
        </div>
      </div>

      {/* The ticket. */}
      <div
        style={{
          position: "absolute",
          right: 96,
          top: 150,
          width: 380,
          display: "flex",
          flexDirection: "column",
          padding: "30px 32px",
          borderRadius: 28,
          background: BRAND_COLORS.white,
          color: BRAND_COLORS.black,
          boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
          transform: "rotate(-4deg)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 18,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: INK_MUTED,
          }}
        >
          <div
            style={{ width: 14, height: 14, borderRadius: 7, background: dot }}
          />
          {ticket.label}
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 38,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -0.5,
          }}
        >
          {ticket.title}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 22,
            paddingTop: 20,
            borderTop: `2px dashed ${LINE}`,
            gap: 10,
          }}
        >
          {ticket.lines.slice(0, 3).map((line) => (
            <div
              key={line}
              style={{ display: "flex", fontSize: 24, color: INK_MUTED }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
