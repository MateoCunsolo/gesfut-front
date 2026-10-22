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

@Injectable({
  providedIn: 'root',
})
export class AlertService {

  constructor() { }

  successAlert(title: string) {
    Swal.fire({
      icon: "success",
      title: title,
      showConfirmButton: false,
      timer: 1600,
      scrollbarPadding: true,
    });
  }

  successAlertTop(title: string) {
    Swal.fire({
      toast: true,
      icon: 'success',
      title: title,
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
    Swal.fire({
      toast: true,
      icon: 'error',
      title: err,
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
      title: title,
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
      title: title,
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
      title: title,
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
      title: title,
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
      title: title,
      text: text,
      scrollbarPadding: false,
    });
  }


  selectOptionsAlert(title: string, options: string[], cancelText: string) {
    return Swal.fire({
      title: title,
      input: 'select',
      text: 'Se mostrarán aquellos jugadores que hayan sido elegidos como MVP en sus partidos.',
      inputOptions: options,
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
      title: title,
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

  updateTextAreaAlert(title:String, currentValue: string = ''): Promise<string | null> {
    return Swal.fire({
      title: title,
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
      title: title,
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
      title: title,
      html: `
        <div class="alert-summary">
          <p><strong>Equipos:</strong> ${teams.map(team => team.name).join(', ')}</p>
          <p><strong>Fecha de inicio:</strong> ${date ? date : "Sin fecha"}</p>
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

  saherdLinkAlert(title: string, link: string) {
    return Swal.fire({
      title: title,
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
