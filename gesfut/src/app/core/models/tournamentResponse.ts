export interface EventResponse {
    id: number;
    quantity: number;
    type: string;
    playerName: string;
}

export interface MatchResponse {
    id: number;
    homeTeam: string;
    awayTeam: string;
    numberOfMatchDay: number;
    homeGoals: number;
    awayGoals: number;
    events: EventResponse[];
}

export interface MatchDayResponse {
    idMatchDay: number;
    numberOfMatchDay: number;
    isFinished: boolean;
    matches: MatchResponse[];
}

export interface PlayerResponse {
    id: number;
    playerName: string;
    position: string;
}

export interface PlayerParticipantResponse {
    id: number;
    shirtNumber: number;
    playerName: string;
    playerLastName: string;
    goals: number;
    redCards: number;
    yellowCards: number;
    isSuspended: boolean;
    isMvp: number;
    matchesPlayed: number;
    status:boolean;
}


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

export interface TournamentResponse {
    code: string;
}

export interface TournamentResponseFull {
    name: string;
    code: string;
    startDate: string;
    manager: string;
    isFinished: boolean;
    haveParticipants: boolean;
    participants: ParticipantResponse[];
    matchDays: MatchDayResponse[];
}
