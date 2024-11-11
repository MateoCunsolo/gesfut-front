import { PlayerParticipantResponse } from "./tournamentResponse";

export interface ParticipantShortResponse {
    nameTournament: string;
    playerParticipants: PlayerParticipantResponse[];
    isActive: boolean;
}