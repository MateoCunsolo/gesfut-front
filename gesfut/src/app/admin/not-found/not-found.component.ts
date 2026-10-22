import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Auditoria 22/10: ruta admin inexistente. Antes redirigia en silencio al panel. */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="not-found" role="alert">
      <h1>Página no encontrada</h1>
      <p>El enlace está incompleto o la página ya no existe.</p>
      <a class="base-button" routerLink="/admin">Ir al panel central</a>
    </section>
  `,
  styles: [`.not-found{max-width:560px;margin:32px auto;padding:0 16px;display:grid;gap:12px;justify-items:start}.not-found h1{font-size:2.2rem;margin:0}.not-found a{display:inline-flex;align-items:center;min-height:44px;padding:0 20px;text-decoration:none}`],
})
export class NotFoundComponent {}
