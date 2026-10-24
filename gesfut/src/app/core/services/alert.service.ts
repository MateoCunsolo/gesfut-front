import { Injectable } from '@angular/core';
import type { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
// Auditoria 22/10 (#15): sweetalert2 se carga recien al primer aviso, fuera del bundle inicial. Misma API y mismos estilos.
const loadSwal = () => import('sweetalert2').then(m => m.default);
const Swal = {
  fire: (options: SweetAlertOptions): Promise<SweetAlertResult<any>> => loadSwal().then(S => S.fire(options)),
  close: (): void => { loadSwal().then(S => S.close()); },
  showLoading: (): void => { loadSwal().then(S => S.showLoading()); },
  showValidationMessage: (message: string): void => { loadSwal().then(S => S.showValidationMessage(message)); },
};
import { ParticipantResponse } from '../models/tournamentResponse';
import { Observable, Subject } from 'rxjs';
import { TeamResponse } from '../models/teamResponse';

/** Loop 4: SweetAlert2 interpreta title/html/opciones como HTML; los datos del usuario se escapan. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {

  constructor() { }

  successAlert(title: string) {
    Swal.fire({
      icon: "success",
      titleText: title,
      showConfirmButton: false,
      timer: 1600,
      scrollbarPadding: true,
    });
  }

  successAlertTop(title: string) {
    Swal.fire({
      toast: true,
      icon: 'success',
      titleText: title,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      scrollbarPadding: true,
      customClass: {
        container: 'container-toast',
        icon: 'toast-icon',
        title: 'toast-title'
      },
    });
  }

  errorAlert(err: string) {
    // Nunca un toast vacio: si no vino mensaje, uno generico.
    const text = typeof err === 'string' && err.trim() ? err : 'Algo sali\u00f3 mal. Prob\u00e1 de nuevo.';
    Swal.fire({
      toast: true,
      icon: 'error',
      titleText: text,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      scrollbarPadding: false,
      customClass: {
        container: 'container-toast',
        icon: 'toast-icon',
        title: 'toast-title'
      },
    });
  }

  infoAlertTop(title: string) {
    Swal.fire({
      toast: true,
      icon: 'info',
      titleText: title,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      scrollbarPadding: false,
      customClass: {
        container: 'container-toast',
        icon: 'toast-icon',
        title: 'toast-title'
      },
    });
  }

  loadingAlert(title: string) {
    Swal.fire({
      titleText: title,
      scrollbarPadding: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  closeLoadingAlert() {
    Swal.close();
  }


  confirmAlert(title: string, text: string, confirmButtonText: string) {
    return Swal.fire({
      titleText: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary-color)',
      cancelButtonColor: 'var(--error-color)',
      cancelButtonText: 'Cancelar',
      confirmButtonText: confirmButtonText,
      scrollbarPadding: false,
    });
  }

  twoOptionsAlert(title: string, text: string, firstOption: string, secondOption: string) {
    return Swal.fire({
      titleText: title,
      text: text,
      icon: 'warning',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonColor: 'var(--primary-color)',
      cancelButtonColor: 'var(--primary-color)',
      confirmButtonText: firstOption,
      cancelButtonText: secondOption,
      scrollbarPadding: false,
    });

  }

  infoAlert(title: string, text: string) {
    Swal.fire({
      icon: 'info',
      titleText: title,
      text: text,
      scrollbarPadding: false,
    });
  }


  /** Editar jugador: nombre, apellido, dorsal y DNI opcional. Devuelve los datos o null si se cancela. */
  editPlayerAlert(current: { name: string; lastName: string; number: number; dni?: string | null }): Promise<{ name: string; lastName: string; number: number; dni: string | null } | null> {
    const v = (x: any) => escapeHtml(String(x ?? ''));
    return Swal.fire({
      title: 'Editar jugador',
      customClass: { htmlContainer: 'swal-form' },
      html: `
        <label class="swal2-input-label" for="ep-name">Nombre</label><input id="ep-name" class="swal2-input" maxlength="50" value="${v(current.name)}">
        <label class="swal2-input-label" for="ep-last">Apellido</label><input id="ep-last" class="swal2-input" maxlength="50" value="${v(current.lastName)}">
        <label class="swal2-input-label" for="ep-number">Dorsal</label><input id="ep-number" type="number" min="0" max="99" class="swal2-input" value="${v(current.number)}">
        <label class="swal2-input-label" for="ep-dni">DNI (opcional)</label><input id="ep-dni" class="swal2-input" inputmode="numeric" maxlength="12" placeholder="Ej: 30123456" value="${v(current.dni)}">
        <p class="swal2-html-container" style="font-size:1.2rem">Los goles y tarjetas ya cargados siguen siendo de este jugador.</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      scrollbarPadding: false,
      preConfirm: () => {
        const get = (id: string) => (document.getElementById(id) as HTMLInputElement).value.trim();
        const name = get('ep-name'), lastName = get('ep-last'), numberRaw = get('ep-number'), dniRaw = get('ep-dni');
        if (name.length < 3 || lastName.length < 3) { Swal.showValidationMessage('Nombre y apellido deben tener entre 3 y 50 caracteres.'); return false; }
        const number = Number(numberRaw);
        if (numberRaw === '' || !Number.isInteger(number) || number < 0 || number > 99) { Swal.showValidationMessage('El dorsal debe estar entre 0 y 99.'); return false; }
        const dni = dniRaw.replace(/\D/g, '');
        if (dni && (dni.length < 7 || dni.length > 8)) { Swal.showValidationMessage('El DNI debe tener 7 u 8 dígitos.'); return false; }
        return { name, lastName, number, dni: dni || null };
      }
    }).then(r => r.isConfirmed ? r.value : null);
  }

  /** Respuesta 3: elegir un equipo de una lista. Devuelve el índice elegido o null. */
  pickOneAlert(title: string, text: string, options: string[], confirmText: string): Promise<number | null> {
    return Swal.fire({
      titleText: title,
      text,
      input: 'select',
      inputOptions: options.map(escapeHtml),
      inputPlaceholder: 'Elegí un equipo',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      scrollbarPadding: false,
      inputValidator: (value) => (value === '' || value === null || value === undefined) ? 'Elegí un equipo' : null
    }).then(r => r.isConfirmed ? Number(r.value) : null);
  }

  selectOptionsAlert(title: string, options: string[], cancelText: string) {
    return Swal.fire({
      titleText: title,
      input: 'select',
      text: 'Se mostrarán aquellos jugadores que hayan sido elegidos como MVP en sus partidos.',
      inputOptions: options.map(escapeHtml),
      showCancelButton: true,
      confirmButtonText: 'Cerrar fecha',
      cancelButtonText: cancelText,
      scrollbarPadding: false,
      inputValidator: (value) => {
        if (!value) {
          return 'Debes seleccionar una opción';
        }
        return null;
      }
    });
  }



  inputAlert(title: string) {
    return Swal.fire({
      titleText: title,
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      scrollbarPadding: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Debes ingresar un valor';
        }
        return null;
      }
    });
  }

  /** Revisión crítica #6: fecha y hora de la ronda de playoffs. Devuelve null si se cancela. */
  playoffScheduleAlert(roundName: string): Promise<{ startDate: string; minutesPerMatch: number } | null> {
    return Swal.fire({
      title: `Programar ${roundName}`,
      html: `
        <label class="swal2-input-label" for="po-date">Fecha y hora del primer partido</label>
        <input id="po-date" type="datetime-local" class="swal2-input">
        <label class="swal2-input-label" for="po-minutes">Minutos entre partidos</label>
        <input id="po-minutes" type="number" min="0" max="600" step="5" value="60" class="swal2-input">
      `,
      showCancelButton: true,
      confirmButtonText: 'Generar',
      cancelButtonText: 'Cancelar',
      scrollbarPadding: false,
      preConfirm: () => {
        const startDate = (document.getElementById('po-date') as HTMLInputElement).value;
        const minutes = Number((document.getElementById('po-minutes') as HTMLInputElement).value);
        if (!startDate) { Swal.showValidationMessage('Elegí la fecha y hora de la ronda.'); return false; }
        if (new Date(startDate).getTime() < Date.now()) { Swal.showValidationMessage('Elegí una fecha y hora futura.'); return false; }
        if (!Number.isFinite(minutes) || minutes < 0 || minutes > 600) { Swal.showValidationMessage('Los minutos deben estar entre 0 y 600.'); return false; }
        return { startDate: startDate.length === 16 ? `${startDate}:00` : startDate, minutesPerMatch: minutes };
      }
    }).then(r => r.isConfirmed ? r.value : null);
  }

  EditDateAndDescriptionMatchAlert() {
    return Swal.fire({
      title: 'Configuración de Partido',
      html: `

      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      focusCancel: true,
      scrollbarPadding: false,
      preConfirm: () => {
        const date = (document.getElementById('date') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLInputElement).value;
        const hour = (document.getElementById('hour') as HTMLInputElement).value;

        if (!date || !description || !hour) {
          Swal.showValidationMessage('¡Debes completar todos los campos!');
        }

        return { date, description, hour };
      }
    });
  }

  updateTextAreaAlert(title:string, currentValue: string = ''): Promise<string | null> {
    return Swal.fire({
      titleText: title,
      input: 'textarea',
      inputValue: currentValue,
      inputPlaceholder: 'Escribe la nueva descripción...',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      scrollbarPadding: false,
      inputValidator: (value) => {
        if (!value) {
          return '¡La descripción no puede estar vacía!';
        }
        return undefined;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        return result.value;
      } else {
        return null;
      }
    });
  }

  
  updateNumberInputAlert(title: string): Promise<number | null> {
    return Swal.fire({
      titleText: title,
      input: 'number',
      inputPlaceholder: 'Ingresa un número...',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      scrollbarPadding: false,
      inputAttributes: {
        min: '1', // Puedes cambiar esto para restringir valores negativos
        step: '1' // Define si se permiten decimales (cambiar a '0.01' para permitir decimales)
      },
      inputValidator: (value) => {
        if (!value) {
          return '¡El campo no puede estar vacío!';
        }
        if (Number(value) < 1) {
          return '¡El valor debe ser mayor a 0!';
        }

        return undefined;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        return Number(result.value); // Convierte el resultado a número antes de devolverlo
      } else {
        return null;
      }
    });
  }
  
  infoAlertTournament(title: string, teams: TeamResponse[], date: string, minutes: number, days: number) {
    return Swal.fire({
      icon: 'info',
      titleText: title,
      html: `
        <div class="alert-summary">
          <p><strong>Equipos:</strong> ${teams.map(team => escapeHtml(team.name)).join(', ')}</p>
          <p><strong>Fecha de inicio:</strong> ${date ? escapeHtml(date) : "Sin fecha"}</p>
          <p><strong>Minutos por partido:</strong> ${minutes ? minutes : "Sin duración"}</p>
          <p><strong>Días entre jornadas:</strong> ${days ? days : "Sin días"}</p>
          <small>También podés programar los horarios desde Partidos después de iniciar el torneo.</small>
        </div>`,
      confirmButtonText: 'Inicializar',
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'Editar',
      scrollbarPadding: false,
      customClass: {
        confirmButton: 'base-button',
        cancelButton: 'back-button',
      },
    });
  }

  /** Loop 10: lista de problemas (por ejemplo, filas invalidas del Excel); el texto se escapa. */
  listAlert(title: string, lines: string[], max = 8) {
    const shown = lines.slice(0, max).map(l => '<li>' + escapeHtml(l) + '</li>').join('');
    const more = lines.length > max ? '<p>Y ' + (lines.length - max) + ' m\u00e1s.</p>' : '';
    return Swal.fire({ icon: 'error', titleText: title, html: '<ul style="text-align:left">' + shown + '</ul>' + more, confirmButtonText: 'Entendido', scrollbarPadding: false, customClass: { confirmButton: 'base-button' } });
  }

  saherdLinkAlert(title: string, link: string) {
    return Swal.fire({
      titleText: title,
      input: 'text',
      inputValue: link,
      inputAttributes: { readonly: 'true', 'aria-label': 'Enlace del torneo' },
      confirmButtonText: 'Copiar enlace',
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cerrar',
      scrollbarPadding: false,
      customClass: {
        confirmButton: 'base-button',
      },
    });
  }
  
  

}
