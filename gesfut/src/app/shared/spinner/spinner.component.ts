import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
  template: `
    <div class="spinner-container">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--secondary-color);
      border-left-color: #333;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class SpinnerComponent {
  @Input() public text: string = '';
  constructor() { }
}
