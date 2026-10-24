import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { TournamentService } from '../../../../../core/services/tournament/tournament.service';
import { TeamService } from '../../../../../core/services/tournament/team.service';
import { AlertService } from '../../../../../core/services/alert.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-delete-player',
    imports: [],
    templateUrl: './delete.component.html',
    styleUrl: './delete.component.scss'
})
export class DeleteComponent {

  private tournamentService = inject(TournamentService);
  private teamService = inject(TeamService);
  private isFinishedTournament: boolean = false;
  private alertService = inject(AlertService);
  @Input() idPlayerParticipant: number = 0;
  @Input() isGlobalTeam: boolean = false;
  @Input() isCapitan: boolean = false;
  @Input() isGoalKeeper: boolean = false
  @Input() idPlayer: number = 0;
  @Input() name: string = '';
  /** "Nombre Apellido" sin comas ni restos de campos vacios; si no hay datos, "este jugador". */
  get displayName(): string {
    const clean = String(this.name ?? '').replace(/\bundefined\b|\bnull\b/g, '').replace(/[\s,]+/g, ' ').trim();
    return clean || 'este jugador';
  }
  @Output() public deletePlayer = new EventEmitter<number>();
  constructor() { }

  ngOnInit(): void {
  }


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
    this.alertService.confirmAlert('Eliminar jugador', '\u00bfSeguro que quer\u00e9s eliminar a ' + this.displayName + '?', 'Aceptar').then((result) => {
      if (result.isConfirmed) {
        this.alertService.twoOptionsAlert('Eliminar jugador', '\u00bfDe d\u00f3nde lo quer\u00e9s eliminar?', 'Equipo Global', 'Torneo Actual').then((result) => {
          if (this.verificationsDelete()) {
            if (result.isConfirmed) {
              this.deleteFromGlobal();
            } else if (result.dismiss === Swal.DismissReason.cancel){
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
      }
    });

  }

  deleteFromGlobal() {
    if (this.isGlobalTeam) {
      this.alertService.confirmAlert('Eliminar jugador', '\u00bfSeguro que quer\u00e9s eliminar a ' + this.displayName + '?', 'Aceptar').then((result) => {
        if (result.isConfirmed) {
          this.deleteFromGlobalCallService();
        }
      });
    }else{
      this.deleteFromGlobalCallService();
    }
  }

  deleteFromGlobalCallService() {
    if(!this.verificationsDelete()){
      if(this.isCapitan) this.alertService.errorAlert('No pod\u00e9s eliminar al capit\u00e1n');
      if(this.isGoalKeeper) this.alertService.errorAlert('No podés eliminar al arquero');
      return;
    }
    this.teamService.changeStatusPlayerGlobal(this.idPlayer, false).subscribe({
      next:()=>{
        this.alertService.successAlert('Jugador eliminado');
        this.deletePlayer.emit(this.idPlayer);
      }
    });

  }


  showErrorMessage() {
    if (this.isCapitan) {
      this.alertService.errorAlert('No pod\u00e9s eliminar al capit\u00e1n');
    } else if (this.isGoalKeeper) {
      this.alertService.errorAlert('No podés eliminar al arquero');
    }else{
      this.alertService.errorAlert('Error al eliminar jugador');
    }
  }

}