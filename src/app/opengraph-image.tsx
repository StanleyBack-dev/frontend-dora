import { ImageResponse } from "next/og";
import {
  SHARE_CARD_SIZE,
  ShareCard,
} from "@/features/layout/components/ShareCard";
import { brandLogoSrc } from "@/features/layout/model/brand-logo";

// Cover shown when a link of the app is shared (WhatsApp, Instagram,
// Facebook…); every page without its own inherits it (signed-out visitors,
// link crawlers included, land on /entrar). Public in proxy.ts.
export const alt = "Dora · Reservas de quadras e espaços do condomínio";
export const size = SHARE_CARD_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    <ShareCard
      headline="Reserve quadras e espaços do seu condomínio."
      note="Simples, rápido e do seu celular."
      logoSrc={await brandLogoSrc()}
      ticket={{
        label: "Reserva confirmada",
        tone: "success",
        title: "Quadra de tênis",
        lines: ["Sábado · 19:00 às 20:00", "Bloco A · 101", "2 convidados"],
      }}
    />,
    size,
  );
}
