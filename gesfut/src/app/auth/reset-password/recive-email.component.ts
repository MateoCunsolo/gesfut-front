import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/manager/auth.service';
import { SessionService } from '../../core/services/manager/session.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { AlertService } from '../../core/services/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recive-email',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: ` 
  <section>
      <div class="form">
        <form [formGroup]="emailForm" (ngSubmit)="onSubmit()">
          <h2 class="title">CAMBIAR CONTRASEÑA</h2>
          <div class="error-message">
            <!-- @if (error) {
            <p class="error">{{ error }}</p>
            } -->
          </div>
          <div class="form-group input-icon">
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Correo electrónico"
            />
            <i class="fas fa-envelope"></i>
          </div>
          <div class="error-message">
            @if(emailForm.controls['email'].getError('required') &&
            emailForm.controls['email'].touched) {
            <p class="error">El correo electrónico es requerido</p>
            } @if(emailForm.controls['email'].getError('email') &&
            emailForm.controls['email'].touched) {
            <p class="error">Ingrese un correo electrónico válido</p>
            }
          </div>

          <button type="submit" class="base-button">ENVIAR</button>
          <a class="link" (click)="toLogin()"
            >Te acordaste la contraseña? Inicia sesion aca!</a
          >
        </form>
      </div>
    </section>
    `,
  styleUrls: ['../login/login.component.scss'],
})
export class ReciveEmailComponent {
  emailForm: FormGroup;
  error: string = '';
  redActive = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private dashboardService: DashboardService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.emailForm.valid) {
        console.log(this.emailForm.value);
        this.alertService.loadingAlert('Enviando correo...');
       this.authService.resetPasswordSendEmail(this.emailForm.value.email).subscribe({
        next:()=>{
            this.alertService.infoAlert('Correo enviado', 'Revisa tu correo para cambiar tu contraseña. Porfavor revisa las carpetas de spam o correo no deseado');
            this.router.navigate(['auth/login']);
        },
        error:()=>{

        },
       })
    } else {
      this.alertService.errorAlert('Formulario inválido');
    }
  }

  toLogin() {
    this.router.navigate(['auth/login']);
  }
}
