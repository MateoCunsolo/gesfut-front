/** Mensajes de error de auth en es-AR, sin dependencias de Angular (se testean con node). */
export function authErrorMessage(error: any, fallback: string): string {
  if (!error || error.status === 0) return 'No pudimos conectar con el servidor. Probá de nuevo en un rato.';
  // 5xx: nunca mostrar el texto interno del backend.
  if (error.status >= 500) return 'Tuvimos un problema en el servidor. Probá de nuevo en un rato.';
  const body = error.error;
  let msg = '';
  if (body && typeof body === 'object') {
    msg = body.error || body.message || '';
    if (!msg && body.errors && typeof body.errors === 'object') {
      msg = Object.values(body.errors).filter(v => typeof v === 'string').join('. ');
    }
  } else if (typeof body === 'string' && body.trim() && !body.trim().startsWith('<') && body.length < 300) {
    msg = body.trim();
  }
  if (!msg || msg === 'Invalid CORS request' || /^(Unauthorized|Forbidden|Bad Request)$/i.test(msg)) return fallback;
  return msg;
}

export const RESEND_NEUTRAL = 'Si el mail existe y falta verificarlo, te lo mandamos. Revis\u00e1 tu casilla (y spam).';
export const RESEND_TOO_MANY = 'Probaste muchas veces. Esper\u00e1 un rato e intent\u00e1 de nuevo.';
/** Mensaje neutral del reenvio: el del servidor si vino, si no el mismo texto fijo. */
export function resendMessage(body: any): string {
  return body && typeof body.message === 'string' && body.message.trim() ? body.message : RESEND_NEUTRAL;
}

/** Aviso en el login despues de crear la cuenta (?registered=1). */
export function isRegisteredNotice(search: string): boolean {
  return new URLSearchParams(search).get('registered') === '1';
}

// TODO(Mateo): volver al texto de verificación por mail cuando se reactive gesfut.mail.verificacion.enabled en el backend
// Para reactivar: MAIL_VERIFICATION_ENABLED = true y volver a estos textos (van en comentario para que no queden en el bundle):
//   REGISTERED_ALERT  = 'Cuenta creada. Te enviamos un mail para verificarla.'
//   REGISTERED_NOTICE = 'Te enviamos un mail para verificar tu cuenta. Verificalo y despu\u00e9s inici\u00e1 sesi\u00f3n.'
export const MAIL_VERIFICATION_ENABLED = false;
/** Alerta al terminar el registro. */
export const REGISTERED_ALERT = 'Cuenta creada. Ya pod\u00e9s iniciar sesi\u00f3n.';
/** Aviso en el login con ?registered=1. */
export const REGISTERED_NOTICE = 'Cuenta creada. Ya pod\u00e9s iniciar sesi\u00f3n con tu mail y contrase\u00f1a.';
/** Mostrar 'Reenviar mail' justo despues de registrarse (solo si se manda mail). */
export const SHOW_RESEND_AFTER_REGISTER: boolean = MAIL_VERIFICATION_ENABLED;
