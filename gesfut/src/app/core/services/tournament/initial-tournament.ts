// initial-tournament.ts

import { TournamentResponseFull } from "../../models/tournamentResponse";


export const INITIAL_TOURNAMENT: TournamentResponseFull = {
    name: '',
    code: '',
    startDate: '',
    manager: '',
    isFinished: false,
    participants: [
        {
            idParticipant: 0,
            idTeam: 0,
            name: '',
            isActive: false,
            playerParticipants: [
                {
                    id: 0,
                    playerName: '',
                    goals: 0,
                    redCards: 0,
                    yellowCards: 0,
                    isSuspended: false,
                    isMvp: 0,
                    matchesPlayed: 0
                }
            ],
            statistics: {
                points: 0,
                matchesPlayed: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsFor: 0,
                goalsAgainst: 0
            }
        }
    ],
    matchDays: [
        {
            idMatchDay: 0,
            numberOfMatchDay: 0,
            isFinished: false,
            matches: [
                {
                    id: 0,
                    homeTeam: '',
                    awayTeam: '',
                    numberOfMatchDay: 0,
                    homeGoals: 0,
                    awayGoals: 0,
                    events: [
                        {
                            id: 0,
                            quantity: 0,
                            type: '',
                            playerName: ''
                        }
                    ]
                }
            ]
        }
    ]
};