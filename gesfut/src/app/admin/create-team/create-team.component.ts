import { Component, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../core/services/tournament/team.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardService } from '../../core/services/dashboard.service';
import { ExcelUploadComponent } from '../excel-upload/excel-upload.component';
import Swal from 'sweetalert2';
import { AlertService } from '../../core/services/alert.service';
import { Router, RouterModule } from '@angular/router';
import { TournamentService } from '../../core/services/tournament/tournament.service';
import { AuthService } from '../../core/services/manager/auth.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { httpErrorMessage } from '../../core/utils/http-error';

@Component({
    selector: 'app-create-team',
    imports: [CommonModule, ExcelUploadComponent, ReactiveFormsModule, RouterModule, SpinnerComponent],
    templateUrl: './create-team.component.html',
    styleUrl: './create-team.component.scss'
})
export class CreateTeamComponent {
  error: String = '';
  teamForm: FormGroup;
  showExcelUpload = false;
  inAdmin: boolean = false;
  inTournament: boolean = false;
  noPlayers: boolean = true;
  isloading = false;
  private dashboardService = inject(DashboardService);
  private tournamentService = inject(TournamentService);
  private authService = inject(AuthService);
  private route = inject(Router);
button: any;
  constructor(private fb: FormBuilder, private teamService: TeamService, private alertService:AlertService) {
    this.teamForm = this.fb.group({
      name: ['', Validators.required],
      color: ['#000000', Validators.required],
      players: this.fb.array([])
    });
  }

  ngOnInit(): void {

    let url:String = this.route.url;
    if(url.includes('tournaments')){
      this.inTournament = true;
      this.inAdmin = false;
    }else{
      this.inTournament = false;
      this.inAdmin = true;
    }

    for (let i = 0; i < 2; i++) {
      this.addPlayer();
    }

     // Observando cambios en el formulario
     this.teamForm.valueChanges.subscribe(() => {
      if (this.teamForm.get('name')?.value && this.teamForm.get('color')?.value) {
        this.noPlayers = false;
      } else {
        this.noPlayers = true;
      }
    });

  }

  get players(): FormArray {
    return this.teamForm.get('players') as FormArray;
  }

  changeComponent(component: string) {
    this.dashboardService.setActiveDashboardAdminComponent(component)
    this.dashboardService.setActiveTournamentComponent('initialize');
  }

  toggleExcelUpload(): void {
    this.showExcelUpload = !this.showExcelUpload; // Alterna el estado de visibilidad
  }

  addPlayer() {
    const playerForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      number: ['', Validators.required],
      isCaptain: [false],
      isGoalKeeper: [false],
      dni: ['', Validators.pattern(/^\s*\d{1,2}\.?\d{3}\.?\d{3}\s*$/)]
    });
    this.players.push(playerForm);  
  }

  removePlayer(index: number) {
    
    if (this.players.length < 3) {
      Swal.fire({
        title: '¡Atención!',
        text: 'El equipo debe tener al menos 2 jugadores.',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
    this.players.removeAt(index);

  }

  /** Plan 22/10 #15: filas del Excel que no se pudieron leer (se informan junto con el resultado). */
  private excelRowErrors: string[] = [];

  importMultipleTeams(data: any[]) {
    const names = data.map((team: any) => team.name).join(', ');
    const skipped = this.excelRowErrors.length ? ' ' + this.excelRowErrors.length + (this.excelRowErrors.length === 1 ? ' problema del archivo no se importa' : ' problemas del archivo no se importan') + ' (te los mostramos al final).' : '';
    this.alertService.confirmAlert('Importar ' + data.length + ' equipos', 'El archivo tiene ' + data.length + ' equipos válidos: ' + names + '. Se van a crear los válidos.' + skipped, 'Crear equipos')
      .then((result) => {
        if (!result.isConfirmed || this.isloading) return;
        const teams = data.map((team: any) => ({ name: String(team.name ?? '').trim(), color: this.returnColorHex(team.color), players: team.players }));
        this.isloading = true;
        this.teamService.createMultipleTeams(teams).subscribe({
          next: (report) => {
            this.isloading = false;
            this.showExcelUpload = false;
            const problems = [...this.excelRowErrors, ...(report?.failed ?? []).map(f => (f.name || 'Equipo ' + (f.index + 1)) + ': ' + f.error)];
            this.excelRowErrors = [];
            const created = report?.createdCount ?? teams.length;
            if (problems.length) this.alertService.listAlert(created + (created === 1 ? ' equipo creado' : ' equipos creados') + '; no se importó lo siguiente', problems);
            else this.alertService.successAlert(created + ' equipos creados');
            if (this.inTournament) this.dashboardService.setActiveTournamentComponent('initialize');
            this.dashboardService.setActiveDashboardAdminComponent('dashboard');
          },
          error: (err: HttpErrorResponse) => {
            this.isloading = false;
            this.excelRowErrors = [];
            this.alertService.errorAlert(httpErrorMessage(err, 'No se pudieron crear los equipos.'));
            if (err.status !== 0) this.authService.serverNotResponding(err);
          }
        });
      });
  }

  returnColorHex(color: string): string {
    // Recorrido 22/10: aceptar colores hex (#RGB o #RRGGBB) además de los nombres.
    const raw = String(color ?? '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toUpperCase();
    if (/^#[0-9a-fA-F]{3}$/.test(raw)) return ('#' + raw.slice(1).split('').map(x => x + x).join('')).toUpperCase();
    color = raw.toUpperCase();
    switch (color) {
      case 'ROJO': return '#FF0000';
      case 'AZUL': return '#0000FF';
      case 'VERDE': return '#008000';
      case 'AMARILLO': return '#FFFF00';
      case 'BLANCO': return '#FFFFFF';
      case 'NEGRO': return '#000000';
      case 'GRIS': return '#808080';
      case 'MARRÓN': return '#A52A2A';
      case 'NARANJA': return '#FFA500';
      case 'ROSADO': return '#FFC0CB';
      case 'LILA': return '#C8A2C8';
      case 'MORADO': return '#800080';
      case 'DORADO': return '#FFD700';
      case 'PLATEADO': return '#C0C0C0';
      case 'PÚRPURA': return '#6A0DAD';
      case 'OLIVA': return '#808000';
      case 'VERDE CLARO': return '#90EE90';
      case 'CIANO': return '#00FFFF';
      case 'AGUAMARINA': return '#7FFFD4';
      case 'TURQUESA': return '#40E0D0';
      case 'BEIGE': return '#F5F5DC';
      case 'VINO': return '#800000';
      case 'LIMA': return '#00FF00';
      case 'SAHARA': return '#C2B280';
      case 'LAVANDA': return '#E6E6FA';
      case 'BISQUE': return '#FFE4C4';
      case 'TOMATE': return '#FF6347';
      case 'VIOLETA': return '#EE82EE';
      case 'CORAL': return '#FF7F50';
      case 'AZUL MARINO': return '#000080';
      case 'GRIS OSCURO': return '#A9A9A9';
      case 'MARFIL': return '#FFFFF0';
      case 'ESMERALDA': return '#50C878';
      case 'CIELO': return '#87CEEB';
      case 'ROSA': return '#FF69B4';
      case 'CAFE': return '#3E2723';
      case 'FUCHSIA': return '#FF00FF';
      case 'INDIGO': return '#4B0082';
      case 'AMBAR': return '#FFBF00';
      case 'AZUL CLARO': return '#ADD8E6';
      case 'AZUL PASTEL': return '#AEC6CF';
      case 'BERMELLO': return '#9B111E';
      case 'CARNE': return '#FFCC99';
      case 'CINNAMON': return '#D2691E';
      case 'MINT': return '#98FF98';
      case 'TURQUESA CLARO': return '#AFEEEE';
      case 'MELON': return '#FDBCB4';
      case 'OLIVO': return '#556B2F';
      case 'CANDY': return '#E6A8D7';
      case 'LIME CLARO': return '#BFFF00';
      case 'AMBER': return '#FFBF00';
      case 'PERSIMMON': return '#EC5800';
      case 'SNOW': return '#FFFAFA';
      case 'HONEYDEW': return '#F0FFF0';
      case 'FIREBRICK': return '#B22222';
      case 'SADDLEBROWN': return '#8B4513';
      case 'KHAKI': return '#F0E68C';
      case 'CITRUS': return '#B5E62C';
      case 'VANILLA': return '#F3E5AB';
      case 'CARIBBEAN BLUE': return '#00B5E2';
      case 'CHARTREUSE': return '#7FFF00';
      case 'SAPPHIRE': return '#0F52BA';
      case 'BROWN': return '#A52A2A';
      case 'CORNFLOWER BLUE': return '#6495ED';
      case 'FIRE ENGINE RED': return '#CE2029';
      case 'DARK OLIVE GREEN': return '#556B2F';
      case 'SEASHELL': return '#FFF5EE';
      case 'MIDNIGHT BLUE': return '#191970';
      case 'PLUM': return '#DDA0DD';
      case 'ROSE': return '#FF007F';
      case 'TANGERINE': return '#FF9F00';
      case 'PUMPKIN': return '#FF7518';
      case 'CHOCOLATE': return '#D2691E';
      case 'MAROON': return '#800000';
      case 'LAVENDER BLUSH': return '#FFF0F5';
      case 'DARK SLATE GRAY': return '#2F4F4F';
      case 'AUBURN': return '#A52A2A';
      case 'TOMATO': return '#FF6347';
      case 'JADE': return '#00A36C';
      case 'FROST': return '#E4F1F4';
      case 'PEACH': return '#FFDAB9';
      case 'FLAME': return '#E25822';
      case 'SAND': return '#C2B280';
      case 'SEAFOAM': return '#9FE2BF';
      case 'BLUEBERRY': return '#4F86F7';
      case 'BASIL': return '#3A5F0B';
      case 'SKY BLUE': return '#87CEEB';
      case 'TITANIUM': return '#8A8F8A';
      case 'JUNIPER': return '#4B6F44';
      case 'HELIOTROPE': return '#DF73FF';
      case 'HACKBERRY': return '#6F4F37';
      case 'TULIP': return '#FF7F7F';
      case 'PEAR': return '#D1E150';
      case 'AMETHYST': return '#9966CC';
      case 'IVORY': return '#FFFFF0';
      case 'CHERRY': return '#DE3163';
      case 'TUSCAN': return '#FAD6A5';
      case 'LAVENDER MIST': return '#E6E6FA';
      default:
        return '#FFFFFF';
    }
  }

  loadTeamData(parsed: { teams: any[]; errors: string[] } | any[]) {
      // Plan 22/10 #15: el Excel llega con los equipos válidos y la lista de filas con problemas.
      const data: any[] = Array.isArray(parsed) ? parsed : parsed.teams;
      this.excelRowErrors = Array.isArray(parsed) ? [] : parsed.errors;
      if (data.length === 1 && this.excelRowErrors.length) { this.alertService.listAlert('Se cargó 1 equipo; revisá lo que quedó afuera', this.excelRowErrors); this.excelRowErrors = []; }
      // Recorrido 22/10: un Excel con varios equipos crea todos (antes solo tomaba el primero, en silencio).
      if (data.length > 1) { this.importMultipleTeams(data); return; }
      if (data.length > 0) {
        const team = data[0];
        let colorHex = this.returnColorHex(team.color);
        this.teamForm.patchValue({
          name: team.name,
          color: colorHex
        });
    
        this.players.clear();
        team.players.forEach((player: any) => {
          const playerForm = this.fb.group({
            name: [player.name, Validators.required],
            lastName: [player.lastName, Validators.required],
            number: [player.number, Validators.required],
            isCaptain: [player.isCaptain],
            isGoalKeeper: [player.isGoalKeeper],
            dni: [player.dni ?? '']
          });
          this.players.push(playerForm);
        });
        this.showExcelUpload=false;
      }
      if(this.players.length>0){
        this.noPlayers = false;
      }else{
        this.noPlayers = true;
      }
  }
    
  onSubmit() {
    if (this.isloading) return; // Loop 8: doble toque enviaba el equipo dos veces
    if (this.teamForm.invalid) {
      this.alertService.errorAlert("Completá todos los campos.");
      return;
    }
    const teamData = this.teamForm.value;
    if(this.validateIfPlayersAreRepeated(teamData)){
      this.alertService.errorAlert("No se pueden repetir jugadores en un equipo.");
      return;
    }
    this.isloading = true;
    this.teamService.createTeam(teamData).subscribe({
      next: (response) => {
        this.error = '';
        this.alertService.successAlert(this.inTournament ? "Equipo creado y agregado a la preparación del torneo." : "Equipo creado!");
        if(this.inTournament){
          this.dashboardService.setActiveTournamentComponent('initialize');
          this.tournamentService.setNewTeamToInitTournament(response);
        }
        this.dashboardService.setActiveDashboardAdminComponent('dashboard');
        this.isloading = false;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 0) this.alertService.errorAlert('No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo: los datos siguen cargados.');
        else { this.alertService.errorAlert(httpErrorMessage(err, 'No se pudo crear el equipo.')); this.authService.serverNotResponding(err); }   
        this.isloading = false;
      }
    });
  }

  validateIfPlayersAreRepeated(teamData: any): boolean {
    let players = teamData.players;
    let repeatedPlayers = players.filter((player: any, index: number) => {
      return players.findIndex((p: any) => p.name === player.name && p.lastName === player.lastName) !== index;
    });
    return repeatedPlayers.length
  }

  
}
