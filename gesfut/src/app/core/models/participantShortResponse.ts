import { PlayerParticipantResponse } from "./tournamentResponse";

export interface ParticipantShortResponse {
    nameTournament: string;
    codeTournament: string;
    idParticipant: number;
    playerParticipants: PlayerParticipantResponse[];
    isActive: boolean;
}