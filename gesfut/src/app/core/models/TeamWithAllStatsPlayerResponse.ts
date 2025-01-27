import { PlayerParticipantResponse } from "./tournamentResponse";

export interface TeamWithAllStatsPlayerResponse {
    idTeam: number;
    name: string;
    status: boolean;
    playerParticipants: PlayerParticipantResponse[];
}