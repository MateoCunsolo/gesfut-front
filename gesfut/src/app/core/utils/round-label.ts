export function roundLabel(day: { isPlayOff?: boolean; numberOfMatchDay: number; matches?: unknown[] }): string {
  if (!day.isPlayOff) return 'Fecha ' + (day.numberOfMatchDay + 1);
  const names: Record<number, string> = { 1: 'Final', 2: 'Semifinal', 4: 'Cuartos de final', 8: 'Octavos de final' };
  return names[day.matches?.length ?? 0] ?? 'Playoffs · ' + (day.numberOfMatchDay + 1);
}
