import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
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

  loadingAlert(title: string) {
    Swal.fire({
      title: title,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  confirmAlert(title: string, text: string, confirmButtonText: string) {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText
    });
  }


}
