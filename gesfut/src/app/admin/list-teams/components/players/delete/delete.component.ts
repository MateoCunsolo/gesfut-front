import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { TournamentService } from '../../../../../core/services/tournament/tournament.service';
import { TeamService } from '../../../../../core/services/tournament/team.service';
import { AlertService } from '../../../../../core/services/alert.service';

@Component({
  selector: 'app-delete-player',
  standalone: true,
  imports: [],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {

  private tournamentService = inject(TournamentService);
  private teamService = inject(TeamService);

  private alertService = inject(AlertService);
  @Input() idPlayerParticipant: number = 0;
  @Input() isGlobalTeam: boolean = false;
  @Input() isCapitan: boolean = false;
  @Input() isGoalKeeper: boolean = false
  @Input() idPlayer: number = 0;
  @Input() name: string = '';
  @Output() public deletePlayer = new EventEmitter<number>();
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isGlobalTeam']) {
      this.isGlobalTeam = this.isGlobalTeam;
    }
  }


  reconfirmDelete(idPlayerParticipant: number) {
    if (this.isGlobalTeam) {
      this.deleteFromGlobal();
    } else {
      this.showNormalAlert(idPlayerParticipant);
    }
  }

  showNormalAlert(idPlayerParticipant: number) {
    this.alertService.confirmAlert('Eliminar jugador', 'Estas seguro que quieres eliminar a ' + this.name + '?', 'Aceptar').then((result) => {
      if (result.isConfirmed) {
        this.alertService.twoOptionsAlert('Eliminar jugador', 'Elije de donde lo quieres eliminar', 'Equipo Global', 'Torneo Actual').then((result) => {
          if (this.verificationsDelete()) {
            if (result.isConfirmed) {
              this.deleteFromGlobal();
            } else {
              this.deleteFromTournament(idPlayerParticipant);
            }
          } else {
            this.showErrorMessage();
          }
        });
      }
    })
  }

  verificationsDelete(): Boolean {
    if (this.isCapitan || this.isGoalKeeper) {
      return false;
    }
    return true;
  }

  deleteFromTournament(idPlayerParticipant: number) {
    this.tournamentService.changeStatusPlayerParticipant(idPlayerParticipant, false).subscribe({
      next:()=>{
        this.alertService.successAlert('Jugador eliminado');
        this.deletePlayer.emit(this.idPlayer);
      },
      error:(error)=>{
        console.error('Error al eliminar jugador', error);
      }
    });

  }

  deleteFromGlobal() {
    if (this.isGlobalTeam) {
      this.alertService.confirmAlert('Eliminar jugador', 'Estas seguro que quieres eliminar a ' + this.name + '?', 'Aceptar').then((result) => {
        if (result.isConfirmed) {
          this.deleteFromGlobalCallService();
        }
      });
    }else{
      this.deleteFromGlobalCallService();
    }
  }

  deleteFromGlobalCallService() {
    console.log('Eliminando jugador global:', this.idPlayer);
    this.teamService.changeStatusPlayerGlobal(this.idPlayer, false).subscribe({
      next:()=>{
        this.alertService.successAlert('Jugador eliminado');
        this.deletePlayer.emit(this.idPlayer);
      }
    });

  }


  showErrorMessage() {
    if (this.isCapitan) {
      this.alertService.errorAlert('No puedes eliminar a un capitan');
    } else if (this.isGoalKeeper) {
      this.alertService.errorAlert('No puedes eliminar a un portero');
    }else{
      this.alertService.errorAlert('Error al eliminar jugador');
    }
  }

}