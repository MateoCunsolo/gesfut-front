/** Vista publica (review 24/10): que mostrar cuando no hay ultima fecha. Nada mientras carga (sin flash);
 *  "se esta preparando" solo para un torneo nuevo; finalizado o con campeon, mensaje neutro; error, aviso. */
export interface RecapTournamentInfo { code?: string | null; isFinished?: boolean | null; championOfLeagueId?: number | null; championOfPlayoffsId?: number | null; }
export type RecapEmptyState = 'loading' | 'preparing' | 'finished' | 'error';
export function recapEmptyState(lastDayLoaded: boolean, failed: boolean, tournament: RecapTournamentInfo | null | undefined, code: string | null | undefined, timedOut = false): RecapEmptyState {
  // Review 24/10: con timeout (10 s sin datos) se cae a un estado final seguro, nunca pantalla en blanco.
  if (!lastDayLoaded) return timedOut ? 'error' : 'loading';
  const sameTournament = !!tournament && !!code && String(tournament.code ?? '').toUpperCase() === code.toUpperCase();
  if (sameTournament && (tournament!.isFinished || tournament!.championOfLeagueId != null || tournament!.championOfPlayoffsId != null)) return 'finished';
  if (failed) return 'error';
  return sameTournament ? 'preparing' : (timedOut ? 'error' : 'loading');
}
export function showPreparingState(lastDayLoaded: boolean, tournament: RecapTournamentInfo | null | undefined, code: string | null | undefined): boolean {
  return recapEmptyState(lastDayLoaded, false, tournament, code) === 'preparing';
}
/** Retest 31/10: un torneo en curso sin fechas responde 404 en lastPlayed; eso no es error, es "sin ultima fecha". */
export function lastPlayedFailed(error: unknown): boolean {
  return !(typeof error === 'object' && error !== null && (error as { status?: unknown }).status === 404);
}
