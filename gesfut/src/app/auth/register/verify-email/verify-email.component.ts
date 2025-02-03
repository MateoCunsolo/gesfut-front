import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/manager/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-verify-email',
  imports: [],
  styleUrl: 'verify-email.component.scss',
  template: `
    <section>
      @if (isVerified) {
      <div class="container verify-email">
        <h1>BIENVENIDO A GESFUT</h1>
        <p>
          Gracias por verificar tu correo electrónico. Ahora puedes iniciar
          sesión en tu cuenta.
        </p>
        <div class="ball-container">
          <div class="soccer-ball-emoji">⚽</div>
        </div>
      </div>
      } @else if (!showErrorMessage) {
      <div class="not-verified">
        <div class="loading-spinner">
          <p>Verificando...</p>
          <div class="spinner"></div>
        </div>
      </div>
      }@else {
      <div class="container">
        <h1>¡UPS!</h1>
        <p>
          No se ha podido verificar tu correo electrónico. Por favor, intenta
          nuevamente.
        </p>
        <button (click)="resendEmail()" class="base-button">
          REENVIAR EMAIL
        </button>
      </div>
      }
    </section>
  `,
})
export class VerifyEmailComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);

  protected isVerified: boolean = false;
  protected showErrorMessage: boolean = false;
  protected token: string = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'];
    //esperar 2 segundos para verificar el correo
    setTimeout(() => {
      this.verifyEmail();
    }, 1500);

  }

  verifyEmail(){
    this.authService.verifyEmail(this.token).subscribe({
      next: () => {
        this.isVerified = true;
      },
      error: (error) => {
        this.alertService.errorAlert(error.error.error);
        this.showErrorMessage = true;
      },
    });
  }


  resendEmail(): void {
    this.alertService.inputAlert('Ingresa tu correo electronico').then((email) => {
      if(email.isConfirmed && email.value){
        console.log(email.value);
        this.resendEmailService(email.value);
      }
    }); 
  }

  resendEmailService(email: string): void {
    this.authService.resendEmail(email).subscribe({
      next: () => {
        this.alertService.successAlert('Correo reenviado');
      },
      error: (error) => {
        this.alertService.errorAlert(error.error.error);
      },
    });
  }


}
