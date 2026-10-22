import { Component, Input } from '@angular/core';
import { MatchResponse } from '../../core/models/tournamentResponse';

@Component({
  selector: 'app-match-card',
  standalone: true,
  template: `
    <article class="match-card" [class.draft]="draft">
      <div class="match-meta">
        <span class="match-status" [class.finished]="match.isFinished">{{ draft ? 'Resultado sin guardar' : isBye ? 'Fecha libre' : match.isFinished ? 'Finalizado' : 'Programado' }}</span>
        <span class="match-date">{{ match.dateTime || roundLabel }}</span>
      </div>
      @if (isBye) {
        <div class="bye"><i class="fa-regular fa-calendar" aria-hidden="true"></i><p><strong>{{ match.homeTeam === 'Free' ? match.awayTeam : match.homeTeam }}</strong><span>Descansa en esta fecha</span></p></div>
      } @else {
        <div class="scoreboard">
          <div class="team"><span class="team-mark" aria-hidden="true">{{ initials(match.homeTeam) }}</span><span class="team-name">{{ match.homeTeam }}</span></div>
          <div class="score" [attr.aria-label]="match.isFinished || draft ? match.homeGoals + ' a ' + match.awayGoals : 'Partido pendiente'">
            @if (match.isFinished || draft) { <strong>{{ match.homeGoals }}</strong><span class="score-divider">–</span><strong>{{ match.awayGoals }}</strong> }
            @else { <span class="vs">vs</span> }
          </div>
          <div class="team"><span class="team-mark" aria-hidden="true">{{ initials(match.awayTeam) }}</span><span class="team-name">{{ match.awayTeam }}</span></div>
        </div>
        @if (match.tiebreakWinnerId) { <p class="definition">Definido por desempate</p> }
        @if (match.description && !draft) { <p class="venue"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> {{ venueLabel }}</p> }
        @if (match.isFinished && !draft) {
          <details class="match-detail">
            <summary>Detalle del partido <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></summary>
            @for (event of match.events; track event.id) {
              <div class="event-line"><span class="event-symbol" aria-hidden="true">{{ symbol(event.type) }}</span><span><strong>{{ event.playerName }}</strong><small>{{ event.teamName }}</small></span><span class="event-quantity">{{ event.quantity }}</span></div>
            } @empty { <p class="empty-detail">No se registraron eventos individuales.</p> }
            @if (match.mvpPlayer) { <p class="mvp">Jugador destacado: {{ match.mvpPlayer }}</p> }
          </details>
        }
      }
      <div class="match-actions"><ng-content /></div>
    </article>
  `,
  styles: `
    :host { display:block; min-width:0; }
    .match-card { background:var(--surface); border:1px solid var(--line); border-radius:16px; overflow:hidden; }
    .match-meta { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px 16px 0; font-size:1.2rem; color:var(--muted); }
    .match-status { white-space:nowrap; font-weight:700; color:var(--muted); }
    .match-status.finished { color:var(--primary-color); }
    .match-date { text-align:right; overflow-wrap:anywhere; font-variant-numeric:tabular-nums; }
    .scoreboard { display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr); gap:12px; align-items:center; padding:20px 14px 16px; }
    .team { display:flex; flex-direction:column; gap:10px; align-items:center; text-align:center; min-width:0; }
    .team-mark { width:40px; height:40px; border-radius:12px; display:grid; place-items:center; background:var(--primary-soft); color:var(--primary-color); font-size:1.5rem; font-weight:700; }
    .team-name { font-size:1.4rem; font-weight:700; line-height:1.35; overflow-wrap:anywhere; min-height:38px; }
    .score { display:flex; align-items:center; gap:8px; color:var(--ink); font-size:3.2rem; line-height:1; font-variant-numeric:tabular-nums; }
    .score-divider { color:var(--muted); font-size:2rem; font-weight:400; }
    .vs { font-size:1.5rem; font-weight:700; color:var(--muted); }
    .venue,.definition { text-align:center; color:var(--muted); font-size:1.3rem; padding:0 16px 12px; }
    .venue i { margin-right:6px; }
    .definition { color:var(--primary-color); }
    .bye { display:flex; align-items:center; gap:16px; padding:24px 20px; }
    .bye i { font-size:2.4rem; color:var(--primary-color); }
    .bye p { display:grid; gap:4px; font-size:1.5rem; }
    .bye p span { font-size:1.3rem; color:var(--muted); }
    .match-detail { border-top:1px solid var(--line); }
    summary { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; min-height:44px; cursor:pointer; font-size:1.3rem; color:var(--primary-color); list-style:none; font-weight:700; }
    summary::-webkit-details-marker { display:none; }
    details[open] summary i { transform:rotate(180deg); }
    .event-line { display:grid; grid-template-columns:24px 1fr auto; align-items:center; gap:10px; padding:10px 16px; border-top:1px solid var(--line); font-size:1.4rem; }
    .event-line small { display:block; color:var(--muted); font-size:1.2rem; }
    .empty-detail,.mvp { padding:12px 16px; font-size:1.3rem; color:var(--muted); }
    .match-actions:empty { display:none; }
    .match-actions:not(:empty) { padding:0 16px 16px; }
    .draft { border-color:var(--primary-color); }
    @media(min-width:768px) { .team-name {font-size:1.6rem;} .score {font-size:3.6rem;} .match-meta {font-size:1.3rem;} }
  `
})
export class MatchCardComponent {
  @Input({required:true}) match!: MatchResponse;
  @Input() roundLabel = '';
  @Input() draft = false;
  get isBye(): boolean { return this.match.homeTeam === 'Free' || this.match.awayTeam === 'Free'; }
  get venueLabel(): string { const text = this.match.description?.trim() || ''; return /^cancha\b/i.test(text) ? text : 'Cancha ' + text; }
  initials(name:string):string { return name.trim().split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase(); }
  symbol(type:string):string { return ({GOAL:'⚽',YELLOW_CARD:'🟨',RED_CARD:'🟥',MVP:'★'} as Record<string,string>)[type] || '•'; }
}
