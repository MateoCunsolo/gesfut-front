import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { RegisterRequest } from '../../core/models/registerRequest';


const materialModules = [
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatButtonModule
];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [materialModules, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {

  registerForm:FormGroup;


  constructor(private fb:FormBuilder, private authService:AuthService, private cdRef:ChangeDetectorRef){
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    const credentials: RegisterRequest = this.registerForm.value; 
    console.log('Datos enviados al servidor:', credentials)
    this.authService.register(credentials).subscribe({
      next: (response) => {
        alert(response.firstName + ' ' + response.lastName);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }


}
