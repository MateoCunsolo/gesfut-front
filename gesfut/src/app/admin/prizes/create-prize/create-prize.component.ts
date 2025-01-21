import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PrizeService } from '../../../core/services/tournament/prize.service';
import { PrizesRequest } from '../../../core/models/prizesRequest';
import { AlertService } from '../../../core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-create-prize',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-prize.component.html',
  styleUrl: './create-prize.component.scss',
})
export class CreatePrizeComponent {
  prizesForm: FormGroup;
  category: string = '';

  constructor(
    private fb: FormBuilder,
    private prizeService: PrizeService,
    private alertService: AlertService
  ) {
    this.prizesForm = this.fb.group({
      prizes: this.fb.array([]),
      code: [''],
    });

    const storedCode = localStorage.getItem('lastTournamentClicked');
    if (storedCode) {
      this.prizesForm.patchValue({ code: storedCode });
    }

    this.prizeService.currentCategory.subscribe({
      next: (category) => {
        this.category = category;
      },
    });
  }

  get prizes(): FormArray {
    return this.prizesForm.get('prizes') as FormArray;
  }

  addPrize() {
    if (this.category !== '') {
      const prizeGroup = this.fb.group({
        type: [this.category, Validators.required],
        description: ['', Validators.required],
        position: [0, [Validators.required, Validators.min(1)]],
      });
      this.prizes.push(prizeGroup);
    }
  }

  removePrize() {
    if (this.prizes.length > 0) {
      this.prizes.removeAt(this.prizes.length - 1);
    }
  }

  submitForm() {
    if (this.prizesForm.valid) {
      const formValue = this.prizesForm.value;
      const prizesRequest: PrizesRequest = {
        prizes: formValue.prizes.map((prize: any) => ({
          type: prize.type,
          description: prize.description,
          position: prize.position,
        })),
        code: formValue.code,
      };

      this.prizeService.sendPrizes(prizesRequest).subscribe({
        next: () => {
          this.alertService.successAlert('Premios agregados!');
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
          this.alertService.errorAlert(err.error.error);
        },
      });
    }
  }
}
