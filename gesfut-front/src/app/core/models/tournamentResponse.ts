export interface TournamentResponse {
    code:string;
}

export interface ParticipantResponse {
    idParticipant: number;
    idTeam: number;
    name: string;
    isActive: boolean;
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

export interface MatchDayResponse {
    idMatchDay: number;
    numberOfMatchDay: number;
    isFinished: boolean;
    matches: MatchResponse[]; // Asumiendo que ya tienes una interfaz para los partidos
}

export interface MatchResponse {
    id: number;
    homeTeam: string;
    awayTeam: string;
    numberOfMatchDay: number;
    homeGoals: number;
    awayGoals: number;
    events: EventResponse[]; // Asumiendo que ya tienes una interfaz para los eventos
}

export interface EventResponse {
    id: number;
    quantity: number;
    type: string; // Ej. "GOAL"
    playerName: string;
}

export interface TournamentResponseFull {
    name: string;
    code: string;
    startDate: string; // Puedes usar 'string' si la fecha se manejará como una cadena ISO
    manager: string;
    isFinished: boolean;
    participants: ParticipantResponse[];
    matchDays: MatchDayResponse[];
}
