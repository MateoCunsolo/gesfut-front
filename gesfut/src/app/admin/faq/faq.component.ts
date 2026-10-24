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
      answer: 'Sí. En el calendario del torneo podés cambiar el día y la hora de un partido, o reprogramar todos los de una fecha.',
      open: false
    },
    {
      question: '¿Cómo se generan los enfrentamientos de un torneo?',
      answer: 'Al generar el calendario, GESFUT arma los cruces de todas las fechas (todos contra todos). Si elegís fecha de inicio, duración de cada partido y días entre fechas, también asigna el día y la hora de cada partido; la cancha la cargás vos en cada partido. Con cantidad impar de equipos, en cada fecha uno queda libre. Al terminar la fase regular podés generar playoffs o tocar «Finalizar torneo» para cerrarlo con la tabla actual.',
      open: false
    },
    {
      question: '¿Puedo asignar premios a los jugadores?',
      answer: 'Sí, podés asignar un MVP por partido y un MVP por jornada.',
      open: false
    },
    {
      question: '¿Cómo se calculan las tablas de posiciones?',
      answer: 'Las tablas de posiciones se generan automáticamente a partir de los resultados registrados de los partidos. Si dos equipos tienen los mismos puntos, se ordenan por diferencia de goles.',
      open: false
    },
    {
      question: '¿Qué navegadores son compatibles con GESFUT?',
      answer: 'GESFUT es compatible con Chrome y Edge.',
      open: false
    },
    {
      question: '¿Cómo puedo compartir un torneo?',
      answer: 'Dentro del torneo, tocá «Compartir torneo» (al lado del nombre, o en tu menú de usuario). Se copia un link público con el código del torneo: quien lo abra ve calendario, tabla y resultados sin necesidad de cuenta y sin poder modificar nada.',
      open: false
    },
    {
      question: '¿Cómo puede un jugador visualizar los resultados de los partidos?',
      answer: 'Un jugador puede acceder a la sección de resultados a través del link que le envíe el administrador para ver la información del torneo completo.',
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
