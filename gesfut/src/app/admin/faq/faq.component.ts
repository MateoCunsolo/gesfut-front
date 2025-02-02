import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  private route = inject(Router);

  constructor() { }

  faqs = [
    {
      question: '¿Cómo puedo crear un torneo en GESFUT?',
      answer: 'Debes ir al panel de administración, seleccionar "Crear Torneo", completar los datos requeridos y guardarlo.',
      open: false
    },
    {
      question: '¿Es posible modificar el horario de los partidos?',
      answer: 'Sí, puedes modificar el horario de los encuentros de la próxima fecha desde la administración del torneo.',
      open: false
    },
    {
      question: '¿Cómo se generan los enfrentamientos de un torneo?',
      answer: 'GESFUT genera automáticamente la fecha, la hora y el lugar de los partidos al asignar los equipos a un torneo.',
      open: false
    },
    {
      question: '¿Puedo asignar premios a los jugadores?',
      answer: 'Sí, puedes asignar premios al mejor jugador de la fecha y al mejor arquero desde la sección de premios.',
      open: false
    },
    {
      question: '¿Cómo se calculan las tablas de posiciones?',
      answer: 'Las tablas de posiciones se generan automáticamente a partir de los resultados registrados de los partidos.',
      open: false
    },
    {
      question: '¿Qué navegadores son compatibles con GESFUT?',
      answer: 'GESFUT es compatible con Chrome, Edge y Firefox.',
      open: false
    },
    {
      question: '¿Cómo puede un jugador visualizar los resultados de los partidos?',
      answer: 'Un jugador puede acceder a la sección de resultados a traves del link que le enviara el administrador para ver la informacion del torneo completo.',
      open: false
    },
    {
      question: '¿Cómo contactar con el administrador del torneo?',
      answer: 'Los jugadores pueden contactar con el administrador del torneo a través de la opción disponible en su perfil.',
      open: false
    }
  ];

  toggleFaq(faq: any) {
    faq.open = !faq.open;
  }

  toAdminDashboard() {
    this.route.navigateByUrl('/admin');
  }

}
