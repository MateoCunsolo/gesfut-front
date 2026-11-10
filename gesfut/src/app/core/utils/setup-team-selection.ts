import { normalizeEmail } from './last-tournament';

export type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type StoredSetupTeam = { id: number; name: string };

const PREFIX = 'gesfut:setupTeams:';
const legacySessionPrefix = 'initTeams:';

export function setupTeamSelectionKey(email: string | null | undefined, tournamentCode: string | null | undefined): string | null {
  const user = normalizeEmail(email);
  const code = String(tournamentCode ?? '').trim();
  if (!user || !code) return null;
  return PREFIX + user + ':' + code;
}

export function setupRequirementText(selectedCount: number): string {
  if (selectedCount <= 0) return 'Necesit\u00e1s al menos 2 equipos para empezar.';
  if (selectedCount === 1) return 'Necesit\u00e1s al menos 2 equipos. Te falta 1.';
  if (selectedCount === 3) return 'Listo. Con 3 equipos, cada fecha uno queda libre.';
  return 'Listo para revisar y generar el calendario.';
}

function asTeams(raw: unknown): StoredSetupTeam[] {
  if (!Array.isArray(raw)) return [];
  const out: StoredSetupTeam[] = [];
  const seen = new Set<number>();
  for (const item of raw) {
    const id = typeof item === 'number' ? item : Number((item as StoredSetupTeam)?.id);
    if (!Number.isFinite(id) || seen.has(id)) continue;
    seen.add(id);
    const name = typeof item === 'number' ? '' : String((item as StoredSetupTeam)?.name ?? '');
    out.push({ id, name });
  }
  return out;
}

export function readSetupTeamSelection(
  local: Store | null,
  email: string | null | undefined,
  tournamentCode: string | null | undefined,
  session?: Store | null,
): StoredSetupTeam[] {
  const key = setupTeamSelectionKey(email, tournamentCode);
  if (!key || !local) return [];
  try {
    const fromLocal = asTeams(JSON.parse(local.getItem(key) || 'null'));
    if (fromLocal.length) return fromLocal;
  } catch { /* ignorar */ }
  const code = String(tournamentCode ?? '').trim();
  if (!session || !code) return [];
  try {
    const legacy = asTeams(JSON.parse(session.getItem(legacySessionPrefix + code) || 'null'));
    if (legacy.length) {
      writeSetupTeamSelection(local, email, tournamentCode, legacy);
      try { session.removeItem(legacySessionPrefix + code); } catch { /* ignorar */ }
      return legacy;
    }
  } catch { /* ignorar */ }
  return [];
}

export function writeSetupTeamSelection(
  local: Store | null,
  email: string | null | undefined,
  tournamentCode: string | null | undefined,
  teams: { id: number; name?: string }[],
): void {
  const key = setupTeamSelectionKey(email, tournamentCode);
  if (!key || !local) return;
  try {
    local.setItem(key, JSON.stringify(asTeams(teams)));
  } catch { /* sin storage */ }
}

export function clearSetupTeamSelection(
  local: Store | null,
  email: string | null | undefined,
  tournamentCode: string | null | undefined,
  session?: Store | null,
): void {
  const key = setupTeamSelectionKey(email, tournamentCode);
  try { if (key && local) local.removeItem(key); } catch { /* ignorar */ }
  const code = String(tournamentCode ?? '').trim();
  try { if (session && code) session.removeItem(legacySessionPrefix + code); } catch { /* ignorar */ }
}

export function applySetupTeamSelection<T extends { id: number; name?: string }>(
  saved: StoredSetupTeam[],
  available: T[],
): { selected: T[]; missing: StoredSetupTeam[] } {
  const byId = new Map(available.map((t) => [t.id, t]));
  const selected: T[] = [];
  const missing: StoredSetupTeam[] = [];
  const seen = new Set<number>();
  for (const item of saved) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    const found = byId.get(item.id);
    if (found) selected.push(found);
    else missing.push({ id: item.id, name: item.name });
  }
  return { selected, missing };
}

export function missingSelectionMessage(missing: StoredSetupTeam[]): string {
  const names = missing.map((t) => t.name.trim()).filter(Boolean);
  if (names.length === 1) return 'El equipo ' + names[0] + ' ya no existe y lo sacamos de la selecci\u00f3n. Eleg\u00ed otro para seguir.';
  if (names.length > 1) return 'Los equipos ' + names.join(', ') + ' ya no existen y los sacamos de la selecci\u00f3n. Eleg\u00ed otros para seguir.';
  return 'Un equipo ya no existe y lo sacamos de la selecci\u00f3n. Eleg\u00ed otro para seguir.';
}
