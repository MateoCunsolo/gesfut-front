import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Paginas publicas /terminos y /privacidad. Terminos beta aprobados. */
@Component({
  selector: 'app-legal-page',
  template: `
    <section class="legal">
      <article class="legal-card">
        <h1 class="title">{{ title }}</h1>
        <h2 class="beta">Gesfut está en beta 🧪</h2>
        <p>Gesfut es un proyecto en desarrollo y por ahora es gratis. Al usarlo aceptás que:</p>
        <ul>
          <li>La app se ofrece "tal cual está", sin garantías. Puede tener errores, cortes o perder datos, así que guardá por tu lado lo que te importe.</li>
          <li>Gesfut no se hace responsable por daños, pérdidas ni problemas que surjan del uso de la app, de los torneos, de los partidos ni de lo que pase entre los usuarios.</li>
          <li>Podemos cambiar, pausar o cerrar la app (o cualquier función) en cualquier momento y sin aviso.</li>
          <li>Cada organizador es responsable de su torneo, de los datos que carga y de tener permiso de los jugadores para cargarlos.</li>
          <li>No se permite usar Gesfut para nada ilegal, ofensivo ni para molestar a otros. Podemos dar de baja cuentas que lo hagan.</li>
          <li>Tus datos: guardamos solo lo necesario para que la app funcione (nombre, mail y datos del torneo). No los vendemos ni los compartimos. Si querés que los borremos, escribinos y lo hacemos.</li>
          <li>Estos términos pueden cambiar. Si seguís usando la app, aceptás la versión vigente.</li>
        </ul>
        <p>Todos los derechos sobre Gesfut, su marca y su contenido están reservados.</p>
        <p>Contacto: <a [href]="'mailto:' + contactEmail">{{ contactEmail }}</a></p>
      </article>
    </section>
  `,
  styles: [`
    .legal{display:flex;justify-content:center;padding:40px 16px;min-height:70dvh;background:var(--bg-color);}
    .legal-card{width:100%;max-width:720px;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:24px;}
    .title{font-size:2.6rem;color:var(--ink);margin-bottom:8px;}
    .beta{font-size:1.8rem;color:var(--ink);margin:16px 0 12px;}
    .legal-card p,.legal-card li{font-size:1.6rem;color:var(--muted);line-height:1.45;margin:0 0 12px;}
    .legal-card ul{margin:0 0 12px;padding-left:1.2em;}
    .legal-card a{color:var(--primary-color);}
  `],
})
export class LegalPageComponent {
  readonly title: string = inject(ActivatedRoute).snapshot.data['title'] ?? '';
  /** El @ del mail se interpola: en el template Angular lo lee como bloque. */
  readonly contactEmail = 'contacto@gesfut.site';
}
