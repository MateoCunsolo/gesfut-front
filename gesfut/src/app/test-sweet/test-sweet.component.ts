import { Component } from '@angular/core';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-test-sweet',
  standalone: true,
  imports: [SweetAlert2Module],
  templateUrl: './test-sweet.component.html',
  styleUrl: './test-sweet.component.scss'
})
export class TestSweetComponent {



  doClick() {
    Swal.fire({
      title: 'Custom Style Alert',
      text: 'This is a customized alert',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'custom-popup', // Estilo del contenedor principal
        title: 'custom-title', // Estilo del título
        confirmButton: 'a', // Estilo del botón de confirmación
        cancelButton: 'custom-cancel-button', // Estilo del botón de cancelación
      }
    });
  }
  


}
