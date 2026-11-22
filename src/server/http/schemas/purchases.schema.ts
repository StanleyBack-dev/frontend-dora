import "server-only";
import { z } from "zod";
import { idSchema, optionalText } from "@/server/http/schemas/fields";

// Request shapes of the purchases routes. Shapes only: the API checks every
// value again (document, categories, contact, PIX).

export const supplierIdSchema = idSchema;

const CATEGORIES = [
  "MAINTENANCE",
  "ELECTRICAL",
  "PLUMBING",
  "PAINTING",
  "CONSTRUCTION",
  "ELEVATORS",
  "CLEANING",
  "PEST_CONTROL",
  "GARDENING",
  "POOL",
  "SECURITY",
  "TECHNOLOGY",
  "OFFICE",
  "FOOD",
  "EVENTS",
  "FURNITURE",
  "UNIFORMS",
  "GAS",
  "PROFESSIONAL",
  "OTHER",
] as const;

export const supplierInputSchema = z.object({
  documentType: z.enum(["CNPJ", "CPF"]),
  document: z.string().trim().min(11).max(20),
  name: z.string().trim().min(2).max(120),
  tradeName: optionalText(120),
  categories: z.array(z.enum(CATEGORIES)).min(1).max(CATEGORIES.length),
  categoryOther: optionalText(60),
  contactName: optionalText(80),
  email: optionalText(160),
  phone: optionalText(20),
  city: optionalText(60),
  state: optionalText(2),
  pixKeyType: z.enum(["CPF", "CNPJ", "PHONE", "EMAIL", "RANDOM"]).nullish(),
  pixKey: optionalText(100),
  notes: optionalText(500),
});

export const supplierActiveSchema = z.object({ active: z.boolean() });
