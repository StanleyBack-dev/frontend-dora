import type { Tone } from "@/design-system";
import type {
  EnrollmentData,
  EnrollmentRequest,
  EnrollmentStatus,
} from "@/shared/contracts/enrollment";
import { formatPhone, phoneError } from "@/shared/lib/masks";

export type EnrollmentForm = {
  fullName: string;
  email: string;
  phone: string;
};

export const EMPTY_ENROLLMENT: EnrollmentForm = {
  fullName: "",
  email: "",
  phone: "",
};

export const fromRequest = (request: EnrollmentRequest): EnrollmentForm => ({
  fullName: request.fullName,
  email: request.email,
  phone: formatPhone(request.phone),
});

export type EnrollmentErrors = Partial<Record<keyof EnrollmentForm, string>>;

/** Same rules as the API, to show them while typing. */
export function enrollmentErrors(form: EnrollmentForm): EnrollmentErrors {
  const errors: EnrollmentErrors = {};
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

export const toEnrollmentData = (form: EnrollmentForm): EnrollmentData => ({
  fullName: form.fullName.trim(),
  email: form.email.trim(),
  phone: form.phone,
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
