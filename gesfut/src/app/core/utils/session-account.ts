export const SESSION_ACCOUNT_KEY = 'gesfut.sessionAccount';

/** SHA-256 hex del email normalizado (trim + minusculas). Vacio si no hay email. Nunca incluye el nombre. */
export async function sessionAccountHash(email: string | null | undefined): Promise<string> {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!normalized) return '';
  const data = new TextEncoder().encode(normalized);
  const buf = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function readSessionAccount(storage: Pick<Storage, 'getItem'> | null | undefined): string {
  if (!storage) return '';
  try { return storage.getItem(SESSION_ACCOUNT_KEY) ?? ''; } catch { return ''; }
}

export function writeSessionAccount(storage: Pick<Storage, 'setItem' | 'removeItem'> | null | undefined, hash: string): void {
  if (!storage) return;
  try {
    if (!hash) storage.removeItem(SESSION_ACCOUNT_KEY);
    else storage.setItem(SESSION_ACCOUNT_KEY, hash);
  } catch { /* sin storage */ }
}

/** True solo si hay un hash distinto en el storage compartido (otra pestaña inicio sesion). */
export function sessionAccountChanged(uiHash: string, sharedHash: string): boolean {
  return !!uiHash && !!sharedHash && uiHash !== sharedHash;
}

/** Al vencer o invalidar la sesion: se borra la huella y sessionStorage.email para no mostrar el aviso en falso. */
export function clearSessionAccountOnExpire(
  local: Pick<Storage, 'setItem' | 'removeItem'> | null | undefined,
  session: Pick<Storage, 'removeItem'> | null | undefined,
): void {
  writeSessionAccount(local, '');
  try { session?.removeItem('email'); } catch { /* sin storage */ }
}

/**
 * Recargar no puede reconstruir email/nombre/rol desde un hash.
 * Se quitan la identidad y el role viejos de esta pestaña para no dejarlos.
 */
export function clearStaleUiIdentity(session: Pick<Storage, 'removeItem'> | null | undefined): void {
  if (!session) return;
  try {
    ['email', 'name', 'lastName', 'role'].forEach((key) => session.removeItem(key));
  } catch { /* sin storage */ }
}
