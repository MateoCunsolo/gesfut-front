import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
// xlsx (~550 KB) se carga solo al usarlo, para no pesar en la vista publica.
const loadXlsx = () => import('xlsx');
import { AlertService } from '../../core/services/alert.service';
import { EXCEL_MAX_BYTES, parseTeamRows } from '../../core/utils/excel-teams';

@Component({
    selector: 'app-excel-upload',
    imports: [CommonModule],
    templateUrl: './excel-upload.component.html',
    styleUrls: ['./excel-upload.component.scss']
})
export class ExcelUploadComponent {
  private alertService = inject(AlertService);
  @Output() dataLoaded = new EventEmitter<any>();

  async showFormatExcel() {
    const XLSX = await loadXlsx();
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['NOMBRE', 'APELLIDO', 'DORSAL', 'CAPITAN', 'ARQUERO', 'EQUIPO', 'COLOR_CAMISETA'],
      ['MATEO', 'CUNSOLO', 8, 'TRUE', 'FALSE', 'UTN MDP', 'AZUL'],
      ['RONALDO', 'NAZZARIO', 9, 'FALSE', 'FALSE', 'UTN MDP', 'AZUL'],
      ['LIONEL', 'MESSI', 30, 'FALSE', 'FALSE', 'UTN MDP', 'AZUL'],
      ['CRISTIANO', 'RONALDO', 7, 'FALSE', 'FALSE', 'UTN MDP', 'AZUL'],
      ['EMILIANO', 'MARTINEZ', 23, 'FALSE', 'TRUE', 'UTN MDP', 'AZUL'],
      ['RAFEL', 'TORESANI', 6, 'FALSE', 'FALSE', 'UTN MDP', 'AZUL'],
      ['DIEGO', 'MARADONA', 10, 'FALSE', 'FALSE', 'UTN MDP', 'AZUL']
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Formato');
    XLSX.writeFile(workbook, 'formato_jugadores.xlsx');
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (String(file.name.split('.').pop()).toLowerCase() !== 'xlsx') {
      this.alertService.errorAlert('El archivo debe ser de tipo Excel');
      event.target.value = '';
      file.value = '';
      return;
    }

    if (file.size > EXCEL_MAX_BYTES) {
      this.alertService.errorAlert('El archivo pesa m\u00e1s de 2 MB. Dividilo en partes m\u00e1s chicas.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => { this.alertService.errorAlert('No pudimos leer el archivo. Prob\u00e1 de nuevo.'); event.target.value = ''; };
    reader.onload = async (e: any) => {
      const XLSX = await loadXlsx();
      const data = new Uint8Array(e.target.result);
      let parsed;
      try {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        parsed = parseTeamRows(XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[]);
      } catch {
        this.alertService.errorAlert('El archivo no es un Excel v\u00e1lido.');
        event.target.value = '';
        return;
      }
      event.target.value = '';
      if (parsed.errors.length) {
        this.alertService.listAlert('Revis\u00e1 el archivo: no se import\u00f3 nada', parsed.errors);
        return;
      }
      const jsonData = parsed.teams;
      this.dataLoaded.emit(jsonData);
    };
    reader.readAsArrayBuffer(file);
  }
}
