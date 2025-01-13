import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrizeService } from '../../../core/services/tournament/prize.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-prizes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-prizes.component.html',
  styleUrl: './create-prizes.component.scss'
})
export class CreatePrizesComponent implements OnInit {
  prizesForm!: FormGroup;
  error: string | null = null;
  prizeCounters: { [key: string]: number } = {
    POSITION: 0,
    BEST_GOALKEEPER: 0,
    FAIR_PLAY: 0,
    TOP_SCORER: 0
  };

  constructor(private fb: FormBuilder, private prizeService: PrizeService) {}

  ngOnInit(): void {
    this.prizesForm = this.fb.group({
      prizes: this.fb.array([])
    });
  }

  get prizes(): FormArray {
    return this.prizesForm.get('prizes') as FormArray;
  }

  addPrize(): void {
    const prizeForm = this.fb.group({
      type: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      position: [{ value: 0, disabled: true }, [Validators.required]]
    });
  
    prizeForm.get('type')?.valueChanges.subscribe(selectedType => {
      if (selectedType && this.prizeCounters[selectedType] !== undefined) {
        this.prizeCounters[selectedType]++;
        prizeForm.get('position')?.setValue(this.prizeCounters[selectedType]);
      }
    });
  
    this.prizes.push(prizeForm);
  }
  

  onPrizeTypeChange(prize: AbstractControl, eventTarget: EventTarget | null): void {
  // Verificamos que eventTarget no sea null
  if (eventTarget instanceof HTMLSelectElement) {
    const prizeGroup = prize as FormGroup; // Cast to FormGroup
    const typeControl = prizeGroup.get('type');

    // Aseguramos que 'type' no es null antes de acceder a su valor
    if (typeControl) {
      const newType = eventTarget.value; // Accedemos al 'value' del select
      const oldType = typeControl.value;
      console.log(oldType); // Log original prize type
      
      if (oldType) {
        this.prizeCounters[oldType]--;
      }

      typeControl.setValue(newType);

      if (this.prizeCounters[newType] !== undefined) {
        this.prizeCounters[newType]++;
        prizeGroup.get('position')?.setValue(this.prizeCounters[newType]);
      }
    }
  } else {
    console.error('El evento no contiene un select válido.');
  }
}

  
  
  
  removePrize(index: number): void {
    const removedPrizeType = this.prizes.at(index).get('type')?.value;
    if (removedPrizeType) {
      this.prizeCounters[removedPrizeType]--;
    }
    this.prizes.removeAt(index);
  }

  onSubmit(): void {
    if (this.prizesForm.invalid) {
      this.error = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    const request = this.prizesForm.value;
    this.prizeService.sendPrizes(request).subscribe({
      next: () => {
        this.prizesForm.reset();
        this.prizes.clear();
        this.error = null;
        this.resetCounters();
      },
      error: (err) => {
        this.error = 'Hubo un problema al crear los premios. Inténtelo nuevamente.';
        console.error(err);
      }
    });
  }

  private resetCounters(): void {
    this.prizeCounters = {
      POSITION: 0,
      BEST_GOALKEEPER: 0,
      FAIR_PLAY: 0,
      TOP_SCORER: 0
    };
  }
}
