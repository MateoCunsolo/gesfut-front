/** "Retomar último torneo": se guarda por usuario para que otra cuenta en el mismo navegador no lo vea,
 * y el panel solo se muestra cuando el servidor confirma que el torneo es del usuario (is-my-tournament).
 * Las claves viejas (lastTournamentClicked/Name) se siguen escribiendo porque otras pantallas las usan de respaldo. */
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export interface LastTournament { code: string; name: string; }

const PREFIX = 'lastTournament:';
const g = globalThis as any;
const local = (): Store | null => (typeof g.localStorage !== 'undefined' ? g.localStorage : null);
const session = (): Store | null => (typeof g.sessionStorage !== 'undefined' ? g.sessionStorage : null);

/** Identidad del usuario logueado en esta pestaña (el front no recibe un id; nombre+apellido de la sesión). */
export function userScope(s: Store | null = session()): string {
  const name = s?.getItem('name') ?? '', last = s?.getItem('lastName') ?? '';
  return (name + '|' + last).toLowerCase();
}

export function setLastTournament(code: string, name: string, l: Store | null = local(), s: Store | null = session()): void {
  if (!l || !code) return;
  l.setItem(PREFIX + userScope(s), JSON.stringify({ code, name }));
  l.setItem('lastTournamentClicked', code);
  l.setItem('lastTournamentClickedName', name);
}

export function getLastTournament(l: Store | null = local(), s: Store | null = session()): LastTournament | null {
  const raw = l?.getItem(PREFIX + userScope(s));
  if (!raw) return null;
  try { const v = JSON.parse(raw); return v && typeof v.code === 'string' && v.code ? { code: v.code, name: String(v.name ?? '') } : null; }
  catch { return null; }
}

export function forgetLastTournament(l: Store | null = local(), s: Store | null = session()): void {
  if (!l) return;
  l.removeItem(PREFIX + userScope(s));
  l.removeItem('lastTournamentClicked');
  l.removeItem('lastTournamentClickedName');
}
