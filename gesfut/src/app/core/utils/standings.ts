/** Revisión crítica #8: el backend ordena la tabla (puntos, diferencia de gol, goles a favor,
 * enfrentamiento directo, fair play y nombre) y el front respeta ese orden. compareStandings queda
 * para lo que no viene ordenado del backend; byLeagueRank ordena según la tabla oficial. */
export interface StandingStats { points: number; goalsFor: number; goalsAgainst: number; }

export function compareStandings(a: StandingStats, b: StandingStats): number {
  return (b.points - a.points)
    || ((b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
    || (b.goalsFor - a.goalsFor);
}

/** Comparador según la posición en la tabla oficial (lista ya ordenada por el backend). */
export function byLeagueRank<T extends { idParticipant: number }>(table: { idParticipant: number }[]): (a: T, b: T) => number {
  const pos = new Map(table.map((p, i) => [p.idParticipant, i]));
  return (a, b) => (pos.get(a.idParticipant) ?? Number.MAX_SAFE_INTEGER) - (pos.get(b.idParticipant) ?? Number.MAX_SAFE_INTEGER);
}
