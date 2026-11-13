// Only same-site paths are accepted as a post-login destination ("/perfil"),
// never "//host" or "https://host" (open redirect).
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/\\") || value.startsWith("/api/")) return null;
  return value;
}
