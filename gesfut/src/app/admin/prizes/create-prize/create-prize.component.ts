import { httpErrorMessage } from '../../../core/utils/http-error';
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
import { currentTournamentCode } from '../../../core/utils/route-code';

@Component({
    selector: 'app-create-prize',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './create-prize.component.html',
    styleUrl: './create-prize.component.scss'
})
export class CreatePrizeComponent {
  saving = false;
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

    // Loop 1 22/10: el código sale de la URL del torneo abierto (antes localStorage: vacío o de otro torneo).
    const storedCode = currentTournamentCode();
    if (storedCode) {
      this.prizesForm.patchValue({ code: storedCode });
    }

    this.prizeService.currentCategory.subscribe({
      next: (category) => {
        this.category = category;
        this.addPrize(1);
        this.addPrize(2);
        this.addPrize(3);
      },
    });
  }

  back() {
    this.prizeService.currentView.next('list');
  }

  get prizes(): FormArray {
    return this.prizesForm.get('prizes') as FormArray;
  }

  addPrize(number: number) {
    if (this.category !== '') {
      const prizeGroup = this.fb.group({
        type: [this.category, Validators.required],
        description: ['', Validators.required],
        position: [number, [Validators.required, Validators.min(1)]],
      });
      this.prizes.push(prizeGroup);
    }
  }

  removePrize(index: number) {
    if (this.prizes.length > 0) {
      this.prizes.removeAt(index);
    }
  }

  submitForm() {
    if (this.saving) return; // Loop 9: doble toque mandaba los premios dos veces

    if (this.validateDuplicatedPosition()) {
      this.alertService.errorAlert("Hay puestos duplicados. Corrija antes de enviar.");
      return;
    }

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

      this.saving = true;
      this.prizeService.sendPrizes(prizesRequest).subscribe({
        next: () => {
          this.saving = false;
          this.alertService.successAlert('Premios agregados!');
        },
        error: (err: HttpErrorResponse) => {
          this.saving = false;
          this.alertService.errorAlert(httpErrorMessage(err, 'No se pudieron guardar los premios.') + ' Lo que escribiste sigue en pantalla.');
        },
      });
    }else{
      this.alertService.errorAlert("Completá todos los campos.");
    }
  }

  validateDuplicatedPosition(): boolean {
    const positions = this.prizes.controls.map(prize => prize.get('position')?.value);
    const uniquePositions = new Set(positions);
    return positions.length !== uniquePositions.size;
  }


}
