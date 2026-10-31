/**
 * Plan tokens 31-10 #3: el token de reset llega en el fragmento (#t=<token>), que no viaja al servidor
 * ni en el Referer. Se lee una vez, queda solo en memoria y se borra de la URL. Nunca se loguea ni se guarda.
 */
const TOKEN_RE = /^[A-Za-z0-9_-]{16,512}$/;

/** Devuelve el token de '#t=<token>' o 't=<token>' (fragmento de UrlTree); '' si no hay o no es base64url. */
export function readResetFragment(fragment: string | null | undefined): string {
  if (!fragment) return '';
  const raw = new URLSearchParams(fragment.startsWith('#') ? fragment.substring(1) : fragment).get('t') || '';
  return TOKEN_RE.test(raw) ? raw : '';
}

/** Saca el fragmento de la URL actual sin recargar ni agregar una entrada al historial. */
export function clearUrlFragment(loc: Pick<Location, 'pathname' | 'search' | 'hash'>, hist: Pick<History, 'replaceState' | 'state'>): void {
  if (!loc.hash) return;
  hist.replaceState(hist.state, '', loc.pathname + loc.search);
}

export const RESET_TOO_MANY = 'Probaste muchas veces. Esper\u00e1 un rato e intent\u00e1 de nuevo.';
export const RESET_BAD_EMAIL = 'Revis\u00e1 el correo e intent\u00e1 de nuevo.';
export const CHANGE_BAD_REQUEST = 'No pudimos guardar la contrase\u00f1a: el enlace venci\u00f3 o la contrase\u00f1a no es v\u00e1lida (m\u00ednimo 8 caracteres). Si pas\u00f3 mucho tiempo, ped\u00ed un enlace nuevo.';

/** Pedido de enlace (POST /reset-password {email}): '' si no corresponde un texto propio. */
export function resetRequestErrorText(status: number | undefined): string {
  if (status === 429) return RESET_TOO_MANY;
  if (status === 400) return RESET_BAD_EMAIL;
  return '';
}

/** Cambio con token (POST /change-password {token,password}): 'invalid' muestra la pantalla de enlace invalido. */
export function changePasswordErrorText(status: number | undefined): 'invalid' | string {
  if (status === 404) return 'invalid';
  if (status === 429) return RESET_TOO_MANY;
  if (status === 400) return CHANGE_BAD_REQUEST;
  return '';
}
