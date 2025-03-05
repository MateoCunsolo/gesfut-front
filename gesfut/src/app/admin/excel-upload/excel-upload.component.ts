import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { AlertService } from '../../core/services/alert.service';

@Component({
    selector: 'app-excel-upload',
    imports: [CommonModule],
    templateUrl: './excel-upload.component.html',
    styleUrls: ['./excel-upload.component.scss']
})
export class ExcelUploadComponent {
  private alertService = inject(AlertService);
  @Output() dataLoaded = new EventEmitter<any>();

  showFormatExcel() {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['NOMBRE', 'APELLIDO', 'DORSAL', 'CAPITAN', 'ARQUERO', 'EQUIPO', 'COLOR_CAMISETA'],
      ['MATEO', 'CUNSOLO', 10, 'TRUE', 'FALSE', 'RIVER', 'ROJO'],
      ['RONALDO', 'NAZZARIO', 9, 'FALSE', 'FALSE', 'RIVER', 'ROJO'],
      ['DIBU', 'MARTINEZ', 24, 'FALSE', 'TRUE', 'RIVER', 'ROJO']
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Formato');
    XLSX.writeFile(workbook, 'formato_jugadores.xlsx');
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.name.split('.').pop() !== 'xlsx') {
      this.alertService.errorAlert('El archivo debe ser de tipo Excel');
      event.target.value = '';
      file.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Leer la primera hoja
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convertir hoja a JSON
      const rawData = XLSX.utils.sheet_to_json(sheet);

      // Transformar la estructura de los datos
      const teams: Record<string, any> = {};
      rawData.forEach((player: any) => {
        const teamName = player['EQUIPO'];
        if (!teams[teamName]) {
          teams[teamName] = {
            name: teamName,
            color: player['COLOR_CAMISETA'],
            players: []
          };
        }

        teams[teamName].players.push({
          name: player['NOMBRE'],
          lastName: player['APELLIDO'],
          number: player['DORSAL'],
          isCaptain: player['CAPITAN'] == 'SI' || player['CAPITAN'] == 'TRUE',
          isGoalKeeper: player['ARQUERO'] == 'SI' || player['ARQUERO'] == 'TRUE'
        });
      });

      const jsonData = Object.values(teams);

      if(jsonData.length === 0) {
        this.alertService.errorAlert('No se encontraron datos en el archivo');
        event.target.value = '';
        file.value = '';
        return;
      }

      this.dataLoaded.emit(jsonData);
    };
    reader.readAsArrayBuffer(file);
  }
}
