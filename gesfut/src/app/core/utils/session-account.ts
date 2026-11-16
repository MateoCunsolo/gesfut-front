import { sha256HexUtf8 } from './sha256';

export const SESSION_ACCOUNT_KEY = 'gesfut.sessionAccount';
export const SESSION_ACCOUNT_HASH_RE = /^[0-9a-f]{64}$/;

export type SessionMe = {
  email: string;
  name: string;
  lastName: string;
  role: string;
};

export const ME_NETWORK_MESSAGE = 'No pudimos actualizar la sesión. Comprobá tu conexión e intentá de nuevo.';

/** SHA-256 hex del email normalizado (trim + minusculas). Vacio si no hay email. Nunca incluye el nombre ni el role. */
export async function sessionAccountHash(email: string | null | undefined): Promise<string> {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!normalized) return '';
  const subtle = globalThis.crypto?.subtle;
  if (subtle?.digest) {
    try {
      const data = new TextEncoder().encode(normalized);
      const buf = await subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // p. ej. subtle presente pero digest falla
    }
  }
  return sha256HexUtf8(normalized);
}

type ReadableStorage = Pick<Storage, 'getItem' | 'removeItem'> | null | undefined;
type WritableStorage = Pick<Storage, 'setItem' | 'removeItem'> | null | undefined;

/** Lee la huella. Si no es un SHA-256 hex de 64 caracteres, la borra (p. ej. la huella vieja en claro de 15bc9b7). */
export function readSessionAccount(storage: ReadableStorage): string {
  if (!storage) return '';
  try {
    const raw = storage.getItem(SESSION_ACCOUNT_KEY) ?? '';
    if (!raw) return '';
    if (SESSION_ACCOUNT_HASH_RE.test(raw)) return raw;
    storage.removeItem(SESSION_ACCOUNT_KEY);
    return '';
  } catch { return ''; }
}

export function writeSessionAccount(storage: WritableStorage, hash: string): void {
  if (!storage) return;
  try {
    if (!hash || !SESSION_ACCOUNT_HASH_RE.test(hash)) storage.removeItem(SESSION_ACCOUNT_KEY);
    else storage.setItem(SESSION_ACCOUNT_KEY, hash);
  } catch { /* sin storage */ }
}

/** True solo si hay un hash distinto en el storage compartido (otra pestaña inicio sesion). */
export function sessionAccountChanged(uiHash: string, sharedHash: string): boolean {
  return !!uiHash && !!sharedHash && uiHash !== sharedHash;
}

/** Al vencer o invalidar la sesion: se borra la huella y sessionStorage.email para no mostrar el aviso en falso. */
export function clearSessionAccountOnExpire(
  local: WritableStorage,
  session: Pick<Storage, 'removeItem'> | null | undefined,
): void {
  writeSessionAccount(local, '');
  try { session?.removeItem('email'); } catch { /* sin storage */ }
}

/** Recargar aplica /me: actualiza identidad y role de esta pestana. El role no va en la huella. */
export function applyMeToSessionStorage(session: Pick<Storage, 'setItem'> | null | undefined, me: SessionMe): void {
  if (!session) return;
  try {
    session.setItem('email', String(me.email ?? '').trim().toLowerCase());
    session.setItem('name', me.name ?? '');
    session.setItem('lastName', me.lastName ?? '');
    session.setItem('role', me.role ?? '');
  } catch { /* sin storage */ }
}

export type AccountSwitchReloadOutcome = 'updated' | 'unauthorized' | 'error';

/**
 * Recargar llama a /me. 200: refresca identidad y huella. 401: no toca datos aca (el caller limpia y manda al login).
 * Red o 5xx: no limpia nada y el caller muestra un mensaje.
 */
export async function applyAccountSwitchReload(opts: {
  fetchMe: () => Promise<{ status: number; body?: SessionMe | null }>;
  session: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  local: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
}): Promise<AccountSwitchReloadOutcome> {
  let status: number;
  let body: SessionMe | null | undefined;
  try {
    const res = await opts.fetchMe();
    status = res.status;
    body = res.body;
  } catch {
    return 'error';
  }
  if (status === 401) return 'unauthorized';
  if (status !== 200 || !body) return 'error';
  applyMeToSessionStorage(opts.session, body);
  const hash = await sessionAccountHash(body.email);
  writeSessionAccount(opts.local, hash);
  return 'updated';
}

/**
 * Recargar en /admin no puede dejar role vacio si la sesion sigue valida:
 * adminAuthGuard expulsa a / y isAuthGuard manda de vuelta a /admin.
 */
export function adminRouteAllowed(isAuthenticated: boolean, role: string): boolean {
  return isAuthenticated && role === 'MANAGER';
}

export function landingRedirectsAuthenticatedToAdmin(isAuthenticated: boolean): boolean {
  return isAuthenticated;
}

export function adminReloadWouldBounce(isAuthenticated: boolean, role: string): boolean {
  return !adminRouteAllowed(isAuthenticated, role) && landingRedirectsAuthenticatedToAdmin(isAuthenticated);
}
