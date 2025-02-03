import { Component } from '@angular/core';
import { MatchDaysService } from '../../core/services/tournament/match-days.service';
import { ActivatedRoute } from '@angular/router';
import { MatchDayResponse } from '../../core/models/tournamentResponse';

@Component({
    selector: 'app-recap',
    imports: [],
    templateUrl: './recap.component.html',
    styleUrl: './recap.component.scss'
})
export class RecapComponent {
  tournamentCode!: string;
  lastMatchDay!:MatchDayResponse;
  topScorers: { playerName: string; goals: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private matchDaysService: MatchDaysService
  ) {
    this.route.paramMap.subscribe(params => {
      const code = params.get('code');
      console.log(code);
      if (code) {
        this.tournamentCode = code;
        this.loadLastMatchDay(code);
      }
    });
  }

  loadLastMatchDay(code:string){
    this.matchDaysService.getLastPlayedMatchDay(code).subscribe({
      next: (response:MatchDayResponse)=>{
        this.lastMatchDay = response;
        this.loadTopScorers();
      }
    })
  }

  loadTopScorers() {
    const playerGoals: { [key: string]: number } = {};

    this.lastMatchDay.matches.forEach(match => {
      match.events.forEach(event => {
        if (event.type === 'GOAL') {
          if (playerGoals[event.playerName]) {
            playerGoals[event.playerName] += event.quantity;
          } else {
            playerGoals[event.playerName] = event.quantity;
          }
        }
      });
    });

    this.topScorers = Object.keys(playerGoals).map(playerName => ({
      playerName,
      goals: playerGoals[playerName]
    }));

    this.topScorers.sort((a, b) => b.goals - a.goals);
  }

}
