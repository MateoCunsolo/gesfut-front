import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../core/services/manager/admin.service';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { DashboardService } from '../../core/services/dashboard.service';

interface Step { id: string; title: string; help: string; done: boolean; }

/**
 * Plan 22/10 #6: guía de primeros pasos para organizadores nuevos.
 * Checklist según el estado real: equipos cargados, torneo creado y calendario generado.
 * Se oculta sola al completar todo, o a mano con "Ocultar guía". Solo usa los colores del tema.
 */
@Component({
  selector: 'app-onboarding-guide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <section class="guide" aria-labelledby="guide-title">
        <header>
          <div><span class="eyebrow">Primeros pasos</span><h2 id="guide-title">Armá tu primer torneo en 3 pasos</h2></div>
          <button type="button" class="text-action" (click)="hide()">Ocultar guía</button>
        </header>
        <ol>
          @for (s of steps(); track s.id; let i = $index) {
            <li [class.done]="s.done">
              <span class="check" aria-hidden="true">@if (s.done) {<i class="fa-solid fa-check"></i>} @else {{{ i + 1 }}}</span>
              <div class="body">
                <strong>{{ s.title }}</strong><span class="sr-only">{{ s.done ? '(hecho)' : '(pendiente)' }}</span>
                <small>{{ s.help }}</small>
                @if (!s.done) {
                  <div class="actions">
                    @switch (s.id) {
                      @case ('teams') { <button type="button" class="button-secondary" (click)="go.emit('create-team')">Crear equipo</button> }
                      @case ('tournament') { <button type="button" class="button-secondary" (click)="go.emit('create-tournament')">Crear torneo</button> }
                      @case ('fixture') { @if (pendingCode) { <button type="button" class="button-secondary" (click)="openTournament()">Ir a mi torneo</button> } }
                    }
                  </div>
                }
              </div>
            </li>
          }
        </ol>
      </section>
    }
  `,
  styles: `
    .guide { margin: 0 0 20px; padding: 16px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); }
    header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    h2 { font-size: 1.9rem; margin: 4px 0 0; }
    ol { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
    li { display: flex; gap: 12px; align-items: flex-start; padding: 10px 0; border-top: 1px solid var(--line); }
    li:first-child { border-top: 0; }
    .check { flex: 0 0 32px; height: 32px; display: grid; place-items: center; border-radius: 50%; border: 2px solid var(--primary-color); color: var(--primary-color); font-weight: 700; }
    li.done .check { background: var(--primary-soft); }
    li.done strong { color: var(--muted); text-decoration: line-through; }
    .body { display: grid; gap: 4px; min-width: 0; }
    strong { font-size: 1.5rem; }
    small { font-size: 1.3rem; color: var(--muted); }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
  `
})
export class OnboardingGuideComponent {
  static readonly HIDDEN_KEY = 'gesfut.guide.hidden';
  @Output() go = new EventEmitter<string>();
  private admin = inject(AdminService);
  private tournaments = inject(TournamentService);
  private dashboard = inject(DashboardService);
  private router = inject(Router);
  readonly steps = signal<Step[]>([]);
  readonly visible = signal(false);
  pendingCode = '';
  private pendingName = '';

  ngOnInit(): void {
    if (localStorage.getItem(OnboardingGuideComponent.HIDDEN_KEY) === '1') return;
    this.refresh();
  }

  refresh(): void {
    forkJoin({ teams: this.admin.getTeams(), list: this.tournaments.getTournamentShortList() }).subscribe({
      next: ({ teams, list }) => {
        const realTeams = (teams ?? []).filter(t => (t.name ?? '').toUpperCase() !== 'FREE').length;
        const withFixture = (list ?? []).some(t => t.haveParticipants);
        const pending = (list ?? []).find(t => !t.haveParticipants);
        this.pendingCode = pending?.code ?? '';
        this.pendingName = pending?.name ?? '';
        const steps: Step[] = [
          { id: 'teams', title: 'Cargá al menos 2 equipos', help: realTeams ? 'Tenés ' + realTeams + (realTeams === 1 ? ' equipo.' : ' equipos.') : 'Podés crearlos uno por uno o importarlos desde un Excel.', done: realTeams >= 2 },
          { id: 'tournament', title: 'Creá tu torneo', help: 'Solo necesitás el nombre.', done: (list ?? []).length > 0 },
          { id: 'fixture', title: 'Generá el calendario', help: 'Elegí los equipos del torneo y se arman las fechas.', done: withFixture },
        ];
        this.steps.set(steps);
        this.visible.set(steps.some(s => !s.done));
      },
      error: () => this.visible.set(false)
    });
  }

  hide(): void {
    localStorage.setItem(OnboardingGuideComponent.HIDDEN_KEY, '1');
    this.visible.set(false);
  }

  openTournament(): void {
    if (!this.pendingCode) return;
    localStorage.setItem('lastTournamentClicked', this.pendingCode);
    localStorage.setItem('lastTournamentClickedName', this.pendingName);
    this.dashboard.setNameTournament(this.pendingName);
    this.router.navigate(['/admin/tournaments/' + this.pendingCode]);
  }
}
