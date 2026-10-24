/** Revisión crítica #2: espejo de la regla del backend para mostrar "Finalizar torneo". */
export function canFinish(t: { isFinished: boolean; matchDays: { isFinished: boolean; isPlayOff: boolean; numberOfMatchDay: number; matches: unknown[] }[] }): boolean {
  if (!t || t.isFinished || !t.matchDays?.length) return false;
  if (!t.matchDays.every(d => d.isFinished)) return false;
  const last = [...t.matchDays].sort((a, b) => b.numberOfMatchDay - a.numberOfMatchDay)[0];
  return !last.isPlayOff || last.matches.length === 1;
}
