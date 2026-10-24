/** "Retomar último torneo": se guarda por usuario (email de la sesión; si no está, nombre|apellido) para que
 * otra cuenta en el mismo navegador no lo vea. El panel solo se muestra si el servidor confirma que el torneo es
 * del usuario (is-my-tournament). Las claves globales viejas ya no se escriben: se migran una vez y se borran. */
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export interface LastTournament { code: string; name: string; }

const PREFIX = 'lastTournament:';
const LEGACY_CODE = 'lastTournamentClicked';
const LEGACY_NAME = 'lastTournamentClickedName';
const g = globalThis as any;
const local = (): Store | null => (typeof g.localStorage !== 'undefined' ? g.localStorage : null);
const session = (): Store | null => (typeof g.sessionStorage !== 'undefined' ? g.sessionStorage : null);

export function userScope(s: Store | null = session()): string {
  const email = (s?.getItem('email') ?? '').trim();
  if (email) return email.toLowerCase();
  const name = s?.getItem('name') ?? '', last = s?.getItem('lastName') ?? '';
  return (name + '|' + last).toLowerCase();
}

export function setLastTournament(code: string, name: string, l: Store | null = local(), s: Store | null = session()): void {
  if (!l || !code) return;
  l.setItem(PREFIX + userScope(s), JSON.stringify({ code, name }));
  l.removeItem(LEGACY_CODE); l.removeItem(LEGACY_NAME);
}

export function getLastTournament(l: Store | null = local(), s: Store | null = session()): LastTournament | null {
  if (!l) return null;
  const raw = l.getItem(PREFIX + userScope(s));
  if (raw) {
    try { const v = JSON.parse(raw); return v && typeof v.code === 'string' && v.code ? { code: v.code, name: String(v.name ?? '') } : null; }
    catch { return null; }
  }
  // Migracion: valor global viejo -> se adopta para este usuario (el servidor igual confirma la propiedad) y se borra.
  const legacy = l.getItem(LEGACY_CODE);
  if (!legacy) return null;
  const migrated = { code: legacy, name: l.getItem(LEGACY_NAME) ?? '' };
  setLastTournament(migrated.code, migrated.name, l, s);
  return migrated;
}

export function forgetLastTournament(l: Store | null = local(), s: Store | null = session()): void {
  if (!l) return;
  l.removeItem(PREFIX + userScope(s));
  l.removeItem(LEGACY_CODE); l.removeItem(LEGACY_NAME);
}
