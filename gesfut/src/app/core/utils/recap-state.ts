/** Vista publica: "El torneo se esta preparando" solo cuando ya se sabe (sin flash mientras carga)
 *  que el torneo pedido existe, NO esta finalizado y no tiene campeon. */
export interface RecapTournamentInfo { code?: string | null; isFinished?: boolean | null; championOfLeagueId?: number | null; championOfPlayoffsId?: number | null; }
export function showPreparingState(lastDayLoaded: boolean, tournament: RecapTournamentInfo | null | undefined, code: string | null | undefined): boolean {
  if (!lastDayLoaded || !tournament || !code || tournament.code !== code) return false;
  return !tournament.isFinished && tournament.championOfLeagueId == null && tournament.championOfPlayoffsId == null;
}
