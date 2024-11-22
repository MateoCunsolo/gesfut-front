import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  successAlert(title:string){
    Swal.fire({
      icon: "success",
      title: title,
      showConfirmButton: false,
      timer: 1500
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
}
