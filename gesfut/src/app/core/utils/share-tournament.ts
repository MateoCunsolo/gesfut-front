import { AlertService } from '../services/alert.service';

/** Link público del torneo: /<código> (vista de solo lectura, sin login). */
export function tournamentPublicLink(code: string, origin: string = window.location.origin): string {
  return new URL('/' + encodeURIComponent(code), origin).href;
}

/** Muestra el link y lo copia. Sin código no arma un link vacío (antes llevaba a "/"). */
export async function shareTournament(code: string | null | undefined, alerts: AlertService): Promise<void> {
  if (!code) { alerts.errorAlert('Abrí un torneo para compartirlo.'); return; }
  const link = tournamentPublicLink(code);
  const result = await alerts.saherdLinkAlert('Compartir torneo', link);
  if (!result.isConfirmed) return;
  try { await navigator.clipboard.writeText(link); alerts.successAlert('Link copiado'); }
  catch {
    const t = document.createElement('textarea'); t.value = link; document.body.appendChild(t); t.select();
    document.execCommand('copy'); document.body.removeChild(t); alerts.successAlert('Link copiado');
  }
}

/** Link wa.me con texto + link publico (sin codigo corto). */
export function whatsappShareUrl(code: string, name: string = '', origin: string = window.location.origin): string {
  const text = (name ? 'Seguí el torneo ' + name : 'Seguí el torneo') + ' en Gesfut: ' + tournamentPublicLink(code, origin);
  return 'https://wa.me/?text=' + encodeURIComponent(text);
}
