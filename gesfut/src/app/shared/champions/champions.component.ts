import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { TournamentResponseFull } from '../../core/models/tournamentResponse';

/**
 * Plan 22/10 #3: en un torneo con liga + playoff se muestran los dos títulos (campeón de liga y campeón de playoff).
 * Usa solo los colores existentes del tema (variables CSS), sin colores nuevos.
 */
@Component({
  selector: 'app-champions',
  standalone: true,
  template: `
    @if (titles.length) {
      <section class="champions" aria-label="Campeones del torneo">
        <ul>
          @for (t of titles; track t.label) {
            <li><i class="fa-solid fa-trophy" aria-hidden="true"></i><span class="eyebrow">{{ t.label }}</span><strong>{{ t.team }}</strong></li>
          }
        </ul>
      </section>
    }
  `,
  styles: `
    .champions { margin-bottom: 16px; }
    ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
    li { position: relative; display: grid; gap: 4px; padding: 14px 48px 14px 16px; border-radius: 14px; background: var(--primary-soft); }
    li i { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: var(--primary-color); font-size: 2rem; }
    strong { font-size: 1.8rem; color: var(--ink); overflow-wrap: anywhere; }
    @media (min-width: 768px) { ul { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); } }
  `
})
export class ChampionsComponent {
  private destroyRef = inject(DestroyRef);
  titles: { label: string; team: string }[] = [];
  tournament?: TournamentResponseFull;

  constructor(private tournamentService: TournamentService) {
    this.tournamentService.currentTournament.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(t => {
      this.tournament = t;
      this.titles = ChampionsComponent.titlesOf(t);
    });
  }

  static titlesOf(t: TournamentResponseFull | undefined): { label: string; team: string }[] {
    if (!t?.participants) return [];
    const name = (id?: number | null) => id ? t.participants.find(p => p.idParticipant === id)?.name : undefined;
    const league = name(t.championOfLeagueId), playoff = name(t.championOfPlayoffsId);
    const hasPlayoff = (t.matchDays ?? []).some(d => d.isPlayOff);
    const out: { label: string; team: string }[] = [];
    if (league) out.push({ label: hasPlayoff ? 'Campeón de liga' : 'Campeón', team: league });
    if (playoff) out.push({ label: 'Campeón de playoff', team: playoff });
    return out;
  }
}
