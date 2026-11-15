import "server-only";
import { z } from "zod";

/** An optional text where an empty value (`NAME=` in .env) means unset. */
const optional = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().max(120).optional(),
);

// Validated once per server instance. Nothing here is NEXT_PUBLIC_: secrets
// never reach the browser bundle (enforced by "server-only").
const schema = z.object({
  BACKEND_URL: z.url(),
  INTERNAL_API_KEY: z.string().min(32),
  SESSION_COOKIE_NAME: z.string().min(1).default("dora_session"),
  APP_TIMEZONE: z.string().default("America/Sao_Paulo"),
  /** Origin of the file storage (photos), allowed by the CSP (e.g. https://…neon.tech). */
  // An empty value (`MEDIA_ORIGIN=` in .env) means "not configured".
  MEDIA_ORIGIN: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .url()
      .optional()
      .transform((value) => (value ? new URL(value).origin : null)),
  ),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  /**
   * "Apoie o Dora" (PIX): the page and its menu item exist only when key,
   * name and city are all set. Empty values mean "off".
   */
  PIX_KEY: optional,
  PIX_RECEIVER_NAME: optional,
  PIX_RECEIVER_CITY: optional,
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const fields = parsed.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(`Variáveis de ambiente inválidas no frontend: ${fields}`);
  }
  cached = parsed.data;
  return cached;
}
