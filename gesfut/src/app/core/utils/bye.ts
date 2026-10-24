import { MatchResponse } from '../models/tournamentResponse';

/** Plan 22/10 #2: fecha libre = rival "Free" (torneo impar) o rival dado de baja. El backend manda isBye/restingTeam. */
export function isByeMatch(m: Pick<MatchResponse, 'homeTeam' | 'awayTeam'> & Partial<Pick<MatchResponse, 'isBye'>>): boolean {
  if (m.isBye != null) return m.isBye;
  return m.homeTeam?.toLowerCase() === 'free' || m.awayTeam?.toLowerCase() === 'free';
}

/** Equipo que descansa en la fecha libre (null si ninguno, p. ej. baja vs "Free"). */
export function restingTeam(m: Pick<MatchResponse, 'homeTeam' | 'awayTeam'> & Partial<Pick<MatchResponse, 'isBye' | 'restingTeam'>>): string | null {
  if (!isByeMatch(m)) return null;
  if (m.restingTeam !== undefined) return m.restingTeam;
  return m.homeTeam?.toLowerCase() === 'free' ? m.awayTeam : m.homeTeam;
}

/** Plan 22/10 #2 (respuesta 3): un equipo dado de baja del torneo no puede clasificar a playoffs. */
export function playoffEligible<T extends { isActive?: boolean | null }>(participants: T[] | null | undefined): T[] {
  return (participants ?? []).filter(p => p.isActive !== false);
}
