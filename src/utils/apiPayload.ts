/** Convierte ids numéricos en number para FKs del backend Flask. */
export function coerceApiId(value: string | number): string | number {
  const trimmed = String(value).trim();
  if (trimmed === '') return trimmed;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

export function nonEmptyText(value: string, fallback = '—'): string {
  const trimmed = value.trim();
  return trimmed || fallback;
}

/** Mensaje legible desde respuestas de error del API (4xx/5xx). */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;

  const axiosErr = error as {
    response?: { status?: number; data?: unknown };
    message?: string;
  };

  const data = axiosErr.response?.data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const msg =
      obj.message ??
      obj.error ??
      obj.detail ??
      (Array.isArray(obj.errors) ? obj.errors.join(', ') : undefined);
    if (typeof msg === 'string' && msg.trim()) {
      const status = axiosErr.response?.status;
      return status ? `${msg} (${status})` : msg;
    }
  }

  if (axiosErr.message) return axiosErr.message;
  return fallback;
}
