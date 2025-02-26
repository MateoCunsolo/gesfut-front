export interface EventResponse {
    id: number;
    quantity: number;
    type: string;
    playerName: string;
    teamName: string;
    idPlayerParticipant: number;
}

export interface MatchResponse {
    id: number;
    homeTeam: string;
    awayTeam: string;
    numberOfMatchDay: number;
    homeGoals: number;
    awayGoals: number;
    events: EventResponse[];
    isFinished: boolean;
    dateTime: string,
    description: string,
    mvpPlayer: string;
    vsMatchIdWhoWin: number;
}

export interface MatchDayResponse {
    idMatchDay: number;
    numberOfMatchDay: number;
    isFinished: boolean;
    mvpPlayer: string;
    isPlayOff: boolean;
    matches: MatchResponse[];
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
    isActive:boolean;
    isCaptain:boolean;
    isGoalKeeper:boolean;
    playerId: number;
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
