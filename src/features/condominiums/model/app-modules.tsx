import {
  CalendarDays,
  Package,
  PartyPopper,
  SearchCheck,
  ShoppingCart,
} from "lucide-react";
import type { AppModule } from "@/shared/contracts/condominiums";

/** A module a condominium contracts apart (Plataforma turns it on). */
export type AppModuleInfo = {
  module: AppModule;
  label: string;
  description: string;
  icon: React.ReactNode;
};

// The modules sold apart, in the order the platform shows them.
export const APP_MODULES: AppModuleInfo[] = [
  {
    module: "BOOKINGS",
    label: "Reservas",
    description:
      "Espaços reservados pelos moradores: aprovações, convidados com convite e taxas de uso.",
    icon: <CalendarDays aria-hidden className="size-4" />,
  },
  {
    module: "EVENTS",
    label: "Eventos",
    description:
      "Eventos do condomínio com ingressos (gratuitos ou pagos por Pix) e entrada por QR code.",
    icon: <PartyPopper aria-hidden className="size-4" />,
  },
  {
    module: "PARCELS",
    label: "Encomendas",
    description:
      "Encomendas recebidas para os moradores: aviso com código, retirada com QR code e assinatura na tela.",
    icon: <Package aria-hidden className="size-4" />,
  },
  {
    module: "LOST_AND_FOUND",
    label: "Achados e perdidos",
    description:
      "Itens achados no condomínio: os moradores pedem o que é seu e a devolução é feita com assinatura na tela.",
    icon: <SearchCheck aria-hidden className="size-4" />,
  },
  {
    module: "PURCHASES",
    label: "Compras",
    description:
      "Compras do condomínio: fornecedores, solicitações, cotações comparadas e aprovação do síndico.",
    icon: <ShoppingCart aria-hidden className="size-4" />,
  },
];
