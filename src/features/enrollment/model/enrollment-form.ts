import type { Tone } from "@/design-system";
import type {
  EnrollmentApplicant,
  EnrollmentData,
  EnrollmentRequest,
  EnrollmentStatus,
} from "@/shared/contracts/enrollment";
import { formatPhone, phoneError } from "@/shared/lib/masks";

export type EnrollmentForm = {
  /** Lives in the condominium or works there (no address then). */
  applicant: EnrollmentApplicant;
  fullName: string;
  email: string;
  phone: string;
  /** "" while none is chosen. */
  unitId: string;
  /** "casa dos fundos" (optional). */
  unitComplement: string;
  /** Typed when the condominium has no units registered. */
  unitBlock: string;
  unitNumber: string;
};

export const EMPTY_ENROLLMENT: EnrollmentForm = {
  applicant: "RESIDENT",
  fullName: "",
  email: "",
  phone: "",
  unitId: "",
  unitComplement: "",
  unitBlock: "",
  unitNumber: "",
};

/**
 * How the form asks where the person lives: from the list, typed (no units
 * registered) or not at all (employees don't live there).
 */
export type UnitMode = "list" | "typed" | "none";

export const unitModeFor = (
  units: readonly unknown[],
  applicant: EnrollmentApplicant = "RESIDENT",
): UnitMode =>
  applicant === "EMPLOYEE" ? "none" : units.length > 0 ? "list" : "typed";

export const APPLICANT_LABELS: Record<EnrollmentApplicant, string> = {
  RESIDENT: "Morador",
  EMPLOYEE: "Funcionário",
};

export const fromRequest = (request: EnrollmentRequest): EnrollmentForm => ({
  applicant: request.applicant,
  fullName: request.fullName,
  email: request.email,
  phone: formatPhone(request.phone),
  unitId: request.unitId ?? "",
  unitComplement: request.unitComplement ?? "",
  unitBlock: request.typedUnitBlock ?? "",
  unitNumber: request.typedUnitNumber ?? "",
});

export type EnrollmentErrors = Partial<Record<keyof EnrollmentForm, string>>;

/** Same rules as the API, to show them while typing. */
export function enrollmentErrors(
  form: EnrollmentForm,
  /** list: one unit must be chosen; typed: the number must be typed. */
  mode: UnitMode,
): EnrollmentErrors {
  const errors: EnrollmentErrors = {};
  if (mode === "list" && !form.unitId) errors.unitId = "Escolha a sua unidade.";
  if (mode === "typed") {
    if (!form.unitNumber.trim()) {
      errors.unitNumber = "Informe o número da casa ou do apartamento.";
    } else if (form.unitNumber.trim().length > 20) {
      errors.unitNumber = "Use até 20 caracteres.";
    }
    if (form.unitBlock.trim().length > 30) {
      errors.unitBlock = "Use até 30 caracteres.";
    }
  }
  if (mode !== "none" && form.unitComplement.trim().length > 80) {
    errors.unitComplement = "Use até 80 caracteres.";
  }
  const name = form.fullName.trim();
  if (name.length < 5 || !name.includes(" ")) {
    errors.fullName = "Informe o nome completo (nome e sobrenome).";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }
  if (!form.phone) errors.phone = "Informe o telefone com DDD.";
  else {
    const phone = phoneError(form.phone);
    if (phone) errors.phone = phone;
  }
  return errors;
}

export const toEnrollmentData = (
  form: EnrollmentForm,
  mode: UnitMode,
): EnrollmentData => ({
  fullName: form.fullName.trim(),
  email: form.email.trim(),
  phone: form.phone,
  unitId: mode === "list" ? form.unitId || null : null,
  unitComplement: mode === "none" ? null : form.unitComplement.trim() || null,
  // Typed values only when there is no list to choose from.
  ...(mode === "typed"
    ? {
        unitBlock: form.unitBlock.trim() || null,
        unitNumber: form.unitNumber.trim(),
      }
    : {}),
});

export const ENROLLMENT_STATUS: Record<
  EnrollmentStatus,
  { label: string; tone: Tone }
> = {
  PENDENTE: { label: "Pendente", tone: "warning" },
  APROVADA: { label: "Aprovado", tone: "success" },
  RECUSADA: { label: "Recusado", tone: "danger" },
};

export const ENROLLMENT_STATUSES = Object.keys(
  ENROLLMENT_STATUS,
) as EnrollmentStatus[];
