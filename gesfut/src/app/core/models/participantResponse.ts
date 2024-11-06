import { PlayerParticipantResponse } from "./tournamentResponse";

export interface ParticipantResponse {
    idParticipant: number;
    idTeam: number;
    name: string;
    isActive: boolean;
    playerParticipants: PlayerParticipantResponse[];
    statistics: {
        points: number;
        matchesPlayed: number;
        wins: number;
        draws: number;
        losses: number;
        goalsFor: number;
        goalsAgainst: number;
    };
}


export interface ParticipantResponseShort {
    idParticipant: number;
    name: string
}