import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    imports: [],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent {
    yearActually: number = 0;
    constructor() {
        this.yearActually = new Date().getFullYear();
    }
}
