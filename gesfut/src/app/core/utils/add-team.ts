/** Respuesta 3: cuándo se puede sumar un equipo a un torneo (mismo criterio que el backend).
 * 'before-start': nadie jugó todavía, se regenera el fixture.
 * 'replace-free': ya empezó y es impar; entra 1 equipo que ocupa la fecha libre de lo pendiente.
 * null: no se puede (empezado y par, playoffs, finalizado o archivado). */
export type AddTeamMode = 'before-start' | 'replace-free' | null;

interface T {
  isFinished?: boolean; isActive?: boolean;
  participants: { name: string }[];
  matchDays: { isFinished: boolean; isPlayOff?: boolean; matches: { isFinished: boolean; isBye?: boolean }[] }[];
}

export function addTeamMode(t: T | null | undefined): AddTeamMode {
  if (!t || t.isFinished || t.isActive === false) return null;
  if (t.matchDays.some(d => d.isPlayOff)) return null;
  const started = t.matchDays.some(d => d.isFinished || d.matches.some(m => m.isFinished && !m.isBye));
  if (!started) return 'before-start';
  const real = t.participants.filter(p => p.name.toLowerCase() !== 'free').length;
  return real % 2 === 1 ? 'replace-free' : null;
}
