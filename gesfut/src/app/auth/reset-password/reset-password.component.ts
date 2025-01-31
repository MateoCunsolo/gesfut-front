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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password2',
  standalone: true,
  imports: [ReactiveFormsModule],
  styleUrl: '../login/login.component.scss',
  template: `
    <section>
      <div class="form">
        <form [formGroup]="resetPassForm" (ngSubmit)="onSubmit()">
          <h2 class="title">CAMBIAR CONTRASEÑA</h2>
          <div class="error-message">
            <!-- @if (error) {
            <p class="error">{{ error }}</p>
            } -->
          </div>

          @if(isFromSession) {
          <div class="form-group input-icon">
            <input
              id="oldPassword"
              type="password"
              formControlName="oldPassword"
              placeholder="Contraseña actual"
            />
            <i class="fas fa-lock"></i>
          </div>
          <div class="error-message">
            @if(resetPassForm.controls['oldPassword'].getError('required') &&
            resetPassForm.controls['oldPassword'].touched) {
            <p class="error">La contraseña es requerida</p>
            } @if(resetPassForm.controls['oldPassword'].getError('minlength') &&
            resetPassForm.controls['oldPassword'].touched) {
            <p class="error">La contraseña debe tener al menos 8 caracteres</p>
            }
          </div>
          }

          <div class="form-group input-icon">
            <input
              id="password1"
              type="password"
              formControlName="password1"
              placeholder="Nueva contraseña"
            />
            <i class="fas fa-lock"></i>
          </div>
          <div class="error-message">
            @if(resetPassForm.controls['password1'].getError('required') &&
            resetPassForm.controls['password1'].touched) {
            <p class="error">La contraseña es requerida</p>
            } @if(resetPassForm.controls['password1'].getError('minlength') &&
            resetPassForm.controls['password1'].touched) {
            <p class="error">La contraseña debe tener al menos 8 caracteres</p>
            }
          </div>

          <div class="form-group input-icon">
            <input
              id="password2"
              type="password"
              formControlName="password2"
              placeholder="Repite la nueva contraseña"
            />
            <i class="fas fa-lock"></i>
          </div>

          <div class="error-message">
            @if(resetPassForm.controls['password2'].getError('required') &&
            resetPassForm.controls['password2'].touched) {
            <p class="error">La contraseña es requerida</p>
            } @if(resetPassForm.controls['password2'].getError('minlength') &&
            resetPassForm.controls['password2'].touched) {
            <p class="error">La contraseña debe tener al menos 8 caracteres</p>
            }
          </div>

          <button type="submit" class="base-button">ENVIAR</button>
          @if(!isFromSession) {
            <a class="link" (click)="toLogin()">Te acordaste la contraseña? Inicia sesion aca!</a>
          }@else{
            <a class="link" (click)="back()">Ir al inicio</a>
          }
         
        </form>
      </div>
    </section>
  `,
})
export class ResetPasswordComponent {
  resetPassForm: FormGroup;
  error: string = '';
  redActive = false;
  protected token: string = '';
  protected isFromSession: boolean = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sessionService: SessionService,
    private dashboardService: DashboardService,
    private alertService: AlertService,
    private router: Router,
    private activateRoute: ActivatedRoute
  ) {
    this.resetPassForm = this.fb.group({
      password1: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', [Validators.required, Validators.minLength(8)]],
      oldPassword: [''],
    });
  }

  ngOnInit() {
    this.activateRoute.params.subscribe((params) => {
      if (params['token']) {
        this.validateToken(params['token']);
      } else if (sessionStorage.getItem('token')) {
        this.isFromSession = true;
        this.validateToken(sessionStorage.getItem('token') || '');
      } else {
        this.router.navigate(['auth/login']);
      }
    });
  }

  validateToken(token: string) {
    this.sessionService.validateToken(token).subscribe({
      next: (response: boolean) => {
        if (!response) {
          this.router.navigate(['auth/login']);
        } else {
          this.token = token;
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  onSubmit() {
    if (this.resetPassForm.valid) {
      if(this.resetPassForm.value.password1 !== this.resetPassForm.value.password2){
        this.alertService.errorAlert('Las contraseñas no coinciden');
        return;
      }
      if (this.isFromSession) {
        this.changePassword();
      } else {
        this.changePasswordWithToken();
      }
    }
  }

  changePassword() {
    let oldPassword = this.resetPassForm.value.oldPassword;
    let newPassword = this.resetPassForm.value.password1;
    if(oldPassword === newPassword){
      this.alertService.errorAlert('La nueva contraseña no puede ser igual a la anterior');
      return;
    }

    this.alertService.loadingAlert('Cambiando contraseña...');
    this.authService.changePasswordWithOldPassword(oldPassword, newPassword).subscribe({
      next: () => {
        this.alertService.infoAlert('Contraseña cambiada', 'Cuando inicies sesión la próxima vez, utiliza tu nueva contraseña');
        this.router.navigate(['admin']);
      },
      error: (error) => {
        this.alertService.errorAlert(error.error.error);
      },
    });
      
  }

  changePasswordWithToken() {
    this.authService.resetPasswordSendNewPassword(this.resetPassForm.value.password1,this.token).subscribe({
        next: () => {
          this.alertService.infoAlert('Contraseña cambiada','Inicia sesión con tu nueva contraseña');
          this.router.navigate(['auth/login']);
        },
        error: () => {
          this.alertService.errorAlert('Error al cambiar la contraseña');
        },
      });
  }

  toLogin() {
    this.router.navigate(['auth/login']);
  }

  back() {
    this.router.navigate(['admin']);
  }

}
