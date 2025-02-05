import { Component, Input, SimpleChanges } from '@angular/core';
import {
  EventResponse,
  MatchResponse,
} from '../../core/models/tournamentResponse';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-list-events',
  imports: [NgClass],
  template: `
    @if (match.events.length === 0) {
      <div class="events-container no">
        <div class="evemt-column">
          <div class="event-item ">
          <span class="player">No hubo eventos </span>
          </div>
        </div>
      </div>
    }@else{
      <div class="events-container">
        <div class="event-column">
          @for (item of eventsHome; track $index) {
          <div
            class="event-item left"
            [ngClass]="{ isTeamNameClicked: isTeamNameClicked === teamHome }"
          >
            <span class="type">{{ returnType(item.type) }}</span>
            <span class="player">{{ item.playerName }}</span>
            <span class="quantity">x{{ item.quantity }}</span>
          </div>
          }
        </div>

        <div class="event-column">
          @for (item of eventsAway; track $index) {
          <div
            class="event-item right"
            [ngClass]="{ isTeamNameClicked: isTeamNameClicked === teamAway }"
          >
            <span class="quantity">x{{ item.quantity }}</span>
            <span class="player">{{ item.playerName }}</span>
            <span class="type">{{ returnType(item.type) }}</span>
          </div>
          }
        </div>

      </div>
    }
  `,
  styles: [
    ` 
      .no{
        grid-template-columns: 1fr !important;
      }

      .events-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        width: 100%;
        max-width: 600px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        padding: 12px;
        font-family: Arial, sans-serif;
        @media (max-width: 400px) {
          grid-template-columns: 1fr;
          width: 100%;
        }
      }

      .event-column {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .event-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: bold;
        gap: 20px;
      }

      .isTeamNameClicked {
        background: rgba(65, 207, 138, 0.35) !important;
      }

      .event-item {
        background: #f0f0f0;
      }

      .type {
        font-size: 16px;
      }

      .player {
        flex-grow: 1;
        text-align: center;
        font-weight: bold;
        color: #333;
      }

      .quantity {
        font-size: 14px;
        color: #666;
      }
    `,
  ],
})
export class ListEventsComponent {
  @Input() match: MatchResponse = {} as MatchResponse;
  eventsHome: EventResponse[] = [];
  eventsAway: EventResponse[] = [];
  teamAway: string = '';
  teamHome: string = '';
  @Input() isTeamNameClicked: string = '';
  ngOnInit(): void {
    this.orderEvents();
  }

  onChanges(changes: SimpleChanges): void {
    if (changes['match']) {
      this.match = changes['match'].currentValue;

      this.orderEvents();
      console.log(this.match);
    }
  }

  orderEvents(): void {
    let homeTeam = this.match.homeTeam;
    this.match.events.forEach((event) => {
      if (event.teamName === homeTeam) {
        this.eventsHome.push(event);
      } else {
        this.eventsAway.push(event);
      }
    });
    this.teamAway = this.match.awayTeam;
    this.teamHome = this.match.homeTeam;
  }

  constructor() {}

  returnType(type: string): string {
    switch (type) {
      case 'GOAL':
        return '⚽';
      case 'YELLOW_CARD':
        return '🟨';
      case 'RED_CARD':
        return '🟥';
      default:
        return '🚫';
    }
  }
}
