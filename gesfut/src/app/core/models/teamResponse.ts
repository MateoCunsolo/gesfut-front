export interface TeamResponse {
    id: number;
    name: string;
    color: string;
    status: boolean;
    players: PlayerResponse[];
}

export interface PlayerResponse {
    name: string;
    lastName: string;
    isCaptain: boolean;
    isGoalKeeper: boolean;
    number: number;
    status: boolean;
    id: number;
}
