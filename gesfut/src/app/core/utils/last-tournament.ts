/** "Retomar último torneo" (decisión 24/10): se guarda SOLO el código, bajo el email de login en minúsculas.
 * Sobrevive al logout/login del mismo email; otro email nunca lo ve (otra clave) y el servidor igual confirma la
 * propiedad (is-my-tournament) antes de mostrarlo. Las claves globales viejas se borran sin adoptarse.
 * El nombre no se guarda: se pide al servidor. */
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export interface LastTournament { code: string; name: string; }

const PREFIX = 'lastTournament:';
const LEGACY_KEYS = ['lastTournamentClicked', 'lastTournamentClickedName'];
const g = globalThis as any;
const local = (): Store | null => (typeof g.localStorage !== 'undefined' ? g.localStorage : null);
const session = (): Store | null => (typeof g.sessionStorage !== 'undefined' ? g.sessionStorage : null);

export const normalizeEmail = (email: string | null | undefined): string => String(email ?? '').trim().toLowerCase();

/** Clave por email de login; sin email no hay clave (no se guarda ni se muestra nada). */
export function userScope(s: Store | null = session()): string | null {
  const email = normalizeEmail(s?.getItem('email'));
  return email ? PREFIX + email : null;
}

function dropLegacy(l: Store): void { for (const k of LEGACY_KEYS) if (l.getItem(k) !== null) l.removeItem(k); }

export function setLastTournament(code: string, _name: string = '', l: Store | null = local(), s: Store | null = session()): void {
  if (!l || !code) return;
  dropLegacy(l); // primero lo viejo; nunca toca la clave por email
  const key = userScope(s);
  if (key) l.setItem(key, code);
}

export function getLastTournament(l: Store | null = local(), s: Store | null = session()): LastTournament | null {
  if (!l) return null;
  dropLegacy(l);
  const key = userScope(s);
  const raw = key ? l.getItem(key) : null;
  if (!raw) return null;
  let code = raw;
  if (raw.startsWith('{')) { // formato 3bafd7b ({code,name}) -> se reescribe como solo código
    try { code = String(JSON.parse(raw)?.code ?? ''); } catch { code = ''; }
    if (code) l.setItem(key!, code); else l.removeItem(key!);
  }
  return code ? { code, name: '' } : null;
}

/** Solo cuando el servidor dice que el torneo ya no es del usuario (no en el logout). */
export function forgetLastTournament(l: Store | null = local(), s: Store | null = session()): void {
  if (!l) return;
  const key = userScope(s);
  if (key) l.removeItem(key);
  dropLegacy(l);
}

/** Solo se recuerda un torneo propio y activo: un link de admin de otro organizador o un torneo archivado
 *  (pagina publica de solo lectura) nunca pisan el "Retomar". */
export function rememberIfMine(code: string, isMine: boolean, isActive: boolean | null | undefined, l: Store | null = local(), s: Store | null = session()): boolean {
  if (!code || !isMine || isActive === false) return false;
  setLastTournament(code, '', l, s);
  return true;
}
