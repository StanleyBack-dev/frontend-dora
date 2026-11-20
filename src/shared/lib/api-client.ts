import type { ApiError } from "@/shared/contracts/api";

// Browser-side client. It only ever talks to this app's own /api routes
// (the BFF); the session cookie travels automatically and is never readable.
export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init.headers },
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiClientError(
      0,
      "NETWORK_ERROR",
      "Sem conexão. Verifique sua internet.",
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = (payload ?? {}) as Partial<ApiError>;
    throw new ApiClientError(
      response.status,
      error.code ?? `HTTP_${response.status}`,
      error.message ?? "Erro inesperado.",
      error.details,
    );
  }
  return payload as T;
}

/**
 * A file from the BFF (a PDF, a spreadsheet…), with the name it suggests;
 * errors come as JSON, like apiRequest.
 */
export async function apiDownload(
  path: string,
): Promise<{ blob: Blob; fileName: string | null }> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiClientError(
      0,
      "NETWORK_ERROR",
      "Sem conexão. Verifique sua internet.",
    );
  }
  if (!response.ok) {
    const error = ((await response.json().catch(() => null)) ??
      {}) as Partial<ApiError>;
    throw new ApiClientError(
      response.status,
      error.code ?? `HTTP_${response.status}`,
      error.message ?? "Erro inesperado.",
      error.details,
    );
  }
  const disposition = response.headers.get("content-disposition") ?? "";
  const fileName = /filename="([^"]+)"/.exec(disposition)?.[1] ?? null;
  return { blob: await response.blob(), fileName };
}
