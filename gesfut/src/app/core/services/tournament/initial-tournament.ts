// initial-tournament.ts

import { MatchDetailedResponse } from '../../models/matchDetailedRequest';
import { EventResponse, ParticipantResponse, TournamentResponseFull } from '../../models/tournamentResponse';

export const INITIAL_TOURNAMENT: TournamentResponseFull = {
  name: '',
  code: '',
  startDate: '',
  manager: '',
  isFinished: false,
  haveParticipants: false,
  participants: [
      {
          idParticipant: 0,
          idTeam: 0,
          name: '',
          isActive: false,
          playerParticipants: [
              {
                  id: 0,
                  shirtNumber: 0,
                  playerName: '',
                  playerLastName: '',
                  goals: 0,
                  redCards: 0,
                  yellowCards: 0,
                  isSuspended: false,
                  isMvp: 0,
                  matchesPlayed: 0,
                  status: false,
                  isActive: true,
                  isCaptain: false,
                  isGoalKeeper: false
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

export const INITIAL_DETAILED_MATCH: MatchDetailedResponse = {
  id: 0,
  homeTeam: {
      idParticipant: 1,
      idTeam: 1,
      name: "Home Team",
      isActive: true,
      playerParticipants: [
          {
              id: 1,
              playerName: "Player 1",
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
  } as ParticipantResponse,
  awayTeam: {
      idParticipant: 2,
      idTeam: 2,
      name: "Away Team",
      isActive: true,
      playerParticipants: [
          {
              id: 2,
              playerName: "Player 2",
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
  } as ParticipantResponse,
  numberOfMatchDay: 1,
  homeGoals: 0,
  awayGoals: 0,
  events: {
      id: 0,
      quantity: 0,
      type: "Goal",
      playerName: "Player 1"
  } as EventResponse,
  isFinished: false
};



export const INITIAL_TOURNAMENT_SHORT = {
    name: '',
    code: '',
    startDate: '',
    isFinished: false,
    haveParticipants: false
}
