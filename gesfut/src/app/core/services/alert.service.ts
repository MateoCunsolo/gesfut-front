import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { ParticipantResponse } from '../models/tournamentResponse';
import { Observable, Subject } from 'rxjs';

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
      timer: 1600
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
      width: 'auto',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary-color)',
      cancelButtonColor: 'var(--error-color)',
      cancelButtonText: 'CANCELAR',
      confirmButtonText: confirmButtonText.toLocaleUpperCase()
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
      confirmButtonText: firstOption.toLocaleUpperCase(),
      cancelButtonText: secondOption.toLocaleUpperCase()
    });

  }

  infoAlert(title: string, text: string) {
    Swal.fire({
      icon: 'info',
      title: title,
      text: text
    });
  }


  selectOptionsAlert(title: string, options: string[], cancelText: string) {
    return Swal.fire({
      title: title,
      input: 'select',
      text: 'Se mostrarán aquellos jugadores que hayan sido elegidos como MVP en sus partidos.',
      inputOptions: options,
      showCancelButton: true,
      confirmButtonText: 'CERRAR FECHA',
      cancelButtonText: cancelText,
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

  updateTextAreaAlert(title:String): Promise<string | null> {
    return Swal.fire({
      title: title,
      input: 'textarea',
      inputPlaceholder: 'Escribe la nueva descripción...',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
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
  

}
