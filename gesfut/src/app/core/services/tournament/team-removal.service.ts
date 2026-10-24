import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AlertService } from '../alert.service';
import { TeamDeletionResponse, TeamService } from './team.service';
import { httpErrorMessage } from '../../utils/http-error';

/** Plan 22/10 #2: texto del diálogo de confirmación; deja claro si se borra o se deshabilita. */
export function deletionConfirmText(p: TeamDeletionResponse): { title: string; text: string; button: string } {
  const regen = p.regeneratedTournaments?.length
    ? ` En ${p.regeneratedTournaments.length === 1 ? 'el torneo' : 'los torneos'} ${p.regeneratedTournaments.join(', ')} todavía no se jugó ningún partido: se lo quita y se regenera el fixture completo sin él.`
    : '';
  if (p.action === 'DELETE') {
    return { title: `Eliminar "${p.teamName}"`, button: 'Eliminar definitivamente',
      text: `Este equipo nunca jugó un partido, así que se va a borrar definitivamente junto con sus jugadores.${regen} No se puede deshacer.` };
  }
  const ongoing = p.ongoingTournaments?.length
    ? ` En ${p.ongoingTournaments.length === 1 ? 'el torneo en curso' : 'los torneos en curso'} (${p.ongoingTournaments.join(', ')}) queda dado de baja: sus partidos pendientes pasan a fecha libre para el rival.`
    : '';
  return { title: `Deshabilitar "${p.teamName}"`, button: 'Deshabilitar equipo',
    text: `Este equipo ya tiene historial, así que no se borra: se va a deshabilitar. Sus resultados, tablas y goleadores se conservan.${ongoing}${regen} Después podés volver a habilitarlo para torneos nuevos.` };
}

@Injectable({ providedIn: 'root' })
export class TeamRemovalService {
  private teams = inject(TeamService);
  private alerts = inject(AlertService);

  /** Pregunta y aplica. Devuelve la acción hecha o null si se canceló/bloqueó. */
  async remove(teamId: number): Promise<'DELETE' | 'DISABLE' | null> {
    try {
      const preview = await firstValueFrom(this.teams.previewDeleteTeam(teamId));
      if (preview.blockedReason) { this.alerts.errorAlert(preview.blockedReason); return null; }
      const c = deletionConfirmText(preview);
      const answer = await this.alerts.confirmAlert(c.title, c.text, c.button);
      if (!answer.isConfirmed) return null;
      const done = await firstValueFrom(this.teams.deleteTeam(teamId));
      this.alerts.successAlert(done.action === 'DELETE' ? 'Equipo eliminado' : 'Equipo deshabilitado');
      return done.action;
    } catch (err) {
      this.alerts.errorAlert(httpErrorMessage(err, 'No se pudo eliminar el equipo.'));
      return null;
    }
  }

  async enable(teamId: number, teamName: string): Promise<boolean> {
    const answer = await this.alerts.confirmAlert(`Habilitar "${teamName}"`, 'El equipo vuelve a estar disponible para torneos nuevos. En los torneos donde fue dado de baja sigue de baja.', 'Habilitar');
    if (!answer.isConfirmed) return false;
    try {
      await firstValueFrom(this.teams.changeStatusTeam(teamId, true));
      this.alerts.successAlert('Equipo habilitado');
      return true;
    } catch (err) {
      this.alerts.errorAlert(httpErrorMessage(err, 'No se pudo habilitar el equipo.'));
      return false;
    }
  }
}
