import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Tema 7 (5/11): paginas publicas /terminos y /privacidad. El texto definitivo esta en revision legal. */
@Component({
  selector: 'app-legal-page',
  template: `
    <section class="legal">
      <article class="legal-card">
        <h1 class="title">{{ title }}</h1>
        <p class="intro">Texto en revisi&oacute;n legal</p>
      </article>
    </section>
  `,
  styles: [`
    .legal{display:flex;justify-content:center;padding:40px 16px;min-height:70dvh;background:var(--bg-color);}
    .legal-card{width:100%;max-width:720px;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:24px;}
    .title{font-size:2.6rem;color:var(--ink);margin-bottom:8px;}
    .intro{font-size:1.6rem;color:var(--muted);margin:0;}
  `],
})
export class LegalPageComponent {
  readonly title: string = inject(ActivatedRoute).snapshot.data['title'] ?? '';
}
