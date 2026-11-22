/** Mensajes de error de auth en es-AR, sin dependencias de Angular (se testean con node). */

export const NETWORK_ERROR = 'No pudimos conectarnos. Revis\u00e1 tu internet y prob\u00e1 de nuevo.';
export const SERVER_ERROR = 'Tuvimos un problema de nuestro lado. Prob\u00e1 de nuevo en unos minutos.';
export const TOO_MANY_ATTEMPTS = 'Hiciste muchos intentos seguidos. Esper\u00e1 un minuto y prob\u00e1 de nuevo.';
export const SESSION_EXPIRED = 'Tu sesi\u00f3n venci\u00f3. Volv\u00e9 a ingresar para seguir.';

export const LOGIN_BAD_CREDENTIALS = 'El correo o la contrase\u00f1a no coinciden. Revisalos y prob\u00e1 de nuevo.';
export const LOGIN_EMAIL_REQUIRED = 'Ingres\u00e1 tu correo.';
export const LOGIN_PASSWORD_REQUIRED = 'Ingres\u00e1 tu contrase\u00f1a.';
export const LOGIN_EMAIL_INVALID = 'Revis\u00e1 el correo: parece que falta algo.';

export const SIGNUP_EMAIL_TAKEN = 'Ya hay una cuenta con este correo. Prob\u00e1 ingresar o recuperar tu contrase\u00f1a.';
export const SIGNUP_EMAIL_INVALID = 'Revis\u00e1 el correo: parece que falta algo (por ejemplo, nombre@mail.com).';
export const SIGNUP_PASSWORD_SHORT = 'Us\u00e1 al menos 8 caracteres.';
export const SIGNUP_TERMS = 'Para crear la cuenta ten\u00e9s que aceptar los t\u00e9rminos y la pol\u00edtica de privacidad.';
export const SIGNUP_NAME_REQUIRED = 'Ingres\u00e1 tu nombre.';
export const SIGNUP_LAST_NAME_REQUIRED = 'Ingres\u00e1 tu apellido.';
export const SIGNUP_GENERIC_CONFLICT = 'No pudimos crear la cuenta porque alg\u00fan dato ya est\u00e1 en uso. Revis\u00e1 los datos o prob\u00e1 con otro correo.';
export const SIGNUP_SUCCESS = '\u00a1Listo! Tu cuenta est\u00e1 creada. Ya pod\u00e9s armar tu torneo.';

export function authErrorMessage(error: any, fallback: string): string {
  if (!error || error.status === 0) return NETWORK_ERROR;
  // 5xx: nunca mostrar el texto interno del backend.
  if (error.status >= 500) return SERVER_ERROR;
  if (error.status === 429) return TOO_MANY_ATTEMPTS;
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
export const RESEND_TOO_MANY = 'Pediste demasiados reenv\u00edos. Prob\u00e1 de nuevo m\u00e1s tarde.';
/** 429 de resend-verification: usa Retry-After (segundos o fecha HTTP) y pasa a minutos; si no hay header, el texto sin minutos. */
export function retryAfterMinutes(retryAfter?: string | number | null): number | null {
  if (retryAfter == null || retryAfter === '') return null;
  const raw = String(retryAfter).trim();
  if (/^\d+$/.test(raw)) {
    const seconds = Number(raw);
    if (!Number.isFinite(seconds) || seconds <= 0) return null;
    return Math.max(1, Math.ceil(seconds / 60));
  }
  const ms = Date.parse(raw);
  if (!Number.isFinite(ms)) return null;
  const seconds = Math.ceil((ms - Date.now()) / 1000);
  if (seconds <= 0) return null;
  return Math.max(1, Math.ceil(seconds / 60));
}
export function resendTooManyMessage(retryAfter?: string | number | null): string {
  const minutes = retryAfterMinutes(retryAfter);
  if (minutes == null) return RESEND_TOO_MANY;
  const unidad = minutes === 1 ? 'minuto' : 'minutos';
  return 'Pediste demasiados reenv\u00edos. Prob\u00e1 de nuevo en ' + minutes + ' ' + unidad + '.';
}
export function retryAfterFromError(error: any): string | null {
  const headers = error && error.headers;
  if (!headers || typeof headers.get !== 'function') return null;
  const value = headers.get('Retry-After') ?? headers.get('retry-after');
  return value == null || value === '' ? null : String(value);
}
/** Mensaje neutral del reenvio: el del servidor si vino, si no el mismo texto fijo. */
export function resendMessage(body: any): string {
  return body && typeof body.message === 'string' && body.message.trim() ? body.message : RESEND_NEUTRAL;
}

/** Aviso en el login despues de crear la cuenta (?registered=1). */
export function isRegisteredNotice(search: string): boolean {
  return new URLSearchParams(search).get('registered') === '1';
}

/** Verificacion de mail activa (alineado con MAIL_VERIFICATION_ENABLED del back, default true). */
export const MAIL_VERIFICATION_ENABLED = true;
/** Alerta al terminar el registro. */
export const REGISTERED_ALERT = 'Cuenta creada. Te enviamos un mail para verificarla.';
/** Aviso en el login con ?registered=1. */
export const REGISTERED_NOTICE = 'Te enviamos un mail para verificar tu cuenta. Verificalo y despu\u00e9s inici\u00e1 sesi\u00f3n.';
/** Mostrar 'Reenviar mail' justo despues de registrarse (solo si se manda mail). */
export const SHOW_RESEND_AFTER_REGISTER: boolean = MAIL_VERIFICATION_ENABLED;
