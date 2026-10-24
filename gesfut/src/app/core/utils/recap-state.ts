/** Vista publica (review 24/10): que mostrar cuando no hay ultima fecha. Nada mientras carga (sin flash);
 *  "se esta preparando" solo para un torneo nuevo; finalizado o con campeon, mensaje neutro; error, aviso. */
export interface RecapTournamentInfo { code?: string | null; isFinished?: boolean | null; championOfLeagueId?: number | null; championOfPlayoffsId?: number | null; }
export type RecapEmptyState = 'loading' | 'preparing' | 'finished' | 'error';
export function recapEmptyState(lastDayLoaded: boolean, failed: boolean, tournament: RecapTournamentInfo | null | undefined, code: string | null | undefined): RecapEmptyState {
  if (!lastDayLoaded) return 'loading';
  const sameTournament = !!tournament && !!code && String(tournament.code ?? '').toUpperCase() === code.toUpperCase();
  if (sameTournament && (tournament!.isFinished || tournament!.championOfLeagueId != null || tournament!.championOfPlayoffsId != null)) return 'finished';
  if (failed) return 'error';
  return sameTournament ? 'preparing' : 'loading';
}
export function showPreparingState(lastDayLoaded: boolean, tournament: RecapTournamentInfo | null | undefined, code: string | null | undefined): boolean {
  return recapEmptyState(lastDayLoaded, false, tournament, code) === 'preparing';
}
