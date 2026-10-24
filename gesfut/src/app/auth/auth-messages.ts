/** Mensajes de error de auth en es-AR, sin dependencias de Angular (se testean con node). */
export function authErrorMessage(error: any, fallback: string): string {
  if (!error || error.status === 0) return 'No pudimos conectar con el servidor. Probá de nuevo en un rato.';
  // 5xx: nunca mostrar el texto interno del backend.
  if (error.status >= 500) return 'Tuvimos un problema en el servidor. Probá de nuevo en un rato.';
  const body = error.error;
  let msg = '';
  if (body && typeof body === 'object') {
    msg = body.error || body.message || '';
    if (!msg && body.errors && typeof body.errors === 'object') {
      msg = Object.values(body.errors).filter(v => typeof v === 'string').join('. ');
    }
  } else if (typeof body === 'string' && body.trim() && !body.trim().startsWith('<') && body.length < 300) {
    msg = body.trim();
  }
  if (!msg || msg === 'Invalid CORS request' || /^(Unauthorized|Forbidden|Bad Request)$/i.test(msg)) return fallback;
  return msg;
}

/** Aviso en el login despues de crear la cuenta (?registered=1). */
export function isRegisteredNotice(search: string): boolean {
  return new URLSearchParams(search).get('registered') === '1';
}
