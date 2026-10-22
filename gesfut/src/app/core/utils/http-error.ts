import { HttpErrorResponse } from '@angular/common/http';

/** Loop 9: mensaje legible para errores HTTP; sin red (status 0) no hay body con error. */
export function httpErrorMessage(err: HttpErrorResponse | any, fallback: string): string {
  if (!err || err.status === 0) return 'No pudimos conectar con el servidor. Revis\u00e1 tu conexi\u00f3n e intent\u00e1 de nuevo.';
  const body = typeof err.error === 'string' ? (() => { try { return JSON.parse(err.error); } catch { return null; } })() : err.error;
  return body?.error || fallback;
}
