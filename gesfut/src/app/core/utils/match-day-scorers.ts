export type MatchDayEventLike = {
  type?: string;
  playerName?: string | null;
  teamName?: string | null;
  idPlayerParticipant?: number | null;
  quantity?: number | null;
};

export type MatchDayLike = {
  events?: MatchDayEventLike[] | null;
};

export type MatchDayScorer = {
  playerId: number | string;
  playerName: string;
  teamName: string;
  goals: number;
  showTeam: boolean;
};

/** Agrupa goles de una fecha por id de jugador (idPlayerParticipant), no por nombre.
 *  Si dos jugadores distintos comparten nombre, showTeam queda true para mostrar el equipo. */
export function aggregateMatchDayScorers(matches: MatchDayLike[] | null | undefined): MatchDayScorer[] {
  const byId = new Map<string, { playerId: number | string; playerName: string; teamName: string; goals: number }>();
  for (const match of matches ?? []) {
    for (const event of match.events ?? []) {
      if (event.type !== 'GOAL') continue;
      const quantity = Number(event.quantity ?? 0);
      if (!Number.isFinite(quantity) || quantity === 0) continue;
      const playerName = (event.playerName ?? '').trim();
      const teamName = (event.teamName ?? '').trim();
      const hasId = event.idPlayerParticipant != null;
      const key = hasId ? 'id:' + event.idPlayerParticipant : 'name:' + playerName + '\0' + teamName;
      const playerId = hasId ? event.idPlayerParticipant! : key;
      const prev = byId.get(key);
      if (prev) prev.goals += quantity;
      else byId.set(key, { playerId, playerName, teamName, goals: quantity });
    }
  }
  const list: MatchDayScorer[] = [...byId.values()].map((v) => ({ ...v, showTeam: false }));
  const nameCount = new Map<string, number>();
  for (const s of list) nameCount.set(s.playerName, (nameCount.get(s.playerName) ?? 0) + 1);
  for (const s of list) s.showTeam = (nameCount.get(s.playerName) ?? 0) > 1 && !!s.teamName;
  list.sort((a, b) => b.goals - a.goals || a.playerName.localeCompare(b.playerName, 'es') || a.teamName.localeCompare(b.teamName, 'es'));
  return list;
}
