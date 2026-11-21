import type { Tone } from "@/design-system";
import type { LostReportStatus } from "@/shared/contracts/lost-and-found";
import { formatLongDay } from "@/shared/lib/datetime";

export const LOST_REPORT_STATUS_LABELS: Record<LostReportStatus, string> = {
  OPEN: "Procurando",
  FOUND: "Encontrado",
  CANCELLED: "Cancelado",
  EXPIRED: "Encerrado sem notícias",
};

export const LOST_REPORT_STATUS_TONES: Record<LostReportStatus, Tone> = {
  OPEN: "warning",
  FOUND: "success",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
};

/** "quarta-feira, 19 de novembro" from "2026-11-19" (a calendar day). */
export const lostOnLabel = (day: string) => formatLongDay(`${day}T12:00:00Z`);
