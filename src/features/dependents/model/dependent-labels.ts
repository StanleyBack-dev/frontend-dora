import type { Tone } from "@/design-system";
import type {
  DependentRelationship,
  DependentStatus,
} from "@/shared/contracts/dependents";

export const RELATIONSHIP_LABELS: Record<DependentRelationship, string> = {
  CHILD: "Filho(a)",
  SPOUSE: "Cônjuge",
  PARENT: "Pai/Mãe",
  SIBLING: "Irmão(ã)",
  GRANDCHILD: "Neto(a)",
  OTHER: "Outro",
};

export const DEPENDENT_STATUS: Record<
  DependentStatus,
  { label: string; tone: Tone }
> = {
  PENDING: { label: "Aguardando aprovação", tone: "warning" },
  APPROVED: { label: "Aprovado", tone: "success" },
  REJECTED: { label: "Recusado", tone: "danger" },
};
