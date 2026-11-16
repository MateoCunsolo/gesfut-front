import { HttpErrorResponse } from '@angular/common/http';

/** Loop 9: mensaje legible para errores HTTP; sin red (status 0) no hay body con error. */
export function httpErrorMessage(err: HttpErrorResponse | any, fallback: string): string {
  if (!err || err.status === 0) return 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.';
  const raw = err.error;
  const body = typeof raw === 'string'
    ? (() => { try { return JSON.parse(raw); } catch { return raw.trim() ? raw.trim() : null; } })()
    : raw;
  if (typeof body === 'string' && body) return body;
  const fromBody = body?.error || body?.message || body?.detail;
  if (typeof fromBody === 'string' && fromBody.trim()) return fromBody.trim();
  return fallback;
}
