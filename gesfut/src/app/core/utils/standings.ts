/** Recorrido 22/10: criterio único de la tabla, igual al backend (TournamentServiceImpl.sortParticipants):
 * puntos, diferencia de gol y goles a favor, todos de mayor a menor. */
export interface StandingStats { points: number; goalsFor: number; goalsAgainst: number; }

export function compareStandings(a: StandingStats, b: StandingStats): number {
  return (b.points - a.points)
    || ((b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
    || (b.goalsFor - a.goalsFor);
}
