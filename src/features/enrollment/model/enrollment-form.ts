import type { Tone } from "@/design-system";
import type { AddressFormat } from "@/shared/contracts/condominiums";
import type {
  EnrollmentApplicant,
  EnrollmentData,
  EnrollmentRequest,
  EnrollmentStatus,
} from "@/shared/contracts/enrollment";
import { formatPhone, phoneError } from "@/shared/lib/masks";
import { birthDateError } from "@/shared/lib/birth-date";

export type EnrollmentForm = {
  /** Lives in the condominium or works there (no address then). */
  applicant: EnrollmentApplicant;
  fullName: string;
  email: string;
  phone: string;
  /** YYYY-MM-DD ("" while not informed). */
  birthDate: string;
  /** "" while none is chosen. */
  unitId: string;
  /** "casa dos fundos" (optional). */
  unitComplement: string;
  /** Typed when the condominium has no units registered; houses: quadra. */
  unitBlock: string;
  /** Houses: the lote. */
  unitNumber: string;
  /** Houses: the street. */
  unitStreet: string;
};

export const EMPTY_ENROLLMENT: EnrollmentForm = {
  applicant: "RESIDENT",
  fullName: "",
  email: "",
  phone: "",
  birthDate: "",
  unitId: "",
  unitComplement: "",
  unitBlock: "",
  unitNumber: "",
  unitStreet: "",
};

/**
 * How the form asks where the person lives: from the list, typed (no units
 * registered), as a house (street, quadra and lote, always typed) or not at
 * all (employees don't live there).
 */
export type UnitMode = "list" | "typed" | "house" | "none";

export const unitModeFor = (
  units: readonly unknown[],
  applicant: EnrollmentApplicant = "RESIDENT",
  addressFormat: AddressFormat = "APARTMENT",
): UnitMode =>
  applicant === "EMPLOYEE"
    ? "none"
    : addressFormat === "HOUSE"
      ? "house"
      : units.length > 0
        ? "list"
        : "typed";

export const APPLICANT_LABELS: Record<EnrollmentApplicant, string> = {
  RESIDENT: "Morador",
  EMPLOYEE: "Funcionário",
};

export const fromRequest = (request: EnrollmentRequest): EnrollmentForm => ({
  applicant: request.applicant,
  fullName: request.fullName,
  email: request.email,
  phone: formatPhone(request.phone),
  birthDate: request.birthDate ?? "",
  unitId: request.unitId ?? "",
  unitComplement: request.unitComplement ?? "",
  unitBlock: request.typedUnitBlock ?? "",
  unitNumber: request.typedUnitNumber ?? "",
  unitStreet: request.typedUnitStreet ?? "",
});

export type EnrollmentErrors = Partial<Record<keyof EnrollmentForm, string>>;

/** Same rules as the API, to show them while typing. */
export function enrollmentErrors(
  form: EnrollmentForm,
  /** list: one unit must be chosen; typed: the number must be typed. */
  mode: UnitMode,
  /** The public form asks it; a manager may approve an older request without. */
  birthDateRequired = true,
): EnrollmentErrors {
  const errors: EnrollmentErrors = {};
  if (mode === "list" && !form.unitId) errors.unitId = "Escolha a sua unidade.";
  if (mode === "house") {
    const street = form.unitStreet.trim();
    if (!street) errors.unitStreet = "Informe a rua.";
    else if (street.length < 2 || street.length > 80) {
      errors.unitStreet = "A rua tem de 2 a 80 caracteres.";
    }
    if (!form.unitBlock.trim()) errors.unitBlock = "Informe a quadra.";
    else if (form.unitBlock.trim().length > 30) {
      errors.unitBlock = "Use até 30 caracteres.";
    }
    if (!form.unitNumber.trim()) errors.unitNumber = "Informe o lote.";
    else if (form.unitNumber.trim().length > 20) {
      errors.unitNumber = "Use até 20 caracteres.";
    }
  }
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
  const birth = birthDateError(form.birthDate, birthDateRequired);
  if (birth) errors.birthDate = birth;
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
  birthDate: form.birthDate || null,
  unitId: mode === "list" ? form.unitId || null : null,
  unitComplement: mode === "none" ? null : form.unitComplement.trim() || null,
  // Typed values only when there is no list to choose from.
  ...(mode === "typed"
    ? {
        unitBlock: form.unitBlock.trim() || null,
        unitNumber: form.unitNumber.trim(),
      }
    : {}),
  ...(mode === "house"
    ? {
        unitStreet: form.unitStreet.trim(),
        unitBlock: form.unitBlock.trim(),
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
