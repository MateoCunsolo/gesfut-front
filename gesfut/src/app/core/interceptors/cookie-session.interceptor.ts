import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Plan 22/10 #13: la sesion viaja en la cookie httpOnly GESFUT_SESSION (el JS no la ve).
 * - Se quita el header Authorization heredado de los servicios (ya no hay token en el navegador).
 * - En metodos que escriben se envia X-XSRF-TOKEN con el valor de la cookie XSRF-TOKEN (CSRF doble envio).
 */
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export const cookieSessionInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/') && !request.url.startsWith('api/')) return next(request);
  let headers = request.headers.delete('Authorization');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const xsrf = readCookie('XSRF-TOKEN');
    if (xsrf) headers = headers.set('X-XSRF-TOKEN', xsrf);
  }
  return next(request.clone({ headers, withCredentials: true }));
};
