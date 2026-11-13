import type { BroadcastAudience } from "@/shared/contracts/broadcasts";

export const AUDIENCE_LABELS: Record<BroadcastAudience, string> = {
  TODOS: "Todos do condomínio",
  GRUPO: "Um grupo de acesso",
};

export const AUDIENCES = Object.keys(AUDIENCE_LABELS) as BroadcastAudience[];
