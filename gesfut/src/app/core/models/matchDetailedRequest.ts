import { EventResponse, ParticipantResponse } from "./tournamentResponse";

export interface MatchDetailedResponse {
    id: number;
    tiebreakWinnerId?: number | null;
    penaltiesHome?: number | null;
    penaltiesAway?: number | null;
    isPlayOff?: boolean;
    homeTeam: ParticipantResponse;
    awayTeam: ParticipantResponse;
    numberOfMatchDay: number;
    homeGoals: number;
    awayGoals: number;
    events: EventResponse[];  // Puedes reemplazar `any` con el tipo adecuado si tienes la estructura de los eventos.
    isFinished: boolean;
    mvpPlayer: string;
    vsMatchIdWhoWin: number | null;
  }