import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { AlertService } from '../../core/services/alert.service';
import { shareTournament, whatsappShareUrl } from '../../core/utils/share-tournament';

@Component({
  selector: 'app-tournament-nav',
  standalone: true,
  template: `
    <div class="tournament-heading">
      <h1>{{ name || 'Tu torneo' }}</h1>
      @if (shareCode) { <div class="share-actions"><button type="button" class="button-secondary share-button" (click)="share()"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i> Compartir torneo</button><a class="button-secondary share-button" [href]="whatsappUrl" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Compartir por WhatsApp</a></div> }
    </div>
    <nav class="tournament-navigation" aria-label="Secciones del torneo">
      @for (item of sections; track item.id) {
        <button type="button" [class.current]="active === item.id" [attr.aria-current]="active === item.id ? 'page' : null" (click)="sectionChange.emit(item.id)">
          <span class="nav-icon"><i [class]="item.icon" aria-hidden="true"></i></span>
          <span>{{ item.label }}</span>
        </button>
      }
    </nav>
  `,
  styles: `
    :host { display: block; margin-bottom: 12px; }
    .tournament-heading { padding: 12px 0 8px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
    .share-actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .tournament-heading .share-button { display: inline-flex; align-items: center; text-decoration: none; flex-direction: row; min-height: 40px; font-size: 1.4rem; padding: 0 12px; gap: 6px; }
    .eyebrow { color: var(--muted); font-size: 1.3rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    h1 { font-size: 2rem; line-height: 1.25; margin: 0; color: var(--ink); overflow-wrap: anywhere; }
    .tournament-navigation { position: fixed; bottom: 0; inset-inline: 0; z-index: 30; display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); background: var(--surface); border-top: 1px solid var(--line); padding: 8px max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)); box-shadow: 0 -4px 24px oklch(.25 .025 154 / .04); }
    button { border: 0; background: transparent; color: var(--muted); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; min-height: 52px; min-width: 0; font: inherit; font-size: 1.2rem; font-weight: 700; cursor: pointer; }
    .nav-icon { display: grid; place-items: center; width: 48px; height: 28px; border-radius: 16px; font-size: 1.8rem; }
    .current { color: var(--primary-color); }
    .current .nav-icon { background: var(--primary-soft); }
    button:active { opacity: .7; }
    @media(min-width:768px) {
      h1 { font-size: 2.4rem; }
      .tournament-navigation { position: static; grid-template-columns: repeat(5,minmax(100px,1fr)); padding: 6px; border: 1px solid var(--line); border-radius: 14px; box-shadow: none; }
      button { flex-direction: row; gap: 8px; min-height: 48px; font-size: 1.5rem; border-radius: 9px; }
      .current { background: var(--primary-soft); }
      .nav-icon { width: 28px; }
    }
  `
})
export class TournamentNavComponent {
  @Input() name = '';
  /** Solo en la vista del organizador: muestra "Compartir torneo" con el link público por código. */
  @Input() shareCode: string | null = null;
  private alerts = inject(AlertService);
  share(): void { shareTournament(this.shareCode, this.alerts); }
  get whatsappUrl(): string { return this.shareCode ? whatsappShareUrl(this.shareCode, this.name) : ''; }
  @Input() active = 'recap';
  @Output() sectionChange = new EventEmitter<string>();
  readonly sections = [
    {id:'recap',label:'Inicio',icon:'fa-solid fa-house'},
    {id:'list-teams-tournament',label:'Equipos',icon:'fa-solid fa-shirt'},
    {id:'leaderboard',label:'Tabla',icon:'fa-solid fa-ranking-star'},
    {id:'match-days',label:'Partidos',icon:'fa-regular fa-calendar'},
    {id:'prizes',label:'Premios',icon:'fa-solid fa-trophy'}
  ];
}
